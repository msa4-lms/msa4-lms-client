<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../../store/auth/useAuthStore";

const router = useRouter();
const authStore = useAuthStore();

const goHome = () => {
  if (authStore.isLoggedIn) {
    router.push("/main");
  } else {
    router.push("/");
  }
};

const logout = async () => {
  await authStore.logout();
  router.push("/");
};

const login = () => {
  router.push("/");
};
</script>

<template>
  <header class="header">
    <div class="header-left" @click="goHome">
      <img :src="'/로고.png'" alt="로고" class="logo" />
      <img :src="'/이름.png'" alt="대학이름" class="logo-name" />
    </div>

    <div class="header-right">
      <template v-if="authStore.isLoggedIn">
        <div class="user-info">
          <span class="user-name"
            ><strong>{{ authStore.userInfo?.name }}</strong
            >님 환영합니다</span
          >
          <span class="user-role">[{{ authStore.userInfo?.role }}]</span>
        </div>
        <button @click="logout" class="btn-logout">로그아웃</button>
      </template>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: 64px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo {
  height: 40px;
  margin-right: 12px;
}

.logo-name {
  height: 32px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  font-size: 0.9rem;
  color: #333;
  display: flex;
  gap: 8px;
  align-items: center;
}

.user-role {
  color: #1a73e8;
  font-size: 0.8rem;
  font-weight: bold;
}

.btn-login,
.btn-logout {
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-login:hover {
  background: #f0f4ff;
  border-color: #1a73e8;
  color: #1a73e8;
}

.btn-logout:hover {
  background: #fff0f0;
  border-color: #d93025;
  color: #d93025;
}
</style>
