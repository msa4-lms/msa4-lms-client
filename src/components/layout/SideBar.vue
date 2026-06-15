<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <router-link to="/main" class="nav-item">대시보드</router-link>
      <router-link to="/lectures" class="nav-item">강의 조회</router-link>
      <router-link to="/enrollments" class="nav-item">수강 내역</router-link>
      <router-link to="/registration" class="nav-item">수강 신청</router-link>
      <router-link to="/grade" class="nav-item">성적 조회</router-link>
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
