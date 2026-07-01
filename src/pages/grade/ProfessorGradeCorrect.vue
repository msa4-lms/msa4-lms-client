<script setup>
import { computed, onMounted, ref } from "vue";
import MyButton from "../../components/button/MyButton.vue";
import MyInput from "../../components/input/MyInput.vue";
import MyTable from "../../components/table/MyTable.vue";
import MySearchFilter from "../../components/search/MySearchFilter.vue";
import MyPageContainer from "../../components/layout/MyPageContainer.vue";
import StatusBadge from "../../components/common/StatusBadge.vue";
import { useGradeProfessorStore } from "../../store/grade/useGradeProfessorStore";
import { notify, confirmDialog } from "../../composables/useDialog";

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

// [수정됨] 이름 컬럼 라벨 변경 및 '+ 부여' 컬럼 제거
const columns = computed(() => [
  { key: "studentName", label: "이름" },
  { key: "studentNo", label: "학번" },
  ...scoreFields.map((field) => ({
    key: field.key,
    label: `${field.label} (${getRatio(field.ratioKey)}%)`,
  })),
  { key: "total", label: "총점" },
  { key: "grade", label: "등급" },
  { key: "status", label: "진행 상태" },
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
  let baseGrade;
  if (grade.editMode === "GRADE") {
    baseGrade = grade.selectedGrade;
  } else if (hasScoreChanges(grade)) {
    baseGrade = determineGrade(calculateTotal(grade));
  } else {
    baseGrade = grade.originalGrade;
  }

  // hasPlus 체크박스 반영: F 등급은 +가 없음
  if (baseGrade.includes('F')) return 'F';

  const letter = baseGrade.replace('+', '');
  return grade.hasPlus ? letter + '+' : letter;
};

const displayScore = (score) =>
  score === null || score === undefined || score === "" ? "-" : score;

const displayStatus = (grade) =>
  grade.status === "OPENED" || grade.status === "FINAL"
    ? grade.status
    : "UNENTERED";

// 학생에게 공개된(OPENED) 성적만 정정 가능. 미입력(DRAFT)/최종확정(FINAL)은 정정 불가.
const canCorrect = (grade) => grade.status === "OPENED";

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
    hasPlus: originalGrade.includes('+'),
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
    console.error("성적 조회 실패:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleScoreInput = (grade, fieldKey, value) => {
  if (!canCorrect(grade)) return;
  grade[fieldKey] = value === "" ? "" : Number(value);
  
  const newTotal = calculateTotal(grade);
  const autoGrade = determineGrade(newTotal);
  grade.hasPlus = autoGrade.includes('+');
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

const hasChanges = computed(() => {
  return editableGrades.value.some(
    (grade) => canCorrect(grade) && (hasScoreChanges(grade) || resolvedGrade(grade) !== grade.originalGrade)
  );
});

const changedCount = computed(() => {
  return editableGrades.value.filter(
    (grade) => canCorrect(grade) && (hasScoreChanges(grade) || resolvedGrade(grade) !== grade.originalGrade)
  ).length;
});

const saveCorrections = async () => {
  if (!hasChanges.value || hasValidationError.value) return;

  if (
    !(await confirmDialog(
      `${changedCount.value}명의 성적을 정정하시겠습니까? 저장 후 변경된 성적이 즉시 반영됩니다.`
    ))
  ) {
    return;
  }

  const gradeList = editableGrades.value
    .filter((grade) => canCorrect(grade) && (hasScoreChanges(grade) || resolvedGrade(grade) !== grade.originalGrade))
    .map((grade) => ({
      enrollmentId: grade.enrollmentId,
      midtermScore: grade.midtermScore,
      finalScore: grade.finalScore,
      assignmentScore: grade.assignmentScore,
      attendanceScore: grade.attendanceScore,
      grade: resolvedGrade(grade),
    }));

  isSaving.value = true;
  try {
    await gradeStore.correctGrades(selectedLectureId.value, gradeList);
    notify("성적 정정이 완료되었습니다.");
    await loadGrades();
  } catch (error) {
    console.error("성적 정정 실패:", error);
  } finally {
    isSaving.value = false;
  }
};

onMounted(async () => {
  try {
    await gradeStore.getLectures();
  } catch (error) {
    console.error("강의 목록 조회 실패:", error);
  }
});
</script>

<template>
  <MyPageContainer title="성적 정정 기간 관리">
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

    <section class="grade-section">
      <h3>수강생 성적 정정</h3>
      
      <div v-if="hasValidationError" class="validation-alert">
        점수는 0점 이상 100점 이하로 입력해 주세요.
      </div>

      <div class="table-card">
        <MyTable
          :columns="columns"
          :loading="isLoading"
          :empty="!isLoading && editableGrades.length === 0"
          emptyMessage="정정할 수강생 성적이 없습니다."
        >
          <tr
            v-for="grade in editableGrades"
            :key="grade.id || grade.enrollmentId"
            :class="{ 'changed-row': canCorrect(grade) && (hasScoreChanges(grade) || resolvedGrade(grade) !== grade.originalGrade) }"
          >
            <td>{{ grade.studentName }}</td>
            <td>{{ grade.studentLoginId }}</td>

            <td v-for="scoreField in scoreFields" :key="scoreField.key">
              <div class="score-cell">
                <MyInput
                  :model-value="grade[scoreField.key]"
                  type="text"
                  inputmode="numeric"
                  maxlength="3"
                  numeric-only
                  :max-number="100"
                  :disabled="!canCorrect(grade)"
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
                <span class="original-value">기존 {{ grade.originalTotal }}</span>
              </div>
            </td>

            <td>
              <div class="result-cell">
                <div class="grade-with-checkbox">
                  <strong>{{ resolvedGrade(grade) }}</strong>
                  <input
                    v-if="canCorrect(grade) && !resolvedGrade(grade).includes('F')"
                    type="checkbox"
                    v-model="grade.hasPlus"
                  />
                </div>
                <span class="original-value">기존 {{ grade.originalGrade }}</span>
              </div>
            </td>

            <td>
              <StatusBadge :status="displayStatus(grade)" />
            </td>
          </tr>
        </MyTable>

        <div v-if="hasChanges" class="change-summary">
          {{ changedCount }}명의 성적이 변경되었습니다.
        </div>
      </div>
      <div class="common-section-header save-bar">
        <MyButton
          color="deep-blue"
          size="middle"
          content="변경사항 저장"
          :disabled="isSaving || !hasChanges || hasValidationError"
          @click="saveCorrections"
        />
      </div>
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

.save-bar {
  justify-content: flex-end;
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

.grade-section {
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.validation-alert {
  margin: 0 0 12px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #fff4f4;
  color: #c53030;
  font-size: 0.9rem;
  font-weight: 600;
}

.table-card {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #fff;
}

.table-card :deep(.table-container) {
  display: block;
  width: 100%;
  max-width: 100%;
  border: 0;
  border-radius: 0;
  overflow-x: auto !important;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

.table-card :deep(.my-table) {
  width: 100%;
  min-width: 1080px;
}

.table-card :deep(th) {
  padding: 14px 10px;
}

.table-card :deep(td) {
  min-width: 96px;
  padding: 12px 8px;
}

.table-card :deep(th:first-child),
.table-card :deep(td:first-child) {
  min-width: 100px;
}

.table-card :deep(th:last-child),
.table-card :deep(td:last-child) {
  min-width: 190px;
  padding-right: 14px;
}

.changed-row {
  background: #f7fbff;
}

.score-cell,
.result-cell {
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

.score-input:focus {
  border-color: var(--primary-color);
  outline: none;
}

.score-input:disabled {
  background: #f3f4f6;
  color: #9ca3af;
}

.result-cell strong {
  color: #1a1f36;
  font-size: inherit;
  font-weight: normal;
}

.grade-with-checkbox {
  display: flex;
  align-items: center;
  gap: 4px;
}

.grade-with-checkbox input {
  margin: 0;
  cursor: pointer;
}

.locked-text {
  color: #c53030;
  font-size: 0.75rem;
  text-align: center;
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
  background-color: var(--personal-color-white);
  border-radius: 6px;
}

@media (max-width: 720px) {
  .common-section-header {
    align-items: flex-end;
    justify-content: flex-end;
  }

  .form-select {
    min-width: 100%;
    width: 100%;
  }

  .table-card :deep(th) {
    padding: 12px 8px;
    font-size: 0.78rem;
  }

  .table-card :deep(td) {
    min-width: 88px;
    padding: 10px 6px;
  }

  .mode-buttons button {
    padding: 7px 6px;
  }
}
</style>