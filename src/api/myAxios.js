import axios from "axios";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
// import { useAuthStore } from "../store/auth/useAuthStore"; // AuthStore 생성 후 주석 해제

const myAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

myAxios.interceptors.request.use(async (config) => {
  // TODO: AuthStore 연동 및 토큰 갱신 로직 구현 (meerkatgram 참고)
  /*
  const authStore = useAuthStore();
  let accessToken = authStore.accessToken;
  const denyUrl = /^\/api\/reissue-token$/;

  if(!denyUrl.test(config.url) && authStore.isLoggedIn) {
    const claims = jwtDecode(accessToken);
    const now = dayjs().unix();
    const expTime = dayjs.unix(claims.exp).add(-5, 'minute').unix();
    
    if(now >= expTime) {
      try {
        await authStore.reissue();
        accessToken = authStore.accessToken;
      } catch (error) {
        console.error(error);
      }
    }
  }

  if(accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  */
  
  return config;
});

export default myAxios;
