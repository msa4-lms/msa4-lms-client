<script setup>
import { reactive, computed } from "vue";
import { useRouter } from "vue-router";
import MyPageContainer from "../../components/layout/MyPageContainer.vue";
import MyButton from "../../components/button/MyButton.vue";
import MyInput from "../../components/input/MyInput.vue";
import { useLectureProfessorStore } from "../../store/lecture/useLectureProfessorStore";

const router = useRouter();
const lectureProfessorStore = useLectureProfessorStore();

const form = reactive({
  semesterId: 53,
  courseId: 61,
  sectionNo: "01",
  capacity: 40,
  classroom: "",
  midtermRatio: 30,
  finalRatio: 30,
  assignmentRatio: 30,
  attendanceRatio: 10,
  schedules: [], // 시간표 배열
});

const tempSchedule = reactive({
  dayOfWeek: "MON",
  startPeriod: 1,
  endPeriod: 2,
});

const ratioTotal = computed(() => {
  return (
    (form.midtermRatio || 0) +
    (form.finalRatio || 0) +
    (form.assignmentRatio || 0) +
    (form.attendanceRatio || 0)
  );
});

const isRatioValid = computed(() => ratioTotal.value === 100);
const isFormSubmitable = computed(() => isRatioValid.value && form.schedules.length > 0);

const addSchedule = () => {
  if (tempSchedule.startPeriod > tempSchedule.endPeriod) {
    alert("시작 교시는 종료 교시보다 클 수 없습니다.");
    return;
  }
  // 추가
  form.schedules.push({ ...tempSchedule });
};

const removeSchedule = (index) => {
  form.schedules.splice(index, 1);
};

const getDayLabel = (day) => {
  const map = { MON: "월요일", TUE: "화요일", WED: "수요일", THU: "목요일", FRI: "금요일" };
  return map[day] || day;
};

const goBack = () => {
  router.push("/main");
};

const handleSubmit = async () => {
  if (!isRatioValid.value) {
    alert("성적 비율의 합계가 100%여야 합니다.");
    return;
  }
  if (form.schedules.length === 0) {
    alert("최소 1개 이상의 강의 시간표를 입력해 주세요.");
    return;
  }

  try {
    await lectureProfessorStore.createLecture({ ...form });
    alert("강의 개설 신청이 정상 처리되었습니다.");
    router.push("/main");
  } catch (error) {
    alert(error.response?.data?.message || "강의 개설 신청 중 오류가 발생했습니다.");
  }
};
</script>

<template>
  <MyPageContainer title="강의 개설 신청">
    <!-- 개설 폼 컨텐츠 카드 -->
    <div class="content-card">
      <form @submit.prevent="handleSubmit" class="create-form-layout">
        <!-- 좌측 컬럼: 기본 정보 및 성적 평가 비율 -->
        <div class="form-column">
          <div class="section-box">
            <h3 class="section-title">기본 정보 설정</h3>
            <div class="info-grid">


              <div class="form-group">
                <label for="courseId">과목 (Course)</label>
                <select
                  id="courseId"
                  v-model.number="form.courseId"
                  required
                  class="form-input select-day"
                >
                  <option :value="61">[14101] 컴퓨터학부 전공-1</option>
                  <option :value="62">[14102] 컴퓨터학부 전공-2</option>
                  <option :value="63">[14103] 컴퓨터학부 전공-3</option>
                  <option :value="64">[14104] 컴퓨터학부 전공-4</option>
                  <option :value="65">[14105] 컴퓨터학부 전공-5</option>
                </select>
              </div>

              <div class="form-group">
                <label for="sectionNo">분반 번호</label>
                <select
                  id="sectionNo"
                  v-model="form.sectionNo"
                  required
                  class="form-input select-day"
                >
                  <option value="01">01 분반</option>
                  <option value="02">02 분반</option>
                  <option value="03">03 분반</option>
                  <option value="04">04 분반</option>
                </select>
              </div>

              <div class="form-group">
                <label for="capacity">수강 정원 (명)</label>
                <MyInput
                  type="number"
                  id="capacity"
                  v-model.number="form.capacity"
                  placeholder="예: 40"
                  required
                  min="1"
                  class="form-input"
                />
              </div>

              <div class="form-group full-width">
                <label for="classroom">강의실</label>
                <MyInput
                  type="text"
                  id="classroom"
                  v-model="form.classroom"
                  placeholder="예: IT공학관 302호"
                  required
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <div class="ratio-section">
            <h3>성적 평가 비율 설정 (합계 100%)</h3>
            <div class="ratio-inputs">
              <div class="ratio-group">
                <label>중간고사 (%)</label>
                <MyInput type="number" v-model.number="form.midtermRatio" min="0" max="100" class="form-input ratio-box" />
              </div>
              <div class="ratio-group">
                <label>기말고사 (%)</label>
                <MyInput type="number" v-model.number="form.finalRatio" min="0" max="100" class="form-input ratio-box" />
              </div>
              <div class="ratio-group">
                <label>과제 비율 (%)</label>
                <MyInput type="number" v-model.number="form.assignmentRatio" min="0" max="100" class="form-input ratio-box" />
              </div>
              <div class="ratio-group">
                <label>출결 비율 (%)</label>
                <MyInput type="number" v-model.number="form.attendanceRatio" min="0" max="100" class="form-input ratio-box" />
              </div>
            </div>
            <div :class="['ratio-indicator', isRatioValid ? 'valid' : 'invalid']">
              현재 평가 비율 합계: <strong>{{ ratioTotal }}%</strong> 
              <span v-if="!isRatioValid">(100%가 되어야 개설 가능합니다)</span>
            </div>
          </div>
        </div>

        <!-- 우측 컬럼: 강의 시간표 설정 -->
        <div class="form-column">
          <div class="schedule-section">
            <h3>강의 시간표 설정</h3>
            <div class="schedule-creator">
              <div class="form-group">
                <label>요일</label>
                <select v-model="tempSchedule.dayOfWeek" class="form-input select-day">
                  <option value="MON">월요일</option>
                  <option value="TUE">화요일</option>
                  <option value="WED">수요일</option>
                  <option value="THU">목요일</option>
                  <option value="FRI">금요일</option>
                </select>
              </div>
              <div class="form-group">
                <label>시작 교시</label>
                <MyInput type="number" v-model.number="tempSchedule.startPeriod" min="1" max="9" class="form-input" />
              </div>
              <div class="form-group">
                <label>종료 교시</label>
                <MyInput type="number" v-model.number="tempSchedule.endPeriod" min="1" max="9" class="form-input" />
              </div>
              <MyButton color="green" size="middle" content="추가" class="add-btn" @click="addSchedule" />
            </div>

            <!-- 추가된 시간표 리스트 -->
            <div v-if="form.schedules.length > 0" class="schedule-list">
              <div v-for="(sched, index) in form.schedules" :key="index" class="schedule-item">
                <span>📅 {{ getDayLabel(sched.dayOfWeek) }} {{ sched.startPeriod }}교시 ~ {{ sched.endPeriod }}교시</span>
                <MyButton color="red" size="small" content="삭제" @click="removeSchedule(index)" />
              </div>
            </div>
            <div v-else class="empty-schedule-text">등록된 강의 시간이 없습니다. 최소 1개 이상 추가해야 합니다.</div>
          </div>
        </div>

        <!-- 하단: 폼 액션 버튼들 -->
        <div class="form-actions full-width">
          <MyButton color="white" size="middle" content="이전으로" @click="goBack" />
          <MyButton btnType="submit" color="deep-blue" size="middle" content="강의 개설 신청" :disabled="!isFormSubmitable" />
        </div>
      </form>
    </div>
  </MyPageContainer>
</template>

<style scoped>

.content-card {
  background: var(--personal-color-white);
  border: 1px solid #edf2f7;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.create-form-layout {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2.5rem;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-box {
  background: var(--bg-color);
  border: 1px solid #edf2f7;
  border-radius: 12px;
  padding: 1.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  color: var(--primary-color);
  text-align: left;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.form-group.full-width {
  grid-column: span 2;
}

label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary-text-color);
  margin-bottom: 0.5rem;
  text-align: left;
}

.form-input {
  background: var(--personal-color-white);
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: var(--primary-text-color);
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease-in-out;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--secondary-blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.select-day {
  height: 46px;
  cursor: pointer;
}

.schedule-section {
  background: var(--bg-color);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #edf2f7;
  text-align: left;
  height: 100%;
}

.schedule-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  color: var(--primary-color);
}

.schedule-creator {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 0.75rem;
  align-items: flex-end;
}

.add-btn {
  height: 46px;
  padding: 0 1.2rem;
}

.schedule-list {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.schedule-item {
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.2);
  padding: 0.6rem 1rem;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  color: var(--secondary-blue);
}

.schedule-item span {
  font-weight: 600;
}

.empty-schedule-text {
  color: var(--secondary-color);
  margin-top: 1.5rem;
  font-style: italic;
  font-size: 0.9rem;
}

.ratio-section {
  background: var(--bg-color);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #edf2f7;
  text-align: left;
}

.ratio-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  color: var(--primary-color);
}

.ratio-inputs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.ratio-group {
  display: flex;
  flex-direction: column;
}

.ratio-box {
  text-align: center;
}

.ratio-indicator {
  margin-top: 1.2rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.95rem;
  display: inline-block;
  font-weight: 500;
  width: 100%;
  box-sizing: border-box;
}

.ratio-indicator.valid {
  background: rgba(34, 197, 94, 0.15);
  color: var(--personal-color-green);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.ratio-indicator.invalid {
  background: rgba(239, 68, 68, 0.15);
  color: var(--personal-color-red);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.form-actions {
  grid-column: span 2;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  border-top: 1px solid #E2E8F0;
  padding-top: 1.5rem;
}
</style>
