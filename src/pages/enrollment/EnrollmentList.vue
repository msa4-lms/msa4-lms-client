<script setup>
import { onMounted } from 'vue';
import { useEnrollmentStore } from '../../store/enrollment/useEnrollmentStore';
import { useAuthStore } from '../../store/auth/useAuthStore';

const enrollmentStore = useEnrollmentStore();
const authStore = useAuthStore();
const days = ['월', '화', '수', '목', '금'];

// 1. 교시별 표준 시간 매핑 (50분 수업 / 10분 휴식)
const timeSlots = {
  1: { start: '09:00', end: '09:50' },
  2: { start: '10:00', end: '10:50' },
  3: { start: '11:00', end: '11:50' },
  4: { start: '12:00', end: '12:50' },
  5: { start: '13:00', end: '13:50' },
  6: { start: '14:00', end: '14:50' },
  7: { start: '15:00', end: '15:50' },
  8: { start: '16:00', end: '16:50' },
  9: { start: '17:00', end: '17:50' },
};

onMounted(async () => {
  if (authStore.userInfo && authStore.userInfo.id) {
    await enrollmentStore.fetchMyEnrollments(authStore.userInfo.id);
  }
});

/**
 * [시간표 그리드 제어: getScheduleInfo]
 * DB의 '월요일 09:00 ~ 10:50' 형식을 해석하여 병합(span) 처리를 수행합니다.
 */
const getScheduleInfo = (day, period) => {
  for (const item of enrollmentStore.myEnrollments) {
    if (!item.schedule) continue;
    const parts = item.schedule.split(',').map(s => s.trim());
    for (const part of parts) {
      // 정규표현식으로 요일, 시작시간, 종료시간 추출
      const match = part.match(/([가-힣]+) (\d{2}):00 ~ (\d{2}):50/);
      if (!match) continue;

      const schedDay = match[1].substring(0, 1); // '월요일' -> '월'
      if (schedDay !== day) continue;

      const start = parseInt(match[2]) - 8; // '09' -> 1교시
      const end = parseInt(match[3]) - 8;   // '10' -> 2교시

      if (period === start) return { type: 'start', item, span: end - start + 1 };
      if (period > start && period <= end) return { type: 'occupied' };
    }
  }
  return { type: 'empty' };
};

/**
 * [목록용 시간 변환: formatSchedule]
 * 쉼표로 구분된 시간을 줄바꿈 배열로 변환
 */
const formatSchedule = (schedule) => {
  if (!schedule) return [];
  return schedule.split(',').map(s => s.trim());
};
</script>

<template>
  <div class="enrollment-container">
    <h2>내 수강 내역 및 시간표</h2>
    
    <div class="summary-card">
      <p>신청 과목 합계 학점: <strong>{{ enrollmentStore.totalCredits }}</strong> 학점</p>
    </div>

    <!-- 주간 시간표 섹션 -->
    <section class="timetable-section">
      <h3>주간 시간표</h3>
      <div class="timetable-grid">
        <div class="grid-cell header">시간</div>
        <div v-for="day in days" :key="day" class="grid-cell header">{{ day }}</div>

        <template v-for="period in 9" :key="period">
          <!-- 시간 레이블 (교시 + 실제시간) -->
          <div class="grid-cell period-label">
            <span class="p-num">{{ period }}교시</span>
            <span class="p-time">{{ timeSlots[period].start }}~{{ timeSlots[period].end }}</span>
          </div>

          <template v-for="day in days" :key="day">
            <!-- getScheduleInfo의 결과에 따라 조건부 렌더링 -->
            <div v-if="getScheduleInfo(day, period).type === 'start'" 
                 class="grid-cell content schedule-item"
                 :style="{ gridRow: `span ${getScheduleInfo(day, period).span}` }">
              <span class="course-name">{{ getScheduleInfo(day, period).item.courseName }}</span>
              <span class="classroom">{{ getScheduleInfo(day, period).item.classroom }}</span>
            </div>
            <!-- 이미 연강으로 차지된 칸은 그리지 않음 (Grid Row Span이 처리) -->
            <div v-else-if="getScheduleInfo(day, period).type === 'empty'" class="grid-cell content"></div>
          </template>
        </template>
      </div>
    </section>

    <!-- 수강 신청 목록 섹션 -->
    <section class="list-section">
      <h3>수강 신청 목록</h3>
      <table class="enrollment-table">
        <thead>
          <tr>
            <th>과목코드</th>
            <th>과목명</th>
            <th>교수명</th>
            <th class="col-classroom">강의실</th>
            <th class="col-time">수강시간</th>
            <th>학점</th>
            <th>취소</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in enrollmentStore.myEnrollments" :key="item.id">
            <td>{{ item.courseCode }}</td>
            <td class="bold">{{ item.courseName }}</td>
            <td>{{ item.professorName }}</td>
            <td>{{ item.classroom }}</td>
            <!-- formatSchedule 함수를 사용하여 줄바꿈 처리 -->
            <td class="time-text">
              <div v-for="(time, idx) in formatSchedule(item.schedule)" :key="idx">
                {{ time }}
              </div>
            </td>
            <td>{{ item.credits }}학점</td>
            <td>
              <button class="btn-cancel" @click="enrollmentStore.cancelEnrollment(authStore.userInfo.id, item.lectureId)">취소</button>
            </td>
          </tr>
          <tr v-if="enrollmentStore.myEnrollments.length === 0">
            <td colspan="7" class="empty-msg">신청 내역이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.enrollment-container { padding: 20px; max-width: 1400px; margin: 0 auto; }
.summary-card { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 5px solid #0B3D91; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

.timetable-grid {
  display: grid;
  grid-template-columns: 100px repeat(5, 1fr);
  grid-auto-flow: dense; /* Span 처리를 위해 중요 */
  border: 1px solid #dee2e6;
  background-color: white;
  margin-bottom: 40px;
}

.grid-cell { border: 0.5px solid #eee; padding: 8px; min-height: 70px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.grid-cell.header { background-color: #0B3D91; color: white; font-weight: bold; min-height: 45px; }

.grid-cell.period-label { background-color: #f8f9fa; border-right: 2px solid #dee2e6; }
.p-num { font-weight: bold; font-size: 0.9rem; }
.p-time { font-size: 0.75rem; color: #666; margin-top: 2px; }

.schedule-item {
  background-color: #e7f1ff;
  border: 1px solid #b3d7ff;
  color: #0B3D91;
  border-radius: 4px;
  margin: 1px;
  z-index: 1;
}

.course-name { font-weight: bold; font-size: 0.85rem; margin-bottom: 4px; }
.classroom { font-size: 0.75rem; color: #666; }

.enrollment-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
.enrollment-table th, .enrollment-table td { border: 1px solid #dee2e6; padding: 12px; text-align: center; }
.enrollment-table th { background-color: #f8f9fa; font-size: 0.9rem; white-space: nowrap; }

/* 컬럼 너비 및 가독성 최적화 */
.col-classroom { width: 15%; }
.col-time { width: 25%; }

.time-text {
  color: #1a73e8;
  font-size: 0.85rem;
  text-align: left !important;
  line-height: 1.5;
}
.bold { font-weight: 600; }

.btn-cancel { padding: 6px 12px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
.btn-cancel:hover { background-color: #c82333; }
.empty-msg { text-align: center; color: #666; padding: 30px; }
</style>