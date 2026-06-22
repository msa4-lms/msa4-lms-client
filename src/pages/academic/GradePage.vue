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

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await academicStore.fetchGrades();
  }
});
</script>

<template>
  <div class="grade-page">
    <div class="page-heading">
      <h2>성적 조회</h2>
      <p>확정된 성적 및 전체 평균 평점(GPA)을 확인할 수 있습니다.</p>
    </div>

    <div class="summary-grid">
      <section class="summary-card">
        <span>전체 평균 평점 (GPA)</span>
        <strong>{{ academicStore.gradeSummary.totalGpa }} <small>/ 4.5</small></strong>
      </section>

      <section class="summary-card">
        <span>총 이수 학점</span>
        <strong>{{ academicStore.gradeSummary.totalCredits }} <small>학점</small></strong>
      </section>
    </div>

    <!-- 상세 성적 테이블 -->
    <div class="content-card table-section">
      <div class="card-header">
        <h2>학기별 상세 성적</h2>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grade-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  color: var(--primary-text-color);
}

.page-heading {
  padding-bottom: 10px;
}

.page-heading h2 {
  margin-bottom: 8px;
  color: var(--primary-text-color);
  letter-spacing: 0;
  font-size: 1.5rem;
}

.page-heading p {
  color: var(--primary-text-color);
  font-size: 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 22px;
}

.summary-card {
  padding: 18px 20px;
  background: var(--personal-color-white, #fff);
  border: 1px solid #e5eaf2;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

.summary-card span {
  color: #64748b;
  font-size: 0.88rem;
  font-weight: 700;
}

.summary-card strong {
  display: block;
  margin-top: 10px;
  color: #071f49;
  font-size: 1.7rem;
}

.summary-card strong small {
  color: #94a3b8;
  font-size: 1rem;
  font-weight: 500;
  margin-left: 4px;
}

.content-card {
  background: var(--personal-color-white, #fff);
  border: 1px solid #e5eaf2;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.card-header {
  padding: 18px 20px;
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
  align-items: center;
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 0.82rem;
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

