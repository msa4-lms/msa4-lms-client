<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const menuItems = [
  {
    title: '강의 조회',
    description: '개설된 모든 강의를 검색하고 상세 정보를 확인합니다.',
    icon: '📚',
    path: '/lectures',
    color: '#e8f0fe'
  },
  {
    title: '수강 내역',
    description: '이번 학기 내가 신청한 수강 목록과 총 학점을 확인합니다.',
    icon: '📋',
    path: '/enrollments',
    color: '#fff9db'
  },
  {
    title: '수강 신청',
    description: '원하는 강의를 신청하고 내 수강 목록을 관리합니다.',
    icon: '📝',
    path: '/registration',
    color: '#e6fffa'
  },
  {
    title: '성적 조회',
    description: '이번 학기 및 지난 학기의 성적을 확인합니다.',
    icon: '📊',
    path: '/grade',
    color: '#fff5f5'
  },
  {
    title: '내 정보',
    description: '개인 정보 및 비밀번호를 관리합니다.',
    icon: '👤',
    path: '/profile',
    color: '#f3f0ff'
  }
];

const navigateTo = (path) => {
  router.push(path);
};
</script>

<template>
  <div class="main-view">
    <div class="welcome-section">
      <h1>안녕하세요, 학사관리 시스템입니다.</h1>
      <p>원하시는 메뉴를 선택하여 업무를 진행해 주세요.</p>
    </div>

    <div class="card-grid">
      <div 
        v-for="item in menuItems" 
        :key="item.title" 
        class="menu-card"
        @click="navigateTo(item.path)"
      >
        <div class="card-icon" :style="{ backgroundColor: item.color }">
          {{ item.icon }}
        </div>
        <div class="card-content">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-view {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  margin-bottom: 40px;
}

.welcome-section h1 {
  font-size: 1.8rem;
  color: #1a1f36;
  margin-bottom: 8px;
}

.welcome-section p {
  color: #697386;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.menu-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #edf2f7;
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #1a73e8;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.card-content h3 {
  font-size: 1.2rem;
  color: #1a1f36;
  margin-bottom: 8px;
}

.card-content p {
  font-size: 0.95rem;
  color: #4f566b;
  line-height: 1.5;
}
</style>
