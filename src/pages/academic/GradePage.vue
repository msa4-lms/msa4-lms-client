<script setup>
import { onMounted, ref, computed } from 'vue';
import { useAcademicStore } from '../../store/academic/useAcademicStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import MyButton from '../../components/button/MyButton.vue';

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

    <section class="filter-section">
      <div class="filter-row">
        <div class="filter-group">
          <label>조회 연도</label>
          <select v-model="selectedYear">
            <option :value="2026">2026년</option>
            <option :value="2025">2025년</option>
            <option :value="2024">2024년</option>
            <option :value="2023">2023년</option>
          </select>
        </div>
        <div class="filter-group">
          <label>학기</label>
          <select v-model="selectedSemester">
            <option :value="1">1학기</option>
            <option :value="2">2학기</option>
          </select>
        </div>
        <MyButton btnType="button" color="deep-blue" size="small" content="조회" @click="onSearch" />
      </div>
    </section>

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
      <table class="data-table">
        <thead>
          <tr>
            <th>연도/학기</th>
            <th>학수번호</th>
            <th>교과목명</th>
            <th>학점</th>
            <th>출석률</th>
            <th>등급</th>
            <th>평점</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="academicStore.gradeSummary.semesterGrades?.length === 0">
            <td colspan="7" class="no-data">
              <div class="empty-state">
                <p>조회된 상세 성적 내역이 없습니다.</p>
              </div>
            </td>
          </tr>
          <tr v-for="(grade, idx) in academicStore.gradeSummary.semesterGrades" :key="idx">
            <td class="semester">{{ grade.year }}년 {{ grade.semester }}학기</td>
            <td class="code">{{ grade.courseCode }}</td>
            <td class="course-name">{{ grade.courseName }}</td>
            <td class="credit">{{ grade.credits }}</td>
            <td>{{ grade.attendanceRate ? grade.attendanceRate + '%' : '-' }}</td>
            <td>
              <span class="grade-badge">{{ grade.grade || '-' }}</span>
            </td>
            <td>{{ grade.gradePoint ? grade.gradePoint.toFixed(1) : '-' }}</td>
          </tr>
        </tbody>
      </table>
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

.filter-section {
  padding: 20px;
  margin-bottom: 22px;
  background: var(--personal-color-white, #fff);
  border: 1px solid #e5eaf2;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #2f3a4f;
}

.filter-group select {
  width: 220px;
  height: 38px;
  border: 1px solid #d9dee7;
  border-radius: 4px;
  padding: 8px 12px;
  background: #fff;
  color: #1f2937;
  font-size: 0.92rem;
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

.card-header h2 {
  color: #1a1f36;
  font-size: 1.1rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

.data-table th {
  background-color: #f8f9fa;
  border-bottom: 2px solid #edf2f7;
  color: #4f566b;
  font-size: 0.85rem;
  padding: 13px 16px;
  white-space: nowrap;
}

.data-table td {
  border-bottom: 1px solid #edf2f7;
  color: #334155;
  font-size: 0.9rem;
  padding: 14px 16px;
}

.data-table tr:last-child td {
  border-bottom: 0;
}

.semester {
  color: #1e293b;
  font-weight: 600;
}

.code {
  color: #64748b;
  font-family: monospace;
}

.course-name {
  color: #1a1f36;
  font-weight: 700;
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
  color: #0b3d91;
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
</style>

