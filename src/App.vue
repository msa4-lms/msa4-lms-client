<script setup>
import { useRoute } from "vue-router";
import Header from "./components/layout/Header.vue";
import SideBar from "./components/layout/SideBar.vue";
import TabBar from "./components/layout/TabBar.vue";
import AppDialog from "./components/common/AppDialog.vue";
import { useTabStore } from "./store/tab/useTabStore";

const route = useRoute();
const tabStore = useTabStore();
</script>

<template>
  <div class="app-container">
    <Header />
    <div class="main-layout">
      <!-- 로그인 화면(/)에서는 사이드바를 숨깁니다 -->
      <SideBar v-if="route.path !== '/'" />
      <!-- 로그인 화면일 경우 패딩을 없애거나 다르게 줄 수 있습니다 -->
      <div class="content-wrapper">
        <TabBar v-if="route.path !== '/'" />
        <main
          class="content"
          :style="{ padding: route.path === '/' ? '0' : '32px' }"
        >
          <router-view v-slot="{ Component, route }">
            <keep-alive :include="tabStore.tabs.map(t => t.name)">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </router-view>
        </main>
      </div>
    </div>
    <AppDialog />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Noto Sans KR", sans-serif;
  background-color: #f5f7fa;
  color: #333;
}
.app-container {
  min-height: 100vh;
}

.main-layout {
  display: flex;
  height: calc(100vh - 64px); /* Header 높이에 맞게 수정 */
  overflow: hidden;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.content {
  flex: 1;
  padding: 32px;
  background-color: #f5f7fa;
  overflow-y: auto;
}
</style>
