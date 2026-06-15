<script setup>
</script>

<template>
  <div class="home-container">
    <h1>LMS 학사관리 시스템</h1>
    <p>기초 설정이 완료되었습니다. 확인해주십시오.</p>
    
    <router-link to="/enrollment" class="nav-button">
      내 수강 내역 보러가기
    </router-link>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

/* [추가됨] 이동 버튼 스타일 */
.nav-button {
  margin-top: 30px;
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.1rem;
  transition: background-color 0.3s, transform 0.1s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.nav-button:hover {
  background-color: #0056b3;
  transform: translateY(-2px); /* 마우스 올렸을 때 살짝 위로 뜨는 효과 */
}

.nav-button:active {
  transform: translateY(0);
}
</style>
