<script setup>
import { onMounted } from "vue";
import { useAcademicStore } from "../../store/academic/useAcademicStore";
import { useAuthStore } from "../../store/auth/useAuthStore";
import MyTable from "../../components/table/MyTable.vue";

const academicStore = useAcademicStore();
const authStore = useAuthStore();

const gradeColumns = [
  { key: "semester", label: "연도/학기" },
  { key: "courseCode", label: "과목코드" },
  { key: "courseName", label: "과목명" },
  { key: "credits", label: "학점" },
  { key: "grade", label: "등급" },
  { key: "status", label: "상태" },
];

const isConfirmedGrade = (grade) => grade.grade !== "미입력";

const getGradeLevel = (grade) => {
  if (grade.startsWith("A")) return "high";
  if (grade.startsWith("B")) return "mid";
  return "low";
};

onMounted(() => {
  if (authStore.isLoggedIn) {
    await academicStore.fetchGrades();
  }
});
</script>

<template>
  <div class="grade-view">
    <div class="header-section">
      <h1>성적 조회</h1>
      <p>확정된 성적 및 전체 평균 평점(GPA)을 확인할 수 있습니다.</p>
    </div>

    <div class="dashboard-grid">
      <div class="summary-card gpa-card">
        <div class="card-info">
          <span class="label">전체 평균 평점 (GPA)</span>
          <div class="value-group">
            <span class="value">{{ academicStore.gradeSummary.totalGpa }}</span>
            <span class="max">/ 4.5</span>
          </div>
        </div>
      </div>

      <div class="summary-card credits-card">
        <div class="card-info">
          <span class="label">총 이수 학점</span>
          <div class="value-group">
            <span class="value">{{
              academicStore.gradeSummary.totalCredits
            }}</span>
            <span class="unit">학점</span>
          </div>
        </div>
      </div>
    </div>

    <div class="content-card table-section">
      <div class="card-header">
        <h2>학기별 상세 성적</h2>
      </div>

      <MyTable
        :columns="gradeColumns"
        :empty="academicStore.gradeSummary.semesterGrades.length === 0"
        emptyMessage="조회된 성적 내역이 없습니다."
      >
        <tr
          v-for="(grade, index) in academicStore.gradeSummary.semesterGrades"
          :key="index"
        >
          <td class="semester">{{ grade.year }}년 {{ grade.semester }}학기</td>
          <td class="code">{{ grade.courseCode }}</td>
          <td class="name">{{ grade.courseName }}</td>
          <td class="credit">{{ grade.credits }}</td>
          <td class="grade">
            <span :class="['grade-badge', getGradeLevel(grade.grade)]">
              {{ grade.grade }}
            </span>
          </td>
          <td class="status">
            <span
              class="status-badge"
              :class="{ confirmed: isConfirmedGrade(grade) }"
            >
              {{ isConfirmedGrade(grade) ? "공개(확정)" : "미공개" }}
            </span>
          </td>
        </tr>
      </MyTable>
    </div>
  </div>
</template>

<style scoped>
.grade-view {
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 28px;
}

.header-section h1 {
  color: #1a1f36;
  font-size: 1.8rem;
  margin-bottom: 8px;
}

.header-section p {
  color: #697386;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  background: white;
  border: 1px solid #edf2f7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #f8fafc;
  font-size: 0.85rem;
  font-weight: 800;
}

.gpa-card .card-icon {
  background-color: #eef2ff;
}

.credits-card .card-icon {
  background-color: #ecfdf5;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  border: 1px solid #edf2f7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
}

.grade-badge.high {
  background: #ecfdf5;
  color: #059669;
}

.grade-badge.mid {
  background: #eff6ff;
  color: #2563eb;
}

.grade-badge.low {
  background: #fef2f2;
  color: #dc2626;
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
</style>
