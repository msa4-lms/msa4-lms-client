<script setup>
import { onMounted, ref } from "vue";
import { useEnrollmentStore } from "../../store/enrollment/useEnrollmentStore";
import { useAuthStore } from "../../store/auth/useAuthStore";
import MyButton from "../../components/button/MyButton.vue";
import MyTable from "../../components/table/MyTable.vue";
import MySearchFilter from "../../components/search/MySearchFilter.vue";
import MyPageContainer from "../../components/layout/MyPageContainer.vue";

const enrollmentStore = useEnrollmentStore();
const authStore = useAuthStore();
const days = ["월", "화", "수", "목", "금"];

const historyParams = ref({
  year: 2026,
  semester: 1,
});

const onSearchHistory = () => {
  enrollmentStore.fetchMyEnrollments(
    historyParams.value.year,
    historyParams.value.semester
  );
};

// handleCancel removed

// 1. 교시별 표준 시간 매핑 (50분 수업 / 10분 휴식)
const timeSlots = {
  1: { start: "09:00", end: "09:50" },
  2: { start: "10:00", end: "10:50" },
  3: { start: "11:00", end: "11:50" },
  4: { start: "12:00", end: "12:50" },
  5: { start: "13:00", end: "13:50" },
  6: { start: "14:00", end: "14:50" },
  7: { start: "15:00", end: "15:50" },
  8: { start: "16:00", end: "16:50" },
  9: { start: "17:00", end: "17:50" },
};

const enrollmentColumns = [
  { key: "courseCode", label: "과목코드" },
  { key: "courseName", label: "과목명" },
  { key: "professorName", label: "교수명" },
  { key: "classroom", label: "강의실", class: "col-classroom" },
  { key: "schedule", label: "수강시간", class: "col-time" },
  { key: "credits", label: "학점" },
];

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await enrollmentStore.fetchMyEnrollments(
      historyParams.value.year,
      historyParams.value.semester
    );
  }
});

/**
 * [시간표 그리드 제어: getScheduleInfo]
 * DB의 '월요일 09:00 ~ 10:50' 형식을 해석하여 병합(span) 처리를 수행합니다.
 */
const getScheduleInfo = (day, period) => {
  for (const item of enrollmentStore.myEnrollments) {
    if (!item.schedule) continue;
    const parts = item.schedule.split(",").map((s) => s.trim());
    for (const part of parts) {
      // 정규표현식으로 요일, 시작시간, 종료시간 추출
      const match = part.match(/([가-힣]+) (\d{2}):00 ~ (\d{2}):50/);
      if (!match) continue;

      const schedDay = match[1].substring(0, 1); // '월요일' -> '월'
      if (schedDay !== day) continue;

      const start = parseInt(match[2]) - 8; // '09' -> 1교시
      const end = parseInt(match[3]) - 8; // '10' -> 2교시

      if (period === start)
        return { type: "start", item, span: end - start + 1 };
      if (period > start && period <= end) return { type: "occupied" };
    }
  }
  return { type: "empty" };
};

/**
 * [목록용 시간 변환: formatSchedule]
 * 쉼표로 구분된 시간을 줄바꿈 배열로 변환
 */
const formatSchedule = (schedule) => {
  if (!schedule) return [];
  return schedule.split(",").map((s) => s.trim());
};
</script>

<template>
  <MyPageContainer title="내 수강 내역 및 시간표">
    <!-- 학기 선택 필터 추가 -->
    <MySearchFilter @search="onSearchHistory">
      <div class="search-group">
        <label>조회 연도</label>
        <select v-model="historyParams.year">
          <option :value="2026">2026년</option>
          <option :value="2025">2025년</option>
          <option :value="2024">2024년</option>
          <option :value="2023">2023년</option>
        </select>
      </div>
      <div class="search-group">
        <label>학기</label>
        <select v-model="historyParams.semester">
          <option :value="1">1학기</option>
          <option :value="2">2학기</option>
        </select>
      </div>
    </MySearchFilter>

    <div class="summary-card">
      <p>
        신청 과목 합계 학점:
        <strong>{{ enrollmentStore.totalCredits }}</strong> 학점
      </p>
    </div>

    <!-- 주간 시간표 섹션 -->
    <section class="timetable-section">
      <h3>주간 시간표</h3>
      <div class="timetable-grid">
        <div class="grid-cell header">시간</div>
        <div v-for="day in days" :key="day" class="grid-cell header">
          {{ day }}
        </div>

        <template v-for="period in 9" :key="period">
          <!-- 시간 레이블 (교시 + 실제시간) -->
          <div class="grid-cell period-label">
            <span class="p-num">{{ period }}교시</span>
            <span class="p-time"
              >{{ timeSlots[period].start }}~{{ timeSlots[period].end }}</span
            >
          </div>

          <template v-for="day in days" :key="day">
            <!-- getScheduleInfo의 결과에 따라 조건부 렌더링 -->
            <div
              v-if="getScheduleInfo(day, period).type === 'start'"
              class="grid-cell content schedule-item"
              :style="{ gridRow: `span ${getScheduleInfo(day, period).span}` }"
            >
              <span class="course-name">{{
                getScheduleInfo(day, period).item.courseName
              }}</span>
              <span class="classroom">{{
                getScheduleInfo(day, period).item.classroom
              }}</span>
            </div>
            <!-- 이미 연강으로 차지된 칸은 그리지 않음 (Grid Row Span이 처리) -->
            <div
              v-else-if="getScheduleInfo(day, period).type === 'empty'"
              class="grid-cell content"
            ></div>
          </template>
        </template>
      </div>
    </section>

    <!-- 수강 신청 목록 섹션 -->
    <section class="list-section">
      <h3>수강 신청 목록</h3>
      <MyTable
        :columns="enrollmentColumns"
        :loading="enrollmentStore.loading"
        :empty="enrollmentStore.myEnrollments.length === 0"
        emptyMessage="신청 내역이 없습니다."
      >
        <tr v-for="item in enrollmentStore.myEnrollments" :key="item.id">
          <td>{{ item.courseCode }}</td>
          <td>{{ item.courseName }}</td>
          <td>{{ item.professorName }}</td>
          <td>{{ item.classroom }}</td>
          <td class="time-text">
            <div
              v-for="(time, idx) in formatSchedule(item.schedule)"
              :key="idx"
            >
              {{ time }}
            </div>
          </td>
          <td>{{ item.credits }}학점</td>
        </tr>
      </MyTable>
    </section>
  </MyPageContainer>
</template>

<style scoped>
.btn-history-search {
  padding: 8px 20px;
  background-color: #0b3d91;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  height: 35px;
}

.timetable-grid {
  display: grid;
  grid-template-columns: 100px repeat(5, 1fr);
  grid-auto-flow: dense; /* Span 처리를 위해 중요 */
  border: 1px solid #dee2e6;
  background-color: white;
  margin-bottom: 40px;
}

.timetable-section > h3 {
  padding: 5px;
}

.list-section > h3 {
  padding: 5px;
}

.grid-cell {
  border: 0.5px solid #eee;
  padding: 8px;
  min-height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.grid-cell.header {
  background-color: #0b3d91;
  color: white;
  font-weight: bold;
  min-height: 45px;
}

.grid-cell.period-label {
  background-color: #f8f9fa;
  border-right: 2px solid #dee2e6;
}
.p-num {
  font-weight: bold;
  font-size: 0.9rem;
}
.p-time {
  font-size: 0.75rem;
  color: #666;
  margin-top: 2px;
}

.schedule-item {
  background-color: #e7f1ff;
  border: 1px solid #b3d7ff;
  color: #0b3d91;
  border-radius: 4px;
  margin: 1px;
  z-index: 1;
}

.course-name {
  font-weight: bold;
  font-size: 0.85rem;
  margin-bottom: 4px;
}
.classroom {
  font-size: 0.75rem;
  color: #666;
}

/* 컬럼 너비 및 가독성 최적화 */
.col-classroom {
  width: 15%;
}
.col-time {
  width: 25%;
}

.time-text {
  color: var(--primary-text-color);
  font-size: 0.85rem;
  text-align: center !important;
  line-height: 1.5;
}
</style>
