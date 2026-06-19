<script setup>
import { onMounted, reactive } from 'vue';
import { useAcademicStore } from '../../store/academic/useAcademicStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useEnrollmentStore } from '../../store/enrollment/useEnrollmentStore';

const academicStore = useAcademicStore();
const authStore = useAuthStore();
const enrollmentStore = useEnrollmentStore();

const excuseForm = reactive({
  enrollmentId: '',
  lectureDate: '',
  period: 1,
  reason: '',
});

const statusText = {
  PRESENT: '출석',
  ABSENT: '결석',
  LATE: '지각',
  EXCUSED: '공결',
  PENDING: '대기',
  APPROVED: '승인',
  REJECTED: '반려',
};

const resetExcuseForm = () => {
  excuseForm.enrollmentId = '';
  excuseForm.lectureDate = '';
  excuseForm.period = 1;
  excuseForm.reason = '';
};

const submitExcuse = async () => {
  await academicStore.requestExcuse({
    enrollmentId: Number(excuseForm.enrollmentId),
    lectureDate: excuseForm.lectureDate,
    period: Number(excuseForm.period),
    reason: excuseForm.reason,
  });
  resetExcuseForm();
};

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await Promise.all([
      academicStore.fetchAttendance(),
      academicStore.fetchAttendanceRates(),
      academicStore.fetchExcuseRequests(),
      enrollmentStore.fetchMyEnrollments(2024, 1),
    ]);
  }
});
</script>

<template>
  <div class="attendance-view">
    <div class="header-section">
      <h1>출결 현황 조회</h1>
      <p>과목별 출결, 출석률, 공결 신청 결과를 확인할 수 있습니다.</p>
    </div>

    <div class="content-card rate-card">
      <div class="card-header">
        <h3>과목별 출석률</h3>
      </div>

      <div class="rate-grid">
        <div v-for="rate in academicStore.attendanceRates" :key="rate.enrollmentId" class="rate-item">
          <div>
            <strong>{{ rate.courseName }}</strong>
            <p>{{ rate.attendedCount }} / {{ rate.totalCount }}회 출석 인정</p>
          </div>
          <span :class="['rate-badge', { danger: rate.failTarget }]">
            {{ rate.attendanceRate }}%
          </span>
        </div>
        <div v-if="academicStore.attendanceRates.length === 0" class="empty-state compact">
          <p>출석률 계산 대상이 없습니다.</p>
        </div>
      </div>
    </div>

    <div class="content-card">
      <div class="card-header">
        <h3>공결 신청</h3>
      </div>

      <form class="excuse-form" @submit.prevent="submitExcuse">
        <label>
          과목
          <select v-model="excuseForm.enrollmentId" required>
            <option value="" disabled>과목 선택</option>
            <option v-for="item in enrollmentStore.myEnrollments" :key="item.id" :value="item.id">
              {{ item.courseName }}
            </option>
          </select>
        </label>

        <label>
          강의일자
          <input v-model="excuseForm.lectureDate" type="date" required />
        </label>

        <label>
          교시
          <input v-model.number="excuseForm.period" type="number" min="1" required />
        </label>

        <label class="reason-field">
          사유
          <input v-model.trim="excuseForm.reason" type="text" placeholder="예: 병원 진료" required />
        </label>

        <button type="submit">신청</button>
      </form>
    </div>

    <div class="content-card">
      <div class="card-header">
        <h3>공결 승인 결과</h3>
      </div>

      <div class="list-container">
        <div v-for="item in academicStore.excuseRequests" :key="item.id" class="attendance-item">
          <div class="text-group">
            <span class="course-name">{{ item.courseName }}</span>
            <span class="date">{{ item.lectureDate }} · {{ item.reason }}</span>
            <span v-if="item.rejectReason" class="date">반려 사유: {{ item.rejectReason }}</span>
          </div>
          <div :class="['status-badge', item.status.toLowerCase()]">
            <span class="dot"></span>
            {{ statusText[item.status] || item.status }}
          </div>
        </div>

        <div v-if="academicStore.excuseRequests.length === 0" class="empty-state compact">
          <p>공결 신청 내역이 없습니다.</p>
        </div>
      </div>
    </div>

    <div class="content-card">
      <div class="card-header">
        <h3>최근 출결 내역</h3>
      </div>
      
      <div class="list-container">
        <div v-for="(att, index) in academicStore.attendanceList" :key="index" class="attendance-item">
          <div class="course-info">
            <div class="text-group">
              <span class="course-name">{{ att.courseName }}</span>
              <span class="date">{{ att.lectureDate }}</span>
            </div>
          </div>
          
          <div :class="['status-badge', att.status.toLowerCase()]">
            <span class="dot"></span>
            {{ statusText[att.status] || att.status }}
          </div>
        </div>

        <div v-if="academicStore.attendanceList.length === 0" class="empty-state">
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
  margin-bottom: 24px;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #edf2f7;
}

.card-header h3 {
  font-size: 1.1rem;
  color: #1a1f36;
}

.rate-grid {
  display: grid;
  gap: 12px;
  padding: 16px;
}

.rate-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  background: #f8fafc;
}

.rate-item p {
  margin-top: 4px;
  color: #64748b;
  font-size: 0.9rem;
}

.rate-badge {
  padding: 8px 14px;
  border-radius: 20px;
  background: #ecfdf5;
  color: #059669;
  font-weight: 700;
}

.rate-badge.danger {
  background: #fef2f2;
  color: #dc2626;
}

.excuse-form {
  display: grid;
  grid-template-columns: 1fr 180px 90px 1.5fr auto;
  gap: 12px;
  padding: 20px 24px;
  align-items: end;
}

.excuse-form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #4f566b;
  font-size: 0.85rem;
  font-weight: 700;
}

.excuse-form select,
.excuse-form input {
  height: 38px;
  border: 1px solid #d8dee4;
  border-radius: 6px;
  padding: 0 10px;
}

.excuse-form button {
  height: 38px;
  border: none;
  border-radius: 6px;
  padding: 0 18px;
  background: #1a73e8;
  color: white;
  font-weight: 700;
  cursor: pointer;
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

.status-badge.present,
.status-badge.excused,
.status-badge.approved {
  background: #ecfdf5;
  color: #059669;
}
.status-badge.present .dot,
.status-badge.excused .dot,
.status-badge.approved .dot { background: #059669; }

.status-badge.absent,
.status-badge.rejected {
  background: #fef2f2;
  color: #dc2626;
}
.status-badge.absent .dot,
.status-badge.rejected .dot { background: #dc2626; }

.status-badge.late,
.status-badge.pending {
  background: #fffbeb;
  color: #d97706;
}
.status-badge.late .dot,
.status-badge.pending .dot { background: #d97706; }

.empty-state {
  padding: 60px 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-state.compact {
  padding: 24px 0;
}

.empty-state p {
  color: #64748b;
}

@media (max-width: 760px) {
  .excuse-form {
    grid-template-columns: 1fr;
  }

  .attendance-item,
  .rate-item {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
}
</style>
