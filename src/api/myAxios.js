import axios from "axios";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";

const myAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

myAxios.interceptors.request.use(async (config) => {
  return config;
});

export default myAxios;
