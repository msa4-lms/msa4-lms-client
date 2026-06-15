<script setup>
import { onMounted } from 'vue';
import { useEnrollmentStore } from '../../store/enrollment/useEnrollmentStore';
import { useAuthStore } from '../../store/auth/useAuthStore';

const enrollmentStore = useEnrollmentStore();
const authStore = useAuthStore();
const days = ['월', '화', '수', '목', '금'];

onMounted(async () => {
  if (authStore.userInfo && authStore.userInfo.id) {
    await enrollmentStore.fetchMyEnrollments(authStore.userInfo.id);
  }
});

/**
     * [핵심 비즈니스 로직: getSchedule]
     *  발표 설명 팁: "이 함수는 데이터베이스의 문자열 시간 정보(예: '월1')를
     *  화면상의 2차원 그리드 좌표와 매칭해주는 핵심 브릿지 역할을 합니다."
     *
     * @param {string} day - 현재 그리드 칸의 요일 (예: '월')
     * @param {number} period - 현재 그리드 칸의 교시 (예: 1)
     * @returns {object|null} 해당 시간에 수업이 있다면 과목 객체 반환, 없다면 null
     */

const getSchedule = (day, period) => {
  return enrollmentStore.myEnrollments.find(item => {
    // 1. 과목 데이터에 시간 정보(schedule)가 없으면 제외합니다.
    if (!item.schedule) return false;

    // 2. 데이터 형식(예: '월1')에서 첫 글자를 요일로 추출합니다.
    const scheduleDay = item.schedule.substring(0, 1);

    // 3. 두 번째 글자부터를 숫자로 변환하여 교시 정보를 얻습니다.
    const schedulePeriod = parseInt(item.schedule.substring(1));

    // 4. 현재 검사 중인 칸의 요일/교시와 일치하는 과목을 찾아 반환합니다.
    return scheduleDay === day && schedulePeriod === period;
  });
};
</script>

<template>
  <!-- [전체 컨테이너] 화면의 중앙 정렬과 최대 너비를 제한하여 안정적인 레이아웃을 유지합니다. -->
  <div class="enrollment-container">
    <h2>내 수강 내역 및 시간표</h2>
    
     <!-- [1. 요약 카드] 사용자가 현재 신청한 총 학점을 한눈에 보여주는 UI입니다.
   - 스토어의 computed 속성(totalCredits)을 실시간으로 바인딩하여 보여줍니다. -->
    <div class="summary-card">
      <p>신청 과목 합계 학점: <strong>{{ enrollmentStore.totalCredits }}</strong> 학점</p>
    </div>

    <!-- [2. 시간표 섹션] 이번 발표의 핵심인 'CSS Grid' 기반의 시각적 시간표입니다. -->
    <section class="timetable-section">
      <h3>주간 시간표</h3>
      <div class="timetable-grid">
       <!-- [헤더 영역] '교시' 레이블과 월~금 요일을 반복문(v-for)으로 생성합니다. -->
        <div class="grid-cell header">교시</div>
        <div v-for="day in days" :key="day" class="grid-cell header">{{ day }}</div>

         <!-- [바디 영역] 1교시부터 9교시까지 수직 행을 생성합니다. -->
        <template v-for="period in 9" :key="period">
          <!-- 행의 첫 번째 칸: 현재 몇 교시인지 표시 (예: 1교시, 2교시...) -->
          <div class="grid-cell period-label">{{ period }}교시</div>

           <!-- 요일별 칸 생성: 각 교시(행) 내부에 월~금(열) 칸을 5개씩 만듭니다. -->
          <div v-for="day in days" :key="day" class="grid-cell content">

            <!--  getSchedule 함수 호출
                  * 설명: 이 칸(요일, 교시)에 해당하는 수업이 있는지 검사합니다.  
                 * 얻는 것: 조건부 렌더링(v-if)을 통해 수업이 있는 칸에만 '과목 카드'를 그립니다. -->
            <div v-if="getSchedule(day, period)" class="schedule-item">

              <!-- 과목명이 있을 경우 과목명과 강의실 정보를 카드 형태로 출력합니다. -->
              <span class="course-name">{{ getSchedule(day, period).courseName }}</span>
              <span class="room">{{ getSchedule(day, period).room }}</span>
            </div>
          </div>
        </template>
      </div>
    </section>

    <!-- [3. 수강 신청 목록] 시간표 아래에 상세 내역을 표(Table) 형식으로 보여줍니다. -->
    <section class="list-section">
      <h3>수강 신청 목록</h3>
      <table class="enrollment-table">
        <thead>
          <tr>
            <th>과목코드</th>
            <th>과목명</th>
            <th>교수명</th>
            <th>강의실</th>
            <th>시간</th>
            <th>학점</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          <!-- 스토어에 저장된 수강 신청 배열(myEnrollments)을 순회하며 행(tr)을 생성합니다. -->
          <tr v-for="item in enrollmentStore.myEnrollments" :key="item.id">
            <td>{{ item.courseCode }}</td>
            <td>{{ item.courseName }}</td>
            <td>{{ item.professorName }}</td>
            <td>{{ item.room }}</td>
            <td>{{ item.schedule }}</td>
            <td>{{ item.credits }}</td>
            <td>{{ item.status }}</td>
          </tr>
          <!-- 데이터가 없을 경우를 대비한 예외 처리입니다. -->
          <tr v-if="enrollmentStore.myEnrollments.length === 0">
            <td colspan="7" class="empty-msg">신청 내역이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.enrollment-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.summary-card {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 25px;
  border-left: 5px solid #0B3D91;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* [7] CSS Grid 핵심 디자인 */
.timetable-grid {
  display: grid;
  grid-template-columns: 80px repeat(5, 1fr); /* 교시(80px) + 요일(균등배분) */
  border: 1px solid #dee2e6;
  background-color: white;
  margin-bottom: 40px;
}

.grid-cell {
  border: 0.5px solid #eee;
  padding: 8px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.grid-cell.header {
  background-color: #0B3D91;
  color: white;
  font-weight: bold;
  min-height: 40px;
}

.grid-cell.period-label {
  background-color: #f8f9fa;
  font-weight: bold;
  border-right: 2px solid #dee2e6;
}

.schedule-item {
  background-color: #e7f1ff;
  border: 1px solid #b3d7ff;
  color: #0B3D91;
  border-radius: 4px;
  padding: 4px;
  width: 100%;
  height: 100%;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.course-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.room {
  font-size: 0.75rem;
  color: #666;
}

.enrollment-table {
  width: 100%;
  border-collapse: collapse;
}

.enrollment-table th, .enrollment-table td {
  border: 1px solid #dee2e6;
  padding: 12px;
  text-align: left;
}

.enrollment-table th {
  background-color: #f8f9fa;
}

.empty-msg {
  text-align: center;
  color: #666;
  padding: 20px;
}
</style>
