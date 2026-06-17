<script setup>
import { onMounted } from 'vue';
import { useAcademicStore } from '../../store/academic/useAcademicStore';
import { useAuthStore } from '../../store/auth/useAuthStore';

const academicStore = useAcademicStore();
const authStore = useAuthStore();

onMounted(() => {
  // 로그인한 사용자의 PK를 사용하여 성적 조회
  if (authStore.userInfo && authStore.userInfo.id) {
    academicStore.fetchGrades(authStore.userInfo.id);
  }
});
</script>

<template>
  <div class="grade-view">
    <div class="header-section">
      <h1>내 성적 조회</h1>
      <p>확정된 성적 및 전체 평균 평점(GPA)을 확인할 수 있습니다.</p>
    </div>
    
    <!-- 요약 대시보드 (팀의 카드 스타일 적용) -->
    <div class="dashboard-grid">
      <div class="summary-card gpa-card">
        <div class="card-icon">📊</div>
        <div class="card-info">
          <span class="label">전체 평균 평점 (GPA)</span>
          <div class="value-group">
            <span class="value">{{ academicStore.gradeSummary.totalGpa }}</span>
            <span class="max">/ 4.5</span>
          </div>
        </div>
      </div>

      <div class="summary-card credits-card">
        <div class="card-icon">🎓</div>
        <div class="card-info">
          <span class="label">총 이수 학점</span>
          <div class="value-group">
            <span class="value">{{ academicStore.gradeSummary.totalCredits }}</span>
            <span class="unit">학점</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 상세 성적 테이블 (팀의 테이블 스타일 적용) -->
    <div class="content-card table-section">
      <div class="card-header">
        <h3>학기별 상세 성적</h3>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>년도/학기</th>
              <th>과목코드</th>
              <th>과목명</th>
              <th>학점</th>
              <th>등급</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(grade, index) in academicStore.gradeSummary.semesterGrades" :key="index">
              <td class="semester">{{ grade.year }}년 {{ grade.semester }}학기</td>
              <td class="code">{{ grade.courseCode }}</td>
              <td class="name">{{ grade.courseName }}</td>
              <td class="credit">{{ grade.credits }}</td>
              <td class="grade">
                <span :class="['grade-badge', grade.grade.startsWith('A') ? 'high' : grade.grade.startsWith('B') ? 'mid' : 'low']">
                  {{ grade.grade }}
                </span>
              </td>
              <td class="status">
                <span class="status-badge" :class="{ confirmed: grade.grade !== '미입력' }">
                  {{ grade.grade !== '미입력' ? '공개(확정)' : '미공개' }}
                </span>
              </td>
            </tr>
            <tr v-if="academicStore.gradeSummary.semesterGrades.length === 0">
              <td colspan="6" class="no-data">
                <div class="empty-state">
                  <span class="empty-icon">📂</span>
                  <p>조회된 성적 내역이 없습니다.<br><small>성적 확정 전이거나 수강 완료된 과목이 없습니다.</small></p>
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
  font-size: 1.8rem;
  color: #1a1f36;
  margin-bottom: 8px;
}

.header-section p {
  color: #697386;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid #edf2f7;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  background: #f8fafc;
}

.gpa-card .card-icon { background-color: #eef2ff; }
.credits-card .card-icon { background-color: #ecfdf5; }

.card-info {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 4px;
}

.value-group {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.value {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
}

.max, .unit {
  font-size: 1rem;
  color: #94a3b8;
  font-weight: 500;
}

.content-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #edf2f7;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #edf2f7;
}

.card-header h3 {
  font-size: 1.1rem;
  color: #1a1f36;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8fafc;
  padding: 14px 24px;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #edf2f7;
}

.data-table td {
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 0.95rem;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.semester { font-weight: 600; color: #1e293b; }
.code { font-family: monospace; color: #64748b; }
.credit, .point { font-weight: 500; }

.grade-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}

.grade-badge.high { background: #ecfdf5; color: #059669; }
.grade-badge.mid { background: #eff6ff; color: #2563eb; }
.grade-badge.low { background: #fef2f2; color: #dc2626; }

.status-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #94a3b8;
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

.empty-icon {
  font-size: 40px;
  opacity: 0.5;
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
