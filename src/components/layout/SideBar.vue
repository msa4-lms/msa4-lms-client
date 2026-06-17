<script setup>
import { useAuthStore } from '../../store/auth/useAuthStore';

const authStore = useAuthStore();
</script>

<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <router-link to="/main" class="nav-item">대시보드</router-link>
      <router-link to="/lectures" class="nav-item">강의 조회</router-link>
      
      <!-- 학생 전용 메뉴 -->
      <template v-if="authStore.userInfo?.role === 'STUDENT'">
        <router-link to="/enrollments" class="nav-item">수강 내역</router-link>
        <router-link to="/registration" class="nav-item">수강 신청</router-link>
        <router-link to="/grade" class="nav-item">성적 조회</router-link>
        <router-link to="/attendance" class="nav-item">출결 현황</router-link>
        <router-link to="/profile" class="nav-item">내 정보</router-link>
      </template>

      <!-- 교수 전용 메뉴 -->
      <template v-if="authStore.userInfo?.role === 'PROFESSOR'">
        <router-link to="/lectures/manage" class="nav-item">강의 관리</router-link>
        <router-link to="/students" class="nav-item">학생 관리</router-link>
        <router-link to="/attendance" class="nav-item">출결 관리</router-link>
        <router-link to="/profile" class="nav-item">내 정보</router-link>
      </template>

      <!-- 관리자 전용 메뉴 -->
      <template v-if="authStore.userInfo?.role === 'ADMIN'">
        <router-link to="/students" class="nav-item">사용자 관리</router-link>
        <router-link to="/profile" class="nav-item">내 정보</router-link>
      </template>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  background-color: #fff;
  border-right: 1px solid #eee;
  padding-top: 20px;
  height: calc(100vh - 64px);
  position: sticky;
  top: 64px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.nav-item {
  padding: 14px 24px;
  text-decoration: none;
  color: #5f6368;
  font-weight: 500;
  transition: background 0.2s;
}

.nav-item:hover {
  background-color: #f8f9fa;
  color: #1a73e8;
}

.router-link-active {
  background-color: #e8f0fe;
  color: #1a73e8;
  border-right: 4px solid #1a73e8;
}
</style>
