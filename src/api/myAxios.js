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
  const authStore = useAuthStore();
  const accessToken = authStore.accessToken; 
  const denyUrl = /^\/api\/reissue-token$/;

  if (accessToken && !denyUrl.test(config.url) && authStore.isLoggedIn) {
    const claims = jwtDecode(accessToken);
    const now = dayjs().unix();
    const expTime = dayjs.unix(claims.exp).add(-5, "minute").unix();

    if (now >= expTime) {
      try {
        await authStore.reissue();
        accessToken = authStore.accessToken;
      } catch (error) {
        console.error(error?.response);
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

    // reissue-token 요청이 실패한 경우는 조용히 넘김 (무한 루프 방지)
    if (originalUrl.includes("/api/reissue-token") && status === 401) {
      return Promise.reject(error);
    }

    if (status === 401 || status === 403) {
      // 인증 및 권한 에러 처리
      alert(errorData?.data || "접근 권한이 없거나 세션이 만료되었습니다.");
      authStore.logout();
      window.location.href = "/";
    } else if (status === 400 || status === 409 || status === 404) {
      // 잘못된 요청, 중복 데이터, 찾을 수 없는 데이터 처리
      let msg = errorData?.message || "요청을 처리할 수 없습니다.";
      if (errorData?.data && typeof errorData.data === 'object') {
        msg += "\n" + Object.values(errorData.data).join("\n");
      } else if (errorData?.data && errorData.data !== errorData.message) {
        msg += "\n" + errorData.data;
      }
      alert(msg);
    } else if (status === 500) {
      // 서버 에러
      alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } else {
      // 네트워크 에러 등 기타 상황
      console.error("API 통신 에러:", error);
    }

    return Promise.reject(error);
  }
);

export default myAxios;
