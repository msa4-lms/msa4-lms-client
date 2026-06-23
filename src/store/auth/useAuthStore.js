import { defineStore } from "pinia";
import { ref } from "vue";
import myAxios from "../../api/myAxios";
import { useTabStore } from "../tab/useTabStore";

export const useAuthStore = defineStore("authStore", () => {
  // 1. State
  const isLoggedIn = ref(false);
  const accessToken = ref("");
  const userInfo = ref(null);

  // 3. Actions
  const clearAuthStore = () => {
    isLoggedIn.value = false;
    accessToken.value = "";
    userInfo.value = null;
    
    // 로그아웃 시 남아있는 탭 비우기
    const tabStore = useTabStore();
    tabStore.clearTabs();
  };

  const login = async (loginForm) => {
    try {
      const url = "/api/auth/login";

      const res = await myAxios.post(url, loginForm);
      if (!res.data.code || res.data.code === "00") {
        const data = res.data.data;
        accessToken.value = data.accessToken;
        userInfo.value = data.user || {
          userId: data.userId,
          loginId: data.loginId,
          name: data.name,
          role: data.role,
        };
        isLoggedIn.value = true;
      } else {
        throw new Error(res.data.message || "로그인 실패");
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const url = "/api/auth/logout";
      await myAxios.post(url);
    } catch (error) {
      console.error(error);
    } finally {
      clearAuthStore();
    }
  };

  // reissue
  const reissue = async () => {
    try {
      const url = "/api/auth/reissue-token";

      const res = await myAxios.post(url);
      const data = res.data.data;
      accessToken.value = data.accessToken;
      userInfo.value = data.user ||
        userInfo.value || {
          userId: data.userId,
          loginId: data.loginId,
          name: data.name,
          role: data.role,
        };
      isLoggedIn.value = true;
    } catch (error) {
      clearAuthStore();
      throw error;
    }
  };

  // 비밀번호 변경
  const passwordChange = async (data) => {
    try {
      const url = "/api/auth/password";

      await myAxios.post(url, data);

      return;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    isLoggedIn,
    accessToken,
    userInfo,
    clearAuthStore,
    login,
    logout,
    reissue,
    passwordChange,
  };
});
