import { defineStore } from "pinia";
import { ref } from "vue";
import myAxios from "../../api/myAxios";

export const useAuthStore = defineStore('authStore', () => {
  // 1. State
  const isLoggedIn = ref(false);
  const accessToken = ref('');
  const userInfo = ref(null);

  // 3. Actions
  const clearAuthStore = () => {
    isLoggedIn.value = false;
    accessToken.value = '';
    userInfo.value = null;
  }

  const login = async (loginForm) => {
    try {
      const url = '/api/auth/login';
      
      const res = await myAxios.post(url, loginForm);
      if (res.data.code === '00') {
        const data = res.data.data;
        accessToken.value = data.accessToken;
        userInfo.value = data.user;
        isLoggedIn.value = true;
      } else {
        throw new Error(res.data.message || '로그인 실패');
      }
    } catch (error) {
      throw error;
    }
  }

  const logout = async () => {
    try {
      const url = '/api/auth/logout';
      await myAxios.post(url);
    } catch (error) {
      console.error(error);
    } finally {
      clearAuthStore();
    }
  }

  return {
    isLoggedIn,
    accessToken,
    userInfo,
    login,
    logout
  }
});
