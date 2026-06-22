<script setup>
import { ref, onMounted } from "vue";
import { useAcademicStore } from "../../store/academic/useAcademicStore";
import { useAuthStore } from "../../store/auth/useAuthStore";
import MyTable from "../../components/table/MyTable.vue";
import MyButton from "../../components/button/MyButton.vue";

const academicStore = useAcademicStore();
const authStore = useAuthStore();

const gradeColumns = [
  { key: "semester", label: "연도/학기" },
  { key: "courseCode", label: "과목코드" },
  { key: "courseName", label: "과목명" },
  { key: "credits", label: "학점" },
  { key: "grade", label: "등급" },
];

const isConfirmedGrade = (grade) => grade.status != null;

const getGradeLevel = (grade) => {
  if (!grade) return "low";
  if (grade.startsWith("A")) return "high";
  if (grade.startsWith("B")) return "mid";
  return "low";
};

// 진행 상태 표시 매핑
const formatStatus = (status) => {
  const map = {
    DRAFT: "임시저장",
    SUBMITTED: "제출완료",
    OPENED: "공개됨",
    OBJECTION: "이의신청 중",
    APPROVED: "정정승인",
    FINAL: "최종확정",
  };
  return map[status] || "미공개";
};

onMounted(() => {
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
            <span v-if="isConfirmedGrade(grade)" :class="['grade-badge', getGradeLevel(grade.grade)]">
              {{ grade.grade }}
            </span>
            <span v-else class="text-secondary">미입력</span>
          </td>

        </tr>
      </MyTable>
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
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid #edf2f7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-info {
  display: flex;
  flex-direction: column;
}

.label {
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
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.status-badge.draft {
  background: #f1f5f9;
  color: #64748b;
}

.status-badge.submitted {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.status-badge.opened {
  background: #fffbeb;
  color: #d97706;
  border-color: #fde68a;
}

.status-badge.objection {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fca5a5;
}

.status-badge.approved {
  background: #ecfdf5;
  color: #059669;
  border-color: #a7f3d0;
}

.status-badge.final {
  background: #e0e7ff;
  color: #4338ca;
  border-color: #c7d2fe;
}

.text-secondary {
  color: #94a3b8;
}

/* 모달 디자인 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal-card {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  padding: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-card h2 {
  font-size: 1.3rem;
  margin-bottom: 20px;
  border-bottom: 1px solid #edf2f7;
  padding-bottom: 12px;
  text-align: left;
  color: #1a1f36;
  font-weight: 700;
}

.modal-body {
  margin-bottom: 24px;
  text-align: left;
}

.modal-desc {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 12px;
  line-height: 1.5;
}

.form-textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

