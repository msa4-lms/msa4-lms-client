<script setup>
import { reactive, computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import MyPageContainer from "../../components/layout/MyPageContainer.vue";
import MyButton from "../../components/button/MyButton.vue";
import MyInput from "../../components/input/MyInput.vue";
import { useLectureProfessorStore } from "../../store/lecture/useLectureProfessorStore";

const router = useRouter();
const lectureProfessorStore = useLectureProfessorStore();

const form = reactive({
  semesterId: 53,
  courseId: "",
  isNewCourse: false,
  newCourseName: "",
  newCourseCredits: 3,
  newCourseTargetGrade: 1,
  newCourseCompletionType: "GENERAL_ELECTIVE",
  sectionNo: "01",
  capacity: 40,
  classroom: "",
  syllabus: "",
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

onMounted(() => {
  lectureProfessorStore.fetchPastLectures();
  lectureProfessorStore.fetchAvailableCourses();
});

const selectedPastLectureId = ref("");

const handlePastLectureSelect = () => {
  if (!selectedPastLectureId.value) return;
  const target = lectureProfessorStore.pastLectures.find(
    (l) => l.id === selectedPastLectureId.value
  );
  if (target) {
    form.courseId = target.courseId;
    form.isNewCourse = false;
    form.capacity = target.capacity || 40;
    form.classroom = target.classroom || "";
    form.midtermRatio = target.midtermRatio || 30;
    form.finalRatio = target.finalRatio || 30;
    form.assignmentRatio = target.assignmentRatio || 30;
    form.attendanceRatio = target.attendanceRatio || 10;
    form.syllabus = target.syllabus || "";

    const parsedSchedules = parseScheduleString(target.schedule);
    if (parsedSchedules.length > 0) {
      form.schedules = parsedSchedules;
    }
    alert(
      "과거 강의 정보를 성공적으로 불러왔습니다. 필요한 경우 과목을 변경하실 수 있습니다."
    );
  }
};

const parseScheduleString = (scheduleStr) => {
  if (!scheduleStr) return [];
  const items = scheduleStr.split(", ");
  const dayMap = {
    월요일: "MON",
    화요일: "TUE",
    수요일: "WED",
    목요일: "THU",
    금요일: "FRI",
  };
  const parsed = [];

  items.forEach((item) => {
    const parts = item.split(" ");
    if (parts.length >= 4) {
      const dayLabel = parts[0];
      const startTime = parts[1];
      const endTime = parts[3];

      const dayOfWeek = dayMap[dayLabel];
      const startHour = parseInt(startTime.split(":")[0], 10);
      const endHour = parseInt(endTime.split(":")[0], 10);

      if (dayOfWeek && !isNaN(startHour) && !isNaN(endHour)) {
        parsed.push({
          dayOfWeek,
          startPeriod: startHour - 8,
          endPeriod: endHour - 8,
        });
      }
    }
  });
  return parsed;
};

const ratioTotal = computed(() => {
  return (
    (form.midtermRatio || 0) +
    (form.finalRatio || 0) +
    (form.assignmentRatio || 0) +
    (form.attendanceRatio || 0)
  );
});

const isRatioValid = computed(() => ratioTotal.value === 100);
const isFormSubmitable = computed(
  () => isRatioValid.value && form.schedules.length > 0
);

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
  const map = {
    MON: "월요일",
    TUE: "화요일",
    WED: "수요일",
    THU: "목요일",
    FRI: "금요일",
  };
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
    alert(
      error.response?.data?.message || "강의 개설 신청 중 오류가 발생했습니다."
    );
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
              <!-- 과거 강의 데이터 불러오기 영역 -->
              <div
                class="form-group full-width past-lecture-section"
                style="background: var(--bg-color)"
              >
                <label
                  for="pastLecture"
                  style="color: var(--personal-color-black)"
                  >기존 개설강의</label
                >
                <div style="display: flex; gap: 10px">
                  <select
                    id="pastLecture"
                    v-model="selectedPastLectureId"
                    class="form-input select-day"
                    style="flex: 1"
                  >
                    <option value="">
                      이전에 개설했던 강의를 선택하고 '불러오기'를 누르세요.
                    </option>
                    <option
                      v-for="l in lectureProfessorStore.pastLectures"
                      :key="l.id"
                      :value="l.id"
                    >
                      [{{ l.academicYear }}학년도
                      {{ l.term === "FIRST" ? "1학기" : "2학기" }}]
                      {{ l.courseName }}
                    </option>
                  </select>
                  <MyButton
                    type="button"
                    color="deep-blue"
                    size="middle"
                    content="불러오기"
                    @click="handlePastLectureSelect"
                  />
                </div>
              </div>

              <!-- 신규 개설을 위한 과목 선택 -->
              <div class="form-group full-width">
                <label for="courseId">과목 선택 (필수)</label>
                <select
                  id="courseId"
                  v-model.number="form.courseId"
                  @change="form.isNewCourse = form.courseId === 0"
                  required
                  class="form-input select-day"
                >
                  <option value="" disabled selected>
                    개설할 과목을 선택하세요.
                  </option>
                  <option :value="0">신규과목 개설</option>
                  <option
                    v-for="c in lectureProfessorStore.availableCourses"
                    :key="c.id"
                    :value="c.id"
                  >
                    [{{ c.code }}] {{ c.name }} ({{ c.credits }}학점 /
                    {{ c.targetGrade }}학년)
                  </option>
                </select>
              </div>

              <!-- 직접 입력(신규 과목) 시 나타나는 추가 입력란 -->
              <div
                v-if="form.isNewCourse"
                class="form-group full-width new-course-box"
                style="
                  background: #f8fafc;
                  padding: 0.8rem;
                  border-radius: 8px;
                  border: 1px dashed #cbd5e1;
                  display: grid;
                  grid-template-columns: 2fr 1fr 1fr 1.5fr;
                  gap: 10px;
                "
              >
                <div style="display: flex; flex-direction: column">
                  <label style="font-size: 0.85rem">과목명</label>
                  <MyInput
                    type="text"
                    v-model="form.newCourseName"
                    placeholder="과목명을 입력해주세요."
                    required
                    class="form-input"
                  />
                </div>
                <div style="display: flex; flex-direction: column">
                  <label style="font-size: 0.85rem">학점</label>
                  <MyInput
                    type="number"
                    v-model.number="form.newCourseCredits"
                    min="1"
                    max="6"
                    required
                    class="form-input"
                  />
                </div>
                <div style="display: flex; flex-direction: column">
                  <label style="font-size: 0.85rem">대상 학년</label>
                  <MyInput
                    type="number"
                    v-model.number="form.newCourseTargetGrade"
                    min="1"
                    max="4"
                    required
                    class="form-input"
                  />
                </div>
                <div style="display: flex; flex-direction: column">
                  <label style="font-size: 0.85rem">이수 구분</label>
                  <select
                    v-model="form.newCourseCompletionType"
                    class="form-input select-day"
                    required
                    style="height: 50px"
                  >
                    <option value="GENERAL_ELECTIVE">교양선택</option>
                    <option value="GENERAL_REQUIRED">교양필수</option>
                    <option value="MAJOR_ELECTIVE">전공선택</option>
                    <option value="MAJOR_REQUIRED">전공필수</option>
                  </select>
                </div>
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
                  placeholder="강의실을 입력해주세요."
                  required
                  class="form-input"
                />
              </div>

              <!-- 강의계획서 입력 영역 -->
              <div class="form-group full-width">
                <label for="syllabus">강의계획서</label>
                <textarea
                  id="syllabus"
                  v-model="form.syllabus"
                  placeholder="강의 목표, 교재, 주차별 계획 등을 상세히 입력해 주세요."
                  required
                  class="form-input"
                  style="min-height: 150px; resize: vertical"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="ratio-section">
            <h3>성적 평가 비율 설정 (합계 100%)</h3>
            <div class="ratio-inputs">
              <div class="ratio-group">
                <label>중간고사 (%)</label>
                <MyInput
                  type="number"
                  v-model.number="form.midtermRatio"
                  min="0"
                  max="100"
                  class="form-input ratio-box"
                />
              </div>
              <div class="ratio-group">
                <label>기말고사 (%)</label>
                <MyInput
                  type="number"
                  v-model.number="form.finalRatio"
                  min="0"
                  max="100"
                  class="form-input ratio-box"
                />
              </div>
              <div class="ratio-group">
                <label>과제 비율 (%)</label>
                <MyInput
                  type="number"
                  v-model.number="form.assignmentRatio"
                  min="0"
                  max="100"
                  class="form-input ratio-box"
                />
              </div>
              <div class="ratio-group">
                <label>출결 비율 (%)</label>
                <MyInput
                  type="number"
                  v-model.number="form.attendanceRatio"
                  min="0"
                  max="100"
                  class="form-input ratio-box"
                />
              </div>
            </div>
            <div
              :class="['ratio-indicator', isRatioValid ? 'valid' : 'invalid']"
            >
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
                <select
                  v-model="tempSchedule.dayOfWeek"
                  class="form-input select-day"
                >
                  <option value="MON">월요일</option>
                  <option value="TUE">화요일</option>
                  <option value="WED">수요일</option>
                  <option value="THU">목요일</option>
                  <option value="FRI">금요일</option>
                </select>
              </div>
              <div class="form-group">
                <label>시작 교시</label>
                <MyInput
                  type="number"
                  v-model.number="tempSchedule.startPeriod"
                  min="1"
                  max="9"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>종료 교시</label>
                <MyInput
                  type="number"
                  v-model.number="tempSchedule.endPeriod"
                  min="1"
                  max="9"
                  class="form-input"
                />
              </div>
              <MyButton
                color="deep-blue"
                size="small"
                content="추가"
                class="add-btn"
                @click="addSchedule"
              />
            </div>

            <!-- 추가된 시간표 리스트 -->
            <div v-if="form.schedules.length > 0" class="schedule-list">
              <div
                v-for="(sched, index) in form.schedules"
                :key="index"
                class="schedule-item"
              >
                <span
                  >{{ getDayLabel(sched.dayOfWeek) }}
                  {{ sched.startPeriod }}교시 ~ {{ sched.endPeriod }}교시</span
                >
                <MyButton
                  color="red"
                  size="small"
                  content="삭제"
                  @click="removeSchedule(index)"
                />
              </div>
            </div>
            <div v-else class="empty-schedule-text">
              등록된 강의 시간이 없습니다. 최소 1개 이상 추가해야 합니다.
            </div>
          </div>
        </div>

        <!-- 하단: 폼 액션 버튼들 -->
        <div class="form-actions full-width">
          <MyButton
            color="white"
            size="middle"
            content="이전으로"
            @click="goBack"
          />
          <MyButton
            btnType="submit"
            color="deep-blue"
            size="middle"
            content="강의 개설 신청"
            :disabled="!isFormSubmitable"
          />
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
  color: var(--primary-text-color);
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
  border: 1px solid #cbd5e1;
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
  color: var(--primary-text-color);
}

.schedule-creator {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 0.75rem;
  align-items: flex-end;
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
  color: var(--personal-color-black);
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
  color: var(--primary-text-color);
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
  border-radius: 6px;
  font-size: 0.95rem;
  display: inline-block;
  font-weight: 500;
  width: 100%;
  box-sizing: border-box;
}

.ratio-indicator.valid {
  color: var(--primary-text-color);
}

.ratio-indicator.invalid {
  color: var(--primary-color);
}

.form-actions {
  grid-column: span 2;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
}
</style>
