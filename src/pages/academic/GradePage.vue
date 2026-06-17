<script setup>
import { onMounted } from 'vue';
import { useAcademicStore } from '../../store/academic/useAcademicStore';

const academicStore = useAcademicStore();

onMounted(() => {
  // TODO: 실제 로그인한 사용자의 ID를 사용해야 함 (임시로 501번 학생 사용)
  academicStore.fetchGrades(501);
});
</script>

<template>
  <div class="grade-container">
    <h1>내 성적 조회</h1>
    
    <!-- 요약 대시보드 -->
    <div class="summary-card">
      <div class="summary-item">
        <span class="label">전체 평균 평점</span>
        <span class="value gpa">{{ academicStore.gradeSummary.totalGpa }} / 4.5</span>
      </div>
      <div class="summary-item">
        <span class="label">총 이수 학점</span>
        <span class="value">{{ academicStore.gradeSummary.totalCredits }} 학점</span>
      </div>
    </div>

    <!-- 상세 성적 테이블 -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>년도/학기</th>
            <th>과목코드</th>
            <th>과목명</th>
            <th>학점</th>
            <th>성적</th>
            <th>평점</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(grade, index) in academicStore.gradeSummary.semesterGrades" :key="index">
            <td>{{ grade.year }}년 {{ grade.semester }}학기</td>
            <td>{{ grade.courseCode }}</td>
            <td>{{ grade.courseName }}</td>
            <td>{{ grade.credits }}</td>
            <td><span class="grade-badge">{{ grade.grade }}</span></td>
            <td>{{ grade.gradePoint }}</td>
          </tr>
          <tr v-if="academicStore.gradeSummary.semesterGrades.length === 0">
            <td colspan="6" class="no-data">조회된 성적 내역이 없습니다. (확정 전일 수 있습니다.)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.grade-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.summary-card {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #dee2e6;
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 5px;
}

.value {
  font-size: 24px;
  font-weight: bold;
  color: #212529;
}

.value.gpa {
  color: #007bff;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f1f3f5;
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
}

td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.grade-badge {
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #adb5bd;
}
</style>
