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

  if (!denyUrl.test(config.url) && authStore.isLoggedIn) {
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

  config.headers.Authorization = `Bearer ${accessToken}`;

  return config;
});

export default myAxios;
