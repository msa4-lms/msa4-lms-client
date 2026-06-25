<script setup>
import { computed, onMounted, ref } from "vue";
import MyButton from "../../components/button/MyButton.vue";
import MyInput from "../../components/input/MyInput.vue";
import MyTable from "../../components/table/MyTable.vue";
import MySearchFilter from "../../components/search/MySearchFilter.vue";
import MyPageContainer from "../../components/layout/MyPageContainer.vue";
import StatusBadge from "../../components/common/StatusBadge.vue";
import { useGradeProfessorStore } from "../../store/grade/useGradeProfessorStore";

const gradeStore = useGradeProfessorStore();

const selectedLectureId = ref("");
const editableGrades = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);

const gradeOptions = ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"];
const scoreFields = [
  { key: "midtermScore", label: "중간고사", ratioKey: "midterm" },
  { key: "finalScore", label: "기말고사", ratioKey: "final" },
  { key: "assignmentScore", label: "과제", ratioKey: "assignment" },
  { key: "attendanceScore", label: "출석", ratioKey: "attendance" },
];

const lectures = computed(() => gradeStore.lectures);
const currentLecture = computed(() =>
  lectures.value.find(
    (lecture) => String(lecture.id) === String(selectedLectureId.value)
  )
);

const getRatio = (type) => {
  const lecture = currentLecture.value;
  if (!lecture) return 0;

  const ratioKeys = {
    midterm: "midtermRatio",
    final: "finalRatio",
    assignment: "assignmentRatio",
    attendance: "attendanceRatio",
  };
  const defaults = {
    midterm: 30,
    final: 30,
    assignment: 30,
    attendance: 10,
  };

  return Number(lecture[ratioKeys[type]] ?? defaults[type]);
};

const columns = computed(() => [
  { key: "student", label: "수강생" },
  ...scoreFields.map((field) => ({
    key: field.key,
    label: `${field.label} (${getRatio(field.ratioKey)}%)`,
  })),
  { key: "total", label: "총점" },
  { key: "grade", label: "등급" },
  { key: "status", label: "진행 상태" },
  { key: "correction", label: "정정 방식" },
]);

const normalizeScore = (score) => {
  if (score === null || score === undefined || score === "") return 0;
  return Number(score);
};

const calculateTotal = (grade) => {
  const total = scoreFields.reduce((sum, field) => {
    return (
      sum + normalizeScore(grade[field.key]) * (getRatio(field.ratioKey) / 100)
    );
  }, 0);

  return total.toFixed(2);
};

const determineGrade = (score) => {
  const value = Number(score);
  if (value >= 95) return "A+";
  if (value >= 90) return "A";
  if (value >= 85) return "B+";
  if (value >= 80) return "B";
  if (value >= 75) return "C+";
  if (value >= 70) return "C";
  if (value >= 65) return "D+";
  if (value >= 60) return "D";
  return "F";
};

const hasScoreChanges = (grade) =>
  scoreFields.some(
    (field) =>
      normalizeScore(grade[field.key]) !==
      normalizeScore(grade.original[field.key])
  );

const resolvedGrade = (grade) => {
  if (grade.editMode === "GRADE") return grade.selectedGrade;
  if (hasScoreChanges(grade)) return determineGrade(calculateTotal(grade));
  return grade.originalGrade;
};

const displayScore = (score) =>
  score === null || score === undefined || score === "" ? "-" : score;

const hasSavedScore = (grade) =>
  scoreFields.some(
    (field) =>
      grade[field.key] !== null &&
      grade[field.key] !== undefined &&
      grade[field.key] !== ""
  );

const canCorrect = (grade) =>
  grade.status === "DRAFT" || (!grade.status && hasSavedScore(grade));

const termLabel = (term) => {
  if (term === "FIRST" || term === 1 || term === "1") return "1학기";
  if (term === "SECOND" || term === 2 || term === "2") return "2학기";
  return term || "";
};

const createEditableGrade = (grade) => {
  const original = Object.fromEntries(
    scoreFields.map((field) => [field.key, grade[field.key]])
  );
  const originalTotal = calculateTotal(original);
  const originalGrade = grade.grade || determineGrade(originalTotal);

  return {
    ...grade,
    ...original,
    editMode: "SCORE",
    selectedGrade: originalGrade,
    original,
    originalTotal,
    originalGrade,
  };
};

const loadGrades = async () => {
  if (!selectedLectureId.value) return;

  isLoading.value = true;
  editableGrades.value = [];

  try {
    await gradeStore.fetchGrades(selectedLectureId.value);
    editableGrades.value = gradeStore.grades.map(createEditableGrade);
  } catch (error) {
    alert("성적 정보를 불러오는 데 실패했습니다.");
  } finally {
    isLoading.value = false;
  }
};

const setEditMode = (grade, mode) => {
  if (!canCorrect(grade)) return;
  grade.editMode = mode;
  if (mode === "GRADE" && !grade.selectedGrade) {
    grade.selectedGrade = determineGrade(calculateTotal(grade));
  }
};

const selectScoreMode = (grade) => {
  grade.editMode = "SCORE";
};

const handleScoreInput = (grade, fieldKey, value) => {
  if (!canCorrect(grade)) return;
  grade[fieldKey] = value === "" ? "" : Number(value);
  selectScoreMode(grade);
};

const isScoreInvalid = (score) => {
  if (score === null || score === undefined || score === "") return false;
  const value = Number(score);
  return Number.isNaN(value) || value < 0 || value > 100;
};

const hasValidationError = computed(() =>
  editableGrades.value.some(
    (grade) =>
      canCorrect(grade) &&
      scoreFields.some((field) => isScoreInvalid(grade[field.key]))
  )
);

const isChanged = (grade) => {
  if (!canCorrect(grade)) return false;

  const scoreChanged = hasScoreChanges(grade);
  const gradeChanged =
    grade.editMode === "GRADE" && grade.selectedGrade !== grade.originalGrade;

  return scoreChanged || gradeChanged;
};

const changedGrades = computed(() => editableGrades.value.filter(isChanged));
const changedCount = computed(() => changedGrades.value.length);
const hasChanges = computed(() => changedCount.value > 0);

const saveCorrections = async () => {
  if (!hasChanges.value || hasValidationError.value) return;

  if (
    !confirm(
      `${changedCount.value}명의 성적을 정정하시겠습니까? 저장 후 변경된 성적이 즉시 반영됩니다.`
    )
  ) {
    return;
  }

  const gradeList = changedGrades.value.map((grade) => ({
    enrollmentId: grade.enrollmentId,
    midtermScore: grade.midtermScore,
    finalScore: grade.finalScore,
    assignmentScore: grade.assignmentScore,
    attendanceScore: grade.attendanceScore,
    grade: resolvedGrade(grade),
    correctionType: grade.editMode,
  }));

  isSaving.value = true;
  try {
    await gradeStore.correctGrades(selectedLectureId.value, gradeList);
    alert("성적 정정이 완료되었습니다.");
    await loadGrades();
  } catch (error) {
    alert("성적 정정 중 오류가 발생했습니다.");
  } finally {
    isSaving.value = false;
  }
};

onMounted(async () => {
  try {
    await gradeStore.getLectures();
  } catch (error) {
    alert("현재 학기 강의 목록을 불러오는 데 실패했습니다.");
  }
});
</script>

<template>
  <MyPageContainer title="성적 정정">
    <MySearchFilter :showSubmit="false">
      <div class="search-group">
        <label for="lectureSelect">강의 선택</label>
        <select
          id="lectureSelect"
          v-model="selectedLectureId"
          class="form-select"
          @change="loadGrades"
        >
          <option value="" disabled>정정할 강의를 선택하세요.</option>
          <option
            v-for="lecture in lectures"
            :key="lecture.id"
            :value="lecture.id"
          >
            [{{ lecture.courseCode }}] {{ lecture.courseName }}
            <template v-if="lecture.classroom">
              ({{ lecture.classroom }})</template
            >
          </option>
        </select>
      </div>

      <div v-if="currentLecture" class="lecture-info">
        <span class="lecture-info-label">강의 정보</span>
        <span>
          {{ currentLecture.academicYear }}학년도
          {{ termLabel(currentLecture.term) }}
          <template v-if="currentLecture.capacity">
            · 정원 {{ currentLecture.capacity }}명
          </template>
        </span>
      </div>
    </MySearchFilter>

    <section v-if="selectedLectureId" class="content-card">
      <div class="card-header">
        <div>
          <h3>수강생 성적 정정</h3>
        </div>
        <MyButton
          color="deep-blue"
          size="middle"
          content="변경사항 저장"
          :disabled="isSaving || !hasChanges || hasValidationError"
          @click="saveCorrections"
        />
      </div>

      <div v-if="hasValidationError" class="validation-alert">
        점수는 0점 이상 100점 이하로 입력해 주세요.
      </div>

      <MyTable
        :columns="columns"
        :loading="isLoading"
        :empty="!isLoading && editableGrades.length === 0"
        emptyMessage="정정할 수강생 성적이 없습니다."
      >
        <tr
          v-for="grade in editableGrades"
          :key="grade.id || grade.enrollmentId"
          :class="{ 'changed-row': isChanged(grade) }"
        >
          <td class="student-cell">
            <strong>{{ grade.studentName }}</strong>
            <span>{{ grade.studentLoginId }}</span>
          </td>

          <td v-for="scoreField in scoreFields" :key="scoreField.key">
            <div class="score-cell">
              <MyInput
                :model-value="grade[scoreField.key]"
                type="text"
                inputmode="numeric"
                maxlength="3"
                numeric-only
                :max-number="100"
                :disabled="!canCorrect(grade) || grade.editMode === 'GRADE'"
                class="score-input"
                @update:model-value="
                  handleScoreInput(grade, scoreField.key, $event)
                "
              />
              <span class="original-value">
                기존 {{ displayScore(grade.original[scoreField.key]) }}
              </span>
            </div>
          </td>

          <td>
            <div class="result-cell">
              <strong>{{ calculateTotal(grade) }}</strong>
              <span>기존 {{ grade.originalTotal }}</span>
            </div>
          </td>

          <td>
            <div class="result-cell">
              <strong>{{ resolvedGrade(grade) }}</strong>
              <span>기존 {{ grade.originalGrade }}</span>
            </div>
          </td>

          <td>
            <StatusBadge :status="grade.status || 'DRAFT'" />
          </td>

          <td>
            <div class="correction-controls">
              <div class="mode-buttons">
                <button
                  type="button"
                  :class="{ active: grade.editMode === 'SCORE' }"
                  :disabled="!canCorrect(grade)"
                  @click="setEditMode(grade, 'SCORE')"
                >
                  점수로 수정
                </button>
                <button
                  type="button"
                  :class="{ active: grade.editMode === 'GRADE' }"
                  :disabled="!canCorrect(grade)"
                  @click="setEditMode(grade, 'GRADE')"
                >
                  등급 직접 수정
                </button>
              </div>

              <select
                v-if="grade.editMode === 'GRADE'"
                v-model="grade.selectedGrade"
                class="grade-select"
                aria-label="정정 등급"
                :disabled="!canCorrect(grade)"
              >
                <option
                  v-for="option in gradeOptions"
                  :key="option"
                  :value="option"
                >
                  {{ option }}
                </option>
              </select>
              <span v-if="!canCorrect(grade)" class="locked-text">
                제출된 성적은 수정할 수 없습니다.
              </span>
            </div>
          </td>
        </tr>
      </MyTable>

      <div v-if="hasChanges" class="change-summary">
        {{ changedCount }}명의 성적이 변경되었습니다.
      </div>
    </section>

    <section v-else class="empty-state">
      <p>상단에서 성적을 정정할 강의를 선택해 주세요.</p>
    </section>
  </MyPageContainer>
</template>

<style scoped>
.form-select {
  min-width: 340px;
  height: 38px;
  padding: 8px 12px;
  border: 1px solid #d8dee9;
  border-radius: 6px;
  background: #fff;
  color: #1a1f36;
  font-size: 0.9rem;
}

.lecture-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 2px;
  color: var(--primary-color);
  font-size: 0.95rem;
  font-weight: 700;
}

.lecture-info-label {
  color: #4f566b;
  font-size: 0.85rem;
  font-weight: 600;
}

.content-card {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #fff;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 5px;
  border-bottom: 1px solid #edf2f7;
}

.card-header h3 {
  margin: 0 0 6px;
  color: #1a1f36;
  font-size: 1.1rem;
}

.card-header p {
  margin: 0;
  color: #697386;
  font-size: 0.85rem;
}

.validation-alert {
  margin: 16px 20px 0;
  padding: 12px 14px;
  border-radius: 8px;
  background: #fff4f4;
  color: #c53030;
  font-size: 0.9rem;
  font-weight: 600;
}

.content-card :deep(.table-container) {
  display: block;
  width: 100%;
  max-width: 100%;
  border: 0;
  border-radius: 0;
  overflow-x: auto !important;
  overflow-y: hidden;
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}

.content-card :deep(.my-table) {
  width: 100%;
  min-width: 1120px;
}

.content-card :deep(th) {
  padding: 14px 10px;
}

.content-card :deep(td) {
  min-width: 96px;
  padding: 12px 8px;
}

.content-card :deep(th:first-child),
.content-card :deep(td:first-child) {
  min-width: 100px;
}

.content-card :deep(th:last-child),
.content-card :deep(td:last-child) {
  min-width: 210px;
}

.changed-row {
  background: #f7fbff;
}

.score-cell,
.result-cell,
.correction-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.student-cell {
  text-align: center;
}

.student-cell strong {
  display: block;
  color: #1a1f36;
  white-space: nowrap;
}

.student-cell span {
  display: block;
  margin-top: 5px;
}

.student-cell span,
.original-value,
.result-cell span {
  color: #8a94a6;
  font-size: 0.75rem;
  white-space: nowrap;
}

.score-input {
  width: 64px;
  height: 34px;
  box-sizing: border-box;
  border: 1px solid #d8dee9;
  border-radius: 5px;
  text-align: center;
}

.score-input:focus,
.grade-select:focus {
  border-color: var(--primary-color);
  outline: none;
}

.score-input:disabled {
  background: #f3f4f6;
  color: #9ca3af;
}

.result-cell strong {
  color: #1a1f36;
  font-size: 0.95rem;
}

.mode-buttons {
  display: flex;
  overflow: hidden;
  border: 1px solid #d8dee9;
  border-radius: 6px;
}

.mode-buttons button {
  padding: 7px 9px;
  border: 0;
  border-right: 1px solid #d8dee9;
  background: #fff;
  color: #697386;
  font-size: 0.75rem;
  cursor: pointer;
  white-space: nowrap;
}

.mode-buttons button:last-child {
  border-right: 0;
}

.mode-buttons button.active {
  background: var(--primary-color);
  color: #fff;
}

.mode-buttons button:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.grade-select {
  width: 100%;
  height: 34px;
  border: 1px solid #d8dee9;
  border-radius: 5px;
  background: #fff;
  text-align: center;
}

.locked-text {
  color: #8a94a6;
  font-size: 0.72rem;
  white-space: nowrap;
}

.change-summary {
  padding: 14px 24px;
  border-top: 1px solid #edf2f7;
  background: #f8fafc;
  color: var(--primary-color);
  font-size: 0.9rem;
  font-weight: 700;
  text-align: right;
}

.empty-state {
  padding: 80px 20px;
  color: #697386;
  text-align: center;
}

@media (max-width: 720px) {
  .card-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .form-select {
    min-width: 100%;
    width: 100%;
  }

  .content-card :deep(th) {
    padding: 12px 8px;
    font-size: 0.78rem;
  }

  .content-card :deep(td) {
    min-width: 88px;
    padding: 10px 6px;
  }

  .mode-buttons button {
    padding: 7px 6px;
  }
}
</style>
