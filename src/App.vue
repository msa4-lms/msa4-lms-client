<script setup>
import Header from './components/layout/Header.vue';
import SideBar from './components/layout/SideBar.vue';
</script>

<template>
  <div class="app-container">
    <Header />
    <div class="main-layout">
      <SideBar />
      <main class="content">
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
