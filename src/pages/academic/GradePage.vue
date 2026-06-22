<script setup>
import { onMounted, ref, computed } from 'vue';
import { useAcademicStore } from '../../store/academic/useAcademicStore';
import { useAuthStore } from '../../store/auth/useAuthStore';

const academicStore = useAcademicStore();
const authStore = useAuthStore();

const now = new Date();
const currentYear = now.getFullYear();
const currentSemester = now.getMonth() + 1 >= 1 && now.getMonth() + 1 <= 6 ? 1 : 2;

// select 박스에 바인딩된 값 (사용자가 변경하는 값)
const selectedYear = ref(currentYear);
const selectedSemester = ref(currentSemester);

// '조회' 버튼을 눌렀을 때 확정되는 값
const searchedYear = ref(currentYear);
const searchedSemester = ref(currentSemester);

const onSearch = () => {
  // 조회 버튼 클릭 시에만 검색된 연도/학기 상태 업데이트 및 API 호출
  searchedYear.value = selectedYear.value;
  searchedSemester.value = selectedSemester.value;
  
  academicStore.fetchGrades({
    year: searchedYear.value,
    semester: searchedSemester.value
  });
};

onMounted(() => {
  if (authStore.isLoggedIn) {
    onSearch(); // 초기 마운트 시 현재 연도/학기로 조회
  }
});
</script>

<template>
  <div class="grade-view">
    <div class="header-section">
      <h1>성적 조회</h1>
      <p>원하는 연도와 학기를 선택하여 해당 학기의 성적과 평점을 확인하세요.</p>
    </div>

    <!-- 검색 바 -->
    <div class="search-section">
      <div class="search-row">
        <div class="search-group">
          <label>연도</label>
          <!-- v-model은 selectedYear에 연결되어 화면 값만 바뀜 -->
          <select v-model="selectedYear">
            <option :value="2026">2026년</option>
            <option :value="2025">2025년</option>
            <option :value="2024">2024년</option>
            <option :value="2023">2023년</option>
            <option :value="2022">2022년</option>
            <option :value="2021">2021년</option>
          </select>
        </div>
        <div class="search-group">
          <label>학기</label>
          <select v-model="selectedSemester">
            <option :value="1">1학기</option>
            <option :value="2">2학기</option>
          </select>
        </div>
        <button class="btn-search" @click="onSearch">조회</button>
      </div>
    </div>
    
    <!-- 요약 대시보드 (조회 버튼을 눌러 확정된 searchedYear 표시) -->
    <div class="dashboard-grid">
      <div class="summary-card gpa-card">
        <div class="card-info">
          <span class="label">{{ searchedYear }}년 {{ searchedSemester }}학기 평균 평점</span>
          <div class="value-group">
            <span class="value">{{ academicStore.gradeSummary.totalGpa }}</span>
            <span class="max">/ 4.5</span>
          </div>
        </div>
      </div>

      <div class="summary-card credits-card">
        <div class="card-info">
          <span class="label">{{ searchedYear }}년 {{ searchedSemester }}학기 이수 학점</span>
          <div class="value-group">
            <span class="value">{{
              academicStore.gradeSummary.totalCredits
            }}</span>
            <span class="unit">학점</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 상세 성적 테이블 -->
    <div class="content-card table-section">
      <div class="card-header">
        <h3>{{ searchedYear }}년 {{ searchedSemester }}학기 상세 성적</h3>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>과목코드</th>
              <th>과목명</th>
              <th>학점</th>
              <th>등급</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(grade, index) in academicStore.gradeSummary.semesterGrades" :key="index">
              <td class="code">{{ grade.courseCode }}</td>
              <td class="name">{{ grade.courseName }}</td>
              <td class="credit">{{ grade.credits }}</td>
              <td class="grade">
                <span :class="['grade-badge', grade.grade?.startsWith('A') ? 'high' : grade.grade?.startsWith('B') ? 'mid' : 'low']">
                  {{ grade.grade || '미입력' }}
                </span>
              </td>
              <td class="status">
                <span class="status-badge" :class="{ confirmed: grade.grade && grade.grade !== '미입력' }">
                  {{ grade.grade && grade.grade !== '미입력' ? '공개(확정)' : '미공개' }}
                </span>
              </td>
            </tr>
            <tr v-if="!academicStore.gradeSummary.semesterGrades || academicStore.gradeSummary.semesterGrades.length === 0">
              <td colspan="5" class="no-data">
                <div class="empty-state">
                  <p>해당 학기에 조회된 성적 내역이 없습니다.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grade-view {
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 32px;
}

.header-section h1 {
  color: #1a1f36;
  font-size: 1.8rem;
  margin-bottom: 8px;
}

.header-section p {
  color: #697386;
}

/* 검색 섹션 */
.search-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #edf2f7;
  margin-bottom: 24px;
}

.search-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.search-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #4f566b;
}

.search-group input, .search-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.btn-search {
  padding: 8px 24px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  height: 38px;
}

.btn-search:hover {
  background-color: #1557b0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  align-items: center;
  border: 1px solid #edf2f7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-info {
  display: flex;
  flex-direction: column;
}

.label {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.value-group {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.value {
  color: #1e293b;
  font-size: 2rem;
  font-weight: 800;
}

.max,
.unit {
  color: #94a3b8;
  font-size: 1rem;
  font-weight: 500;
}

.content-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #edf2f7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #edf2f7;
}

.card-header h3 {
  color: #1a1f36;
  font-size: 1.1rem;
}

.semester {
  color: #1e293b;
  font-weight: 600;
}

.code {
  color: #64748b;
  font-family: monospace;
}

.credit {
  font-weight: 500;
}

.grade-badge {
  display: inline-flex;
  padding: 4px 0px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
}

.status-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 4px;
  background: #f1f5f9;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.confirmed {
  background: #e0e7ff;
  color: #4338ca;
}

.no-data {
  padding: 60px 0;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-state p {
  color: #64748b;
  line-height: 1.6;
}

.empty-state small {
  font-size: 0.8rem;
  color: #94a3b8;
}
</style>

