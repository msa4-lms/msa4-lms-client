<script setup>
import { onMounted } from 'vue';
import { useAcademicStore } from '../../store/academic/useAcademicStore';
import { useAuthStore } from '../../store/auth/useAuthStore';

const academicStore = useAcademicStore();
const authStore = useAuthStore();

onMounted(() => {
  if (authStore.isLoggedIn) {
    academicStore.fetchAttendance();
  }
});
</script>

<template>
  <div class="attendance-view">
    <div class="header-section">
      <h1>출결 현황 조회</h1>
      <p>과목별 출석, 결석, 지각 내역을 실시간으로 확인할 수 있습니다.</p>
    </div>

    <div class="content-card">
      <div class="card-header">
        <h3>최근 출결 내역</h3>
      </div>
      
      <div class="list-container">
        <div v-for="(att, index) in academicStore.attendanceList" :key="index" class="attendance-item">
          <div class="course-info">
            <div class="icon-box">📅</div>
            <div class="text-group">
              <span class="course-name">{{ att.courseName }}</span>
              <span class="date">{{ att.lectureDate }}</span>
            </div>
          </div>
          
          <div :class="['status-badge', att.status.toLowerCase()]">
            <span class="dot"></span>
            {{ att.status === 'PRESENT' ? '출석' : att.status === 'ABSENT' ? '결석' : '지각' }}
          </div>
        </div>

        <div v-if="academicStore.attendanceList.length === 0" class="empty-state">
          <span class="empty-icon">📝</span>
          <p>등록된 출결 기록이 없습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.attendance-view {
  max-width: 900px;
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

.list-container {
  padding: 8px;
}

.attendance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 16px;
  border-radius: 10px;
  transition: background-color 0.2s;
}

.attendance-item:hover {
  background-color: #f8fafc;
}

.course-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #f1f5f9;
  display: grid;
  place-items: center;
  font-size: 20px;
}

.text-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.course-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 1.05rem;
}

.date {
  font-size: 0.85rem;
  color: #64748b;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}

.status-badge .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-badge.present {
  background: #ecfdf5;
  color: #059669;
}
.status-badge.present .dot { background: #059669; }

.status-badge.absent {
  background: #fef2f2;
  color: #dc2626;
}
.status-badge.absent .dot { background: #dc2626; }

.status-badge.tardy {
  background: #fffbeb;
  color: #d97706;
}
.status-badge.tardy .dot { background: #d97706; }

.empty-state {
  padding: 60px 0;
  text-align: center;
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
}
</style>
