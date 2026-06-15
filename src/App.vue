<script setup>
import { useRoute } from 'vue-router';
import Header from './components/layout/Header.vue';
import SideBar from './components/layout/SideBar.vue';

const route = useRoute();
</script>

<template>
  <div class="app-container">
    <Header />
    <div class="main-layout">
      <!-- 로그인 화면(/)에서는 사이드바를 숨깁니다 -->
      <SideBar v-if="route.path !== '/'" />
      
      <!-- 로그인 화면일 경우 패딩을 없애거나 다르게 줄 수 있습니다 -->
      <main class="content" :style="{ padding: route.path === '/' ? '0' : '32px' }">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Noto Sans KR', sans-serif;
  background-color: #f5f7fa;
  color: #333;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-layout {
  display: flex;
  flex: 1;
}

.content {
  flex: 1;
  padding: 32px;
  background-color: #f5f7fa;
}
</style>
