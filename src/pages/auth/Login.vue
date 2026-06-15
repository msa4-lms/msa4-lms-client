<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();
const userNo = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  if (!userNo.value || !password.value) {
    errorMessage.value = '학번과 비밀번호를 모두 입력해 주세요.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await authStore.login({
      userNo: userNo.value,
      password: password.value,
      role: 'STUDENT'
    });

    // 로그인 성공 시 메인 페이지로 이동
    router.push('/main');
  } catch (error) {
    console.error('로그인 에러:', error);
    errorMessage.value = error.message || '서버 통신 중 오류가 발생했습니다.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>학사관리 시스템</h2>
        <p>서비스 이용을 위해 로그인해 주세요.</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="userNo">학번 (ID)</label>
          <input 
            v-model="userNo" 
            type="text" 
            id="userNo" 
            placeholder="학번을 입력하세요" 
            required
            :disabled="isLoading"
          >
        </div>

        <div class="form-group">
          <label for="password">비밀번호</label>
          <input 
            v-model="password" 
            type="password" 
            id="password" 
            placeholder="비밀번호를 입력하세요" 
            required
            :disabled="isLoading"
          >
        </div>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <button type="submit" class="btn-login" :disabled="isLoading">
          {{ isLoading ? '로그인 중...' : '로그인' }}
        </button>
      </form>

      <div class="login-footer">
        <p>계정 정보 분실 시 학사지원팀으로 문의바랍니다.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 150px); /* 헤더 높이 등을 고려한 여백 */
  background-color: #f4f7f9;
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h2 {
  font-size: 1.5rem;
  color: #1a73e8;
  margin-bottom: 8px;
}

.login-header p {
  color: #697386;
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #4f566b;
}

.form-group input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #1a73e8;
  outline: none;
}

.error-text {
  color: #d93025;
  font-size: 0.85rem;
  margin: 0;
}

.btn-login {
  background-color: #1a73e8;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;
}

.btn-login:hover {
  background-color: #1557b0;
}

.btn-login:disabled {
  background-color: #accfff;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 32px;
  text-align: center;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.login-footer p {
  font-size: 0.8rem;
  color: #999;
}
</style>
