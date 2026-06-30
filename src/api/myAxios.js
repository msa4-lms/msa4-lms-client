import axios from "axios";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "../store/auth/useAuthStore";

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
    const expTime = dayjs.unix(claims.exp).add(-5, "minute").unix();

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
  (error) => {
    const authStore = useAuthStore();
    const status = error.response ? error.response.status : null;
    const errorData = error.response ? error.response.data : null;
    const originalUrl = error.config ? error.config.url : "";
    const suppressErrorAlert = Boolean(error.config?.suppressErrorAlert);

    // reissue-token 요청이 실패한 경우는 조용히 넘김 (무한 루프 방지)
    if (originalUrl.includes("/api/auth/reissue-token") && status === 401) {
      return Promise.reject(error);
    }

    if (status === 401) {
      // 인증 실패/세션 만료 → 로그아웃 후 로그인 화면으로
      if (!suppressErrorAlert) {
        alert(errorData?.data || "세션이 만료되었습니다. 다시 로그인해주세요.");
      }
      authStore.clearAuthStore();
      window.location.href = "/";
    } else if (status === 403) {
      // 권한 없는 요청 → 세션은 유지하고 안내만 표시
      if (!suppressErrorAlert) {
        alert(errorData?.data || "접근 권한이 없습니다.");
      }
    } else if (status === 400) {
      // 잘못된 요청 (Validation 에러 등)
      let msg = errorData?.message || "잘못된 요청입니다.";
      if (errorData?.data && typeof errorData.data === "object") {
        msg = Object.values(errorData.data).join("\n");
      } else if (errorData?.data && errorData.data !== errorData.message) {
        msg = errorData.data;
      }
      if (!suppressErrorAlert) {
        alert(msg);
      }
    } else if (status === 500) {
      // 서버 에러 - 백엔드에서 보낸 상세 에러가 있다면 표시
      const detailMsg = errorData?.data || "서버 내부 오류가 발생했습니다.";
      if (!suppressErrorAlert) {
        alert(`서버 오류: ${detailMsg}\n잠시 후 다시 시도해주세요.`);
      }
    } else {
      // 네트워크 에러 등 기타 상황
      console.error("API 통신 에러:", error);
    }

    return Promise.reject(error);
  }
);

export default myAxios;
