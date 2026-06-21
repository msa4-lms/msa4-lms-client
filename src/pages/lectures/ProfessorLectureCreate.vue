<template>
  <div class="lecture-create-container">
    <div class="glass-card">
      <h1 class="page-title">강의 개설 신청</h1>
      <p class="subtitle">신규 개설할 과목의 정보, 성적 평가 비율 및 강의 시간표를 설정해 주세요.</p>

      <form @submit.prevent="handleSubmit" class="create-form-layout">
        <!-- 좌측 컬럼: 기본 정보 및 성적 평가 비율 -->
        <div class="form-column">
          <div class="section-box">
            <h3 class="section-title">기본 정보 설정</h3>
            <div class="info-grid">
              <div class="form-group">
                <label for="semesterId">학기 번호 (ID)</label>
                <input
                  type="number"
                  id="semesterId"
                  v-model.number="form.semesterId"
                  placeholder="예: 53(무조건 53)"
                  required
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="courseId">과목 번호 (ID)</label>
                <input
                  type="number"
                  id="courseId"
                  v-model.number="form.courseId"
                  placeholder="예: 1"
                  required
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="sectionNo">분반 번호</label>
                <input
                  type="text"
                  id="sectionNo"
                  v-model="form.sectionNo"
                  placeholder="예: 01"
                  required
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="capacity">수강 정원 (명)</label>
                <input
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
                <input
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
                <input type="number" v-model.number="form.midtermRatio" min="0" max="100" class="form-input ratio-box" />
              </div>
              <div class="ratio-group">
                <label>기말고사 (%)</label>
                <input type="number" v-model.number="form.finalRatio" min="0" max="100" class="form-input ratio-box" />
              </div>
              <div class="ratio-group">
                <label>과제 비율 (%)</label>
                <input type="number" v-model.number="form.assignmentRatio" min="0" max="100" class="form-input ratio-box" />
              </div>
              <div class="ratio-group">
                <label>출결 비율 (%)</label>
                <input type="number" v-model.number="form.attendanceRatio" min="0" max="100" class="form-input ratio-box" />
              </div>
            </div>
            <div :class="['ratio-indicator', isRatioValid ? 'valid' : 'invalid']">
              현재 평가 비율 합계: <strong>{{ ratioTotal }}%</strong> 
              <span v-if="!isRatioValid">(100%가 되어야 개설 가능합니다)</span>
              <span v-else>✔️ 준비 완료</span>
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
                <select v-model="tempSchedule.dayOfWeek" class="form-input">
                  <option value="MON">월요일</option>
                  <option value="TUE">화요일</option>
                  <option value="WED">수요일</option>
                  <option value="THU">목요일</option>
                  <option value="FRI">금요일</option>
                </select>
              </div>
              <div class="form-group">
                <label>시작 교시</label>
                <input type="number" v-model.number="tempSchedule.startPeriod" min="1" max="9" class="form-input" />
              </div>
              <div class="form-group">
                <label>종료 교시</label>
                <input type="number" v-model.number="tempSchedule.endPeriod" min="1" max="9" class="form-input" />
              </div>
              <button type="button" @click="addSchedule" class="btn-success add-btn">시간 추가</button>
            </div>

            <!-- 추가된 시간표 리스트 -->
            <div v-if="form.schedules.length > 0" class="schedule-list">
              <div v-for="(sched, index) in form.schedules" :key="index" class="schedule-item">
                <span>📅 {{ getDayLabel(sched.dayOfWeek) }} {{ sched.startPeriod }}교시 ~ {{ sched.endPeriod }}교시</span>
                <button type="button" @click="removeSchedule(index)" class="btn-warn btn-sm">삭제</button>
              </div>
            </div>
            <div v-else class="empty-schedule-text">등록된 강의 시간이 없습니다. 최소 1개 이상 추가해야 합니다.</div>
          </div>
        </div>

        <!-- 하단: 폼 액션 버튼들 -->
        <div class="form-actions full-width">
          <button type="button" @click="goBack" class="btn-secondary">이전으로</button>
          <button type="submit" :disabled="!isFormSubmitable" class="btn-primary">강의 개설 신청</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useLectureProfessorStore } from "../../store/lecture/useLectureProfessorStore";

const router = useRouter();
const lectureProfessorStore = useLectureProfessorStore();

const form = reactive({
  semesterId: null,
  courseId: null,
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

<style scoped>
.lecture-create-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 2.5rem;
  background-color: #F8FAFC;
  color: #1E293B;
}

.glass-card {
  width: 100%;
  max-width: 1300px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #0B3D91;
  text-align: left;
}

.subtitle {
  color: #64748B;
  margin-bottom: 2.5rem;
  text-align: left;
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
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 1.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  color: #0B3D91;
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
}

.form-group.full-width {
  grid-column: span 2;
}

label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 0.5rem;
  text-align: left;
}

.form-input {
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: #1E293B;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease-in-out;
}

.form-input:focus {
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.schedule-section {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #E2E8F0;
  text-align: left;
  height: 100%;
}

.schedule-section h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  color: #0B3D91;
}

.schedule-creator {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 0.75rem;
  align-items: flex-end;
}

.add-btn {
  height: 42px;
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
  color: #2563EB;
}

.schedule-item span {
  font-weight: 600;
}

.empty-schedule-text {
  color: #64748B;
  margin-top: 1.5rem;
  font-style: italic;
  font-size: 0.9rem;
}

.ratio-section {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #E2E8F0;
  text-align: left;
}

.ratio-section h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  color: #0B3D91;
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
  color: #22C55E;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.ratio-indicator.invalid {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
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

.btn-primary, .btn-secondary, .btn-success, .btn-warn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #0B3D91;
  color: #FFFFFF;
}

.btn-primary:hover:not(:disabled) {
  background: #082C6B;
  box-shadow: 0 4px 12px rgba(11, 61, 145, 0.25);
}

.btn-primary:disabled {
  background: #CBD5E1;
  color: #64748B;
  cursor: not-allowed;
}

.btn-secondary {
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  color: #64748B;
}

.btn-secondary:hover {
  background: #F1F5F9;
  color: #1E293B;
}

.btn-success {
  background: #22C55E;
  color: #FFFFFF;
}

.btn-success:hover {
  background: #16A34A;
}

.btn-warn {
  background: #EF4444;
  color: #FFFFFF;
}

.btn-warn:hover {
  background: #DC2626;
}

.btn-sm {
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
  border-radius: 4px;
}
</style>
