import axios from "axios";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "../store/auth/useAuthStore";
import { notify } from "../composables/useDialog";
import { TOKEN_REFRESH_MARGIN_MINUTES, LOGIN_PATH } from "../constants/app";

const myAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

myAxios.interceptors.request.use(async (config) => {
  if (config.method === "get") {
    config.params = {
      ...config.params,
      _t: new Date().getTime(),
    };
  }

  const authStore = useAuthStore();
  let accessToken = authStore.accessToken;
  const isReissueUrl = /^\/api\/auth\/reissue-token$/.test(config.url || "");

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  if (isReissueUrl) {
    delete config.headers.Authorization;
    return config;
  }

  if (accessToken && authStore.isLoggedIn) {
    const claims = jwtDecode(accessToken);
    const now = dayjs().unix();
    const expTime = dayjs.unix(claims.exp).add(-TOKEN_REFRESH_MARGIN_MINUTES, "minute").unix();

    if (now >= expTime) {
      try {
        await authStore.reissue();
        accessToken = authStore.accessToken;
      } catch (error) {
        console.error(error?.response);
        authStore.clearAuthStore();
        throw error;
      }
    }
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

// Response Interceptor for Global Error Handling
myAxios.interceptors.response.use(
  (response) => {
    // 200번대 응답은 그대로 반환
    return response;
  },
  async (error) => {
    const authStore = useAuthStore();
    const status = error.response ? error.response.status : null;
    const errorData = error.response ? error.response.data : null;
    const originalUrl = error.config ? error.config.url : "";
    const suppressErrorAlert = Boolean(error.config?.suppressErrorAlert);

    // reissue-token 또는 login 요청이 실패한 경우는 글로벌 401 처리를 하지 않음 (무한 루프 방지 및 폼 에러 처리 위임)
    if ((originalUrl.includes("/api/auth/reissue-token") || originalUrl.includes("/api/auth/login")) && status === 401) {
      return Promise.reject(error);
    }

    const isBlobResponse = error.config?.responseType === "blob";

    // 백엔드 GlobalRes(code/message/data)에서 사용자용 메시지 추출
    const buildMessage = () => {
      if (errorData && typeof errorData.data === "object" && errorData.data !== null) {
        // 필드 검증 에러(E21) 등: 값들을 줄바꿈으로 합침
        return Object.values(errorData.data).join("\n");
      }
      if (errorData?.message) return errorData.message;
      if (typeof errorData?.data === "string") return errorData.data;
      if (status && status >= 500) return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      return "요청을 처리하지 못했습니다.";
    };

    // blob 다운로드 등은 에러 본문이 JSON이 아니므로 인터셉터에서 알리지 않고 호출부에 위임
    const canAlert = !suppressErrorAlert && !isBlobResponse;

    if (status === 401) {
      // 인증 실패/세션 만료 → 로그아웃 후 로그인 화면으로
      if (canAlert) {
        await notify(errorData?.message || "세션이 만료되었습니다. 다시 로그인해주세요.");
      }
      authStore.clearAuthStore();
      window.location.href = LOGIN_PATH;
    } else if (error.response) {
      // 그 외 모든 에러 응답(403/404/409/413/500 등): 백엔드 메시지로 일원화
      if (canAlert) await notify(buildMessage());
    } else {
      // 응답 없음(네트워크/타임아웃 등)
      if (canAlert) await notify("네트워크 연결을 확인해주세요. 잠시 후 다시 시도해주세요.");
      console.error("API 통신 에러:", error);
    }

    return Promise.reject(error);
  }
);

export default myAxios;
