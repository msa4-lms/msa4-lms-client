<script setup>
import { onMounted } from 'vue';
import { useAcademicStore } from '../../store/academic/useAcademicStore';

const academicStore = useAcademicStore();

onMounted(() => {
  academicStore.fetchAttendance(501);
});
</script>

<template>
  <div class="attendance-container">
    <h1>출결 현황 조회</h1>

    <div class="list-container">
      <div v-for="(att, index) in academicStore.attendanceList" :key="index" class="attendance-card">
        <div class="info">
          <span class="course">{{ att.courseName }}</span>
          <span class="date">{{ att.lectureDate }}</span>
         </div>
        <div class="status-badge" :class="att.status.toLowerCase()">
          {{ att.status === 'PRESENT' ? '출석' : att.status === 'ABSENT' ? '결석' : '지각' }}
        </div>
      </div>
      <div v-if="academicStore.attendanceList.length === 0" class="no-data">
        출결 기록이 없습니다.
      </div>
    </div>
  </div>
</template>

<style scoped>
.attendance-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.attendance-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px 20px;
  margin-bottom: 10px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  border: 1px solid #eee;
}

.info {
  display: flex;
  flex-direction: column;
}

.course {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
}

.date {
  font-size: 13px;
  color: #6c757d;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: bold;
}

.status-badge.present {
  background: #e7f5ff;
  color: #228be6;
}

.status-badge.absent {
  background: #fff5f5;
  color: #fa5252;
}

.status-badge.tardy {
  background: #fff9db;
  color: #fab005;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #adb5bd;
}
</style>
