<template>
  <MyPageContainer
    :title="isCorrectionMode ? '성적 정정 관리' : '성적 입력 관리'"
  >
    <div
      v-if="isCorrectionMode"
      class="welcome-section"
      style="margin-top: 50px"
    >
      <div class="empty-state">
        <p>기능 구현 준비 중입니다.</p>
      </div>
    </div>

    <div v-else>
      <!-- 상단 강의 선택 (MySearchFilter 사용) -->
      <MySearchFilter :showSubmit="false">
        <div class="search-group">
          <label for="lectureSelect">강의 선택</label>
          <select
            id="lectureSelect"
            v-model="selectedLectureId"
            @change="loadGrades"
            class="form-select"
          >
            <option :value="null" disabled>강의를 선택하세요</option>
            <option v-for="lec in lectures" :key="lec.id" :value="lec.id">
              [{{ lec.courseCode }}] {{ lec.courseName }} ({{ lec.classroom }})
            </option>
          </select>
        </div>

        <div v-if="selectedLectureId" class="current-semester-info">
          <span class="label">강의 정보</span>
          <span class="value">
            정원: {{ currentLecture?.capacity }}명 |
            {{ currentLecture?.academicYear }}학년도
            {{ currentLecture?.term === "FIRST" ? "1학기" : "2학기" }}
          </span>
        </div>
      </MySearchFilter>
    </div>

    <!-- 성적 관리 테이블 섹션 (하단 카드) -->
    <div v-if="selectedLectureId" class="content-card">
      <div class="card-header">
        <h3>
          {{ isCorrectionMode ? "이의신청 수강생 목록" : "수강생 성적 입력" }}
        </h3>
        <div class="control-buttons">
          <MyButton
            color="gray"
            size="middle"
            content="임시저장"
            :disabled="hasValidationError || isAllSubmitted"
            @click="handleSave"
          />
          <MyButton
            color="deep-blue"
            size="middle"
            content="성적 일괄 제출"
            :disabled="hasValidationError || isAllSubmitted"
            @click="handleSubmitGrades"
          />
        </div>
      </div>

      <div class="card-body">
        <div v-if="hasValidationError" class="validation-error-alert">
          입력된 성적 중 0점 미만이거나 100점을 초과한 점수가 존재합니다. (0 ~
          100점 사이로 정상 입력하셔야 저장이 가능합니다.)
        </div>

        <MyTable
          :columns="gradeColumns"
          :empty="localGrades.length === 0"
          emptyMessage="수강생이 존재하지 않거나 수강 내역이 없습니다."
        >
          <tr v-for="g in localGrades" :key="g.id">
            <td class="student-name">{{ g.studentName }}</td>
            <td class="code">{{ g.studentLoginId }}</td>
            <td>
              <div class="score-input-cell">
                <MyInput
                  type="text"
                  :modelValue="g.midtermScore"
                  :disabled="g.status !== 'DRAFT' || isGradeSaved(g)"
                  class="table-input"
                  @input="e => handleStrictInput(e, g, 'midtermScore')"
                />
                <span class="converted-score"
                  >{{ convertScore(g.midtermScore, "midterm") }}점</span
                >
              </div>
            </td>
            <td>
              <div class="score-input-cell">
                <MyInput
                  type="text"
                  :modelValue="g.finalScore"
                  :disabled="g.status !== 'DRAFT' || isGradeSaved(g)"
                  class="table-input"
                  @input="e => handleStrictInput(e, g, 'finalScore')"
                />
                <span class="converted-score"
                  >{{ convertScore(g.finalScore, "final") }}점</span
                >
              </div>
            </td>
            <td>
              <div class="score-input-cell">
                <MyInput
                  type="text"
                  :modelValue="g.assignmentScore"
                  :disabled="g.status !== 'DRAFT' || isGradeSaved(g)"
                  class="table-input"
                  @input="e => handleStrictInput(e, g, 'assignmentScore')"
                />
                <span class="converted-score"
                  >{{ convertScore(g.assignmentScore, "assignment") }}점</span
                >
              </div>
            </td>
            <td>
              <div class="score-input-cell">
                <MyInput
                  type="text"
                  :modelValue="g.attendanceScore"
                  :disabled="g.status !== 'DRAFT' || isGradeSaved(g)"
                  class="table-input"
                  @input="e => handleStrictInput(e, g, 'attendanceScore')"
                />
                <span class="converted-score"
                  >{{ convertScore(g.attendanceScore, "attendance") }}점</span
                >
              </div>
            </td>
            <td>{{ calculateTotal(g) }}점</td>
            <td>
              <span>{{ determineGrade(calculateTotal(g)) }}</span>
            </td>
            <td>
              <StatusBadge :status="g.status === 'DRAFT' && !isGradeSaved(g) ? 'UNENTERED' : g.status" />
            </td>
            <td v-if="isCorrectionMode">
              <MyButton
                v-if="g.status === 'OPENED' || g.status === 'APPROVED'"
                color="deep-blue"
                size="small"
                content="성적 정정"
                @click="openObjectionModal(g)"
              />
              <span v-else class="text-secondary">-</span>
            </td>
          </tr>
        </MyTable>
      </div>
    </div>

    <!-- 미선택 빈 화면 상태 -->
    <div v-else class="welcome-section">
      <div class="empty-state">
        <p>상단에서 관리하실 강좌를 선택해 주세요.</p>
      </div>
    </div>

    <!-- 성적 정정 모달 -->
    <MyModal
      :isOpen="isObjectionModalOpen"
      title="성적 정정 처리"
      maxWidth="600px"
      @close="closeObjectionModal"
    >
      <div class="objection-info">
        <p>
          <strong>대상 학생:</strong> {{ activeObjection.studentName }} ({{
            activeObjection.studentLoginId
          }})
        </p>
      </div>

      <div class="objection-form">
        <div class="form-group">
          <label for="objectionReply">정정 사유</label>
          <textarea
            id="objectionReply"
            v-model="objectionReplyText"
            rows="3"
            placeholder="성적 정정 사유를 입력해 주세요."
            class="form-textarea"
          ></textarea>
        </div>

        <!-- 승인 시 점수 재입력 폼 -->
        <div class="score-adjust-section">
          <h3>점수 재입력 (승인 시 적용)</h3>
          <div class="adjust-grid">
            <div class="adjust-item">
              <label>중간 ({{ getRatio("midterm") }}%)</label>
              <MyInput
                type="text"
                :modelValue="adjustScores.midtermScore"
                class="form-input"
                @input="e => handleStrictInput(e, adjustScores, 'midtermScore')"
              />
              <span class="converted-score-modal"
                >{{ convertScore(adjustScores.midtermScore, "midterm") }}점</span
              >
            </div>
            <div class="adjust-item">
              <label>기말 ({{ getRatio("final") }}%)</label>
              <MyInput
                type="text"
                :modelValue="adjustScores.finalScore"
                class="form-input"
                @input="e => handleStrictInput(e, adjustScores, 'finalScore')"
              />
              <span class="converted-score-modal"
                >{{ convertScore(adjustScores.finalScore, "final") }}점</span
              >
            </div>
            <div class="adjust-item">
              <label>과제 ({{ getRatio("assignment") }}%)</label>
              <MyInput
                type="text"
                :modelValue="adjustScores.assignmentScore"
                class="form-input"
                @input="e => handleStrictInput(e, adjustScores, 'assignmentScore')"
              />
              <span class="converted-score-modal"
                >{{
                  convertScore(adjustScores.assignmentScore, "assignment")
                }}점</span
              >
            </div>
            <div class="adjust-item">
              <label>출결 ({{ getRatio("attendance") }}%)</label>
              <MyInput
                type="text"
                :modelValue="adjustScores.attendanceScore"
                class="form-input"
                @input="e => handleStrictInput(e, adjustScores, 'attendanceScore')"
              />
              <span class="converted-score-modal"
                >{{
                  convertScore(adjustScores.attendanceScore, "attendance")
                }}점</span
              >
            </div>
          </div>
          <div
            v-if="hasObjectionValidationError"
            class="validation-error-alert modal-error"
          >
            0점 이상 100점 이하로만 입력 가능합니다.
          </div>
        </div>
      </div>
      
      <template #footer>
        <MyButton
          color="white"
          size="small"
          content="취소"
          @click="closeObjectionModal"
        />
        <MyButton
          color="deep-blue"
          size="small"
          content="정정 반영"
          :disabled="hasObjectionValidationError"
          @click="handleObjectionApprove"
        />
      </template>
    </MyModal>
  </MyPageContainer>
</template>
<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import MyButton from "../../components/button/MyButton.vue";
import MyInput from "../../components/input/MyInput.vue";
import MyTable from "../../components/table/MyTable.vue";
import MyModal from "../../components/common/MyModal.vue";
import MySearchFilter from "../../components/search/MySearchFilter.vue";
import MyPageContainer from "../../components/layout/MyPageContainer.vue";
import StatusBadge from "../../components/common/StatusBadge.vue";
import { useLectureProfessorStore } from "../../store/lecture/useLectureProfessorStore";
import { useGradeProfessorStore } from "../../store/grade/useGradeProfessorStore";

const route = useRoute();
const isCorrectionMode = computed(() => route.path.includes("correct"));

const lectureStore = useLectureProfessorStore();
const gradeStore = useGradeProfessorStore();

const selectedLectureId = ref(null);
const localGrades = ref([]);

// 이의신청 모달 관리
const isObjectionModalOpen = ref(false);
const activeObjection = ref(null);
const objectionReplyText = ref("");
const adjustScores = ref({
  midtermScore: 0,
  finalScore: 0,
  assignmentScore: 0,
  attendanceScore: 0,
});

// 기존 DB에 성적이 하나라도 입력된 적 있는지 확인 (임시저장 판별)
const isGradeSaved = (g) => {
  if (!gradeStore.grades) return false;
  const originalG = gradeStore.grades.find(og => og.id === g.id);
  if (!originalG) return false;
  return originalG.midtermScore !== null || 
         originalG.finalScore !== null || 
         originalG.assignmentScore !== null || 
         originalG.attendanceScore !== null;
};

// 성적 입력 시 즉각적인 100점 제한 및 3자리수 제한 로직
const handleStrictInput = (event, obj, field) => {
  let val = event.target.value;
  
  // 1. 숫자와 소수점만 허용
  val = val.replace(/[^0-9.]/g, '');
  
  // 2. 소수점 여러 개 입력 방지
  const parts = val.split('.');
  if (parts.length > 2) {
    val = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // 3. 정수부 세자리수 제한
  const p = val.split('.');
  if (p[0].length > 3) {
    p[0] = p[0].substring(0, 3);
    val = p.length > 1 ? p[0] + '.' + p[1] : p[0];
  }
  
  // 4. 100 초과 시 즉시 100으로 고정
  if (parseFloat(val) > 100) {
    val = '100';
  }
  
  // 5. DOM에 즉시 반영하여 사용자 입력 시각적 차단
  if (event.target.value !== val) {
    event.target.value = val;
  }
  
  // 6. 객체에 반영
  obj[field] = val === '' ? null : val;
};

const lectures = computed(() => lectureStore.lectures);
const currentLecture = computed(() =>
  lectures.value.find((l) => l.id === selectedLectureId.value)
);

// 테이블 컬럼 정의
const gradeColumns = computed(() => {
  const cols = [
    { key: "studentName", label: "학생 이름" },
    { key: "studentLoginId", label: "학번" },
    { key: "midtermScore", label: `중간고사 (${getRatio("midterm")}%)` },
    { key: "finalScore", label: `기말고사 (${getRatio("final")}%)` },
    { key: "assignmentScore", label: `과제 (${getRatio("assignment")}%)` },
    { key: "attendanceScore", label: `출결 (${getRatio("attendance")}%)` },
    { key: "totalScore", label: "총점" },
    { key: "grade", label: "등급" },
    { key: "status", label: "진행 상태" },
  ];
  if (isCorrectionMode.value) {
    cols.push({ key: "correction", label: "성적 정정" });
  }
  return cols;
});

const getRatio = (type) => {
  if (!currentLecture.value) return 0;
  const lec = currentLecture.value;
  if (type === "midterm")
    return lec.midtermRatio !== undefined ? lec.midtermRatio : 30;
  if (type === "final")
    return lec.finalRatio !== undefined ? lec.finalRatio : 30;
  if (type === "assignment")
    return lec.assignmentRatio !== undefined ? lec.assignmentRatio : 30;
  if (type === "attendance")
    return lec.attendanceRatio !== undefined ? lec.attendanceRatio : 10;
  return 0;
};

const convertScore = (score, type) => {
  const ratio = getRatio(type);
  const val = parseFloat(score) || 0;
  return ((val * ratio) / 100).toFixed(1);
};

const hasValidationError = computed(() => {
  return localGrades.value.some(
    (g) =>
      (g.midtermScore !== null &&
        (g.midtermScore < 0 || g.midtermScore > 100)) ||
      (g.finalScore !== null && (g.finalScore < 0 || g.finalScore > 100)) ||
      (g.assignmentScore !== null &&
        (g.assignmentScore < 0 || g.assignmentScore > 100)) ||
      (g.attendanceScore !== null &&
        (g.attendanceScore < 0 || g.attendanceScore > 100))
  );
});

const isAllSubmitted = computed(() => {
  if (localGrades.value.length === 0) return false;
  return localGrades.value.every((g) => g.status && g.status !== "DRAFT");
});

const hasObjectionValidationError = computed(() => {
  const scores = adjustScores.value;
  return (
    (scores.midtermScore !== null &&
      (scores.midtermScore < 0 || scores.midtermScore > 100)) ||
    (scores.finalScore !== null &&
      (scores.finalScore < 0 || scores.finalScore > 100)) ||
    (scores.assignmentScore !== null &&
      (scores.assignmentScore < 0 || scores.assignmentScore > 100)) ||
    (scores.attendanceScore !== null &&
      (scores.attendanceScore < 0 || scores.attendanceScore > 100))
  );
});

onMounted(async () => {
  try {
    await lectureStore.fetchProfessorLectures();
  } catch (error) {
    alert("개설 강좌를 불러오는 데 실패했습니다.");
  }
});

const loadGrades = async () => {
  if (!selectedLectureId.value) return;
  try {
    await gradeStore.fetchGrades(selectedLectureId.value);
    localGrades.value = JSON.parse(JSON.stringify(gradeStore.grades)); // 딥카피하여 에디트 지원
  } catch (error) {
    alert("성적 정보를 불러오는 데 실패했습니다.");
  }
};

const calculateTotal = (g) => {
  if (!currentLecture.value) return 0;
  const lec = currentLecture.value;
  const mRatio = lec.midtermRatio !== undefined ? lec.midtermRatio : 30;
  const fRatio = lec.finalRatio !== undefined ? lec.finalRatio : 30;
  const aRatio = lec.assignmentRatio !== undefined ? lec.assignmentRatio : 30;
  const attRatio = lec.attendanceRatio !== undefined ? lec.attendanceRatio : 10;

  const total =
    (g.midtermScore || 0) * mRatio +
    (g.finalScore || 0) * fRatio +
    (g.assignmentScore || 0) * aRatio +
    (g.attendanceScore || 0) * attRatio;

  return (total / 100).toFixed(2);
};

const determineGrade = (score) => {
  const val = parseFloat(score);
  if (val >= 95.0) return "A+";
  if (val >= 90.0) return "A";
  if (val >= 85.0) return "B+";
  if (val >= 80.0) return "B";
  if (val >= 75.0) return "C+";
  if (val >= 70.0) return "C";
  if (val >= 65.0) return "D+";
  if (val >= 60.0) return "D";
  return "F";
};

// 임시저장
const handleSave = async () => {
  if (!selectedLectureId.value) return;

  for (const g of localGrades.value) {
    if (
      (g.midtermScore !== null &&
        (g.midtermScore < 0 || g.midtermScore > 100)) ||
      (g.finalScore !== null && (g.finalScore < 0 || g.finalScore > 100)) ||
      (g.assignmentScore !== null &&
        (g.assignmentScore < 0 || g.assignmentScore > 100)) ||
      (g.attendanceScore !== null &&
        (g.attendanceScore < 0 || g.attendanceScore > 100))
    ) {
      alert("성적 점수는 0점 이상 100점 이하로만 입력 가능합니다.");
      return;
    }
  }

  const payload = localGrades.value.map((g) => ({
    enrollmentId: g.enrollmentId,
    midtermScore: g.midtermScore,
    finalScore: g.finalScore,
    assignmentScore: g.assignmentScore,
    attendanceScore: g.attendanceScore,
  }));

  try {
    await gradeStore.saveGrades(selectedLectureId.value, payload);
    alert("성적이 정상적으로 임시저장되었습니다.");
    await loadGrades();
  } catch (error) {
    alert("성적 저장 중 오류가 발생했습니다.");
  }
};

// 성적 제출
const handleSubmitGrades = async () => {
  if (!selectedLectureId.value) return;

  // 수정된(저장되지 않은) 성적이 있는지 검사
  const hasUnsavedChanges = localGrades.value.some((localG) => {
    const originalG = gradeStore.grades.find((g) => g.id === localG.id);
    if (!originalG) return false;
    return (
      localG.midtermScore !== originalG.midtermScore ||
      localG.finalScore !== originalG.finalScore ||
      localG.assignmentScore !== originalG.assignmentScore ||
      localG.attendanceScore !== originalG.attendanceScore
    );
  });

  if (hasUnsavedChanges) {
    alert(
      "수정된 성적이 있습니다. 먼저 [임시저장]을 눌러 변경사항을 저장한 후 제출해주세요."
    );
    return;
  }

  if (
    !confirm(
      "성적을 최종 제출하시겠습니까? 제출 후 학생 공개 여부 결정 전까지만 수정 가능합니다."
    )
  )
    return;

  try {
    await gradeStore.updateGradesStatus(selectedLectureId.value, "SUBMITTED");
    alert("성적 일괄 제출 완료");
    await loadGrades();
  } catch (error) {
    alert("성적 제출 중 오류가 발생했습니다.");
  }
};

// 이의신청 모달 팝업 오픈 (이제 성적 정정으로 사용)
const openObjectionModal = (g) => {
  activeObjection.value = g;
  objectionReplyText.value = g.objectionReply || "";
  adjustScores.value = {
    midtermScore: g.midtermScore,
    finalScore: g.finalScore,
    assignmentScore: g.assignmentScore,
    attendanceScore: g.attendanceScore,
  };
  isObjectionModalOpen.value = true;
};

const closeObjectionModal = () => {
  isObjectionModalOpen.value = false;
  activeObjection.value = null;
};

// 성적 정정 승인 (APPROVED 처리 및 성적 갱신)
const handleObjectionApprove = async () => {
  if (!activeObjection.value) return;

  const scores = adjustScores.value;
  if (
    (scores.midtermScore !== null &&
      (scores.midtermScore < 0 || scores.midtermScore > 100)) ||
    (scores.finalScore !== null &&
      (scores.finalScore < 0 || scores.finalScore > 100)) ||
    (scores.assignmentScore !== null &&
      (scores.assignmentScore < 0 || scores.assignmentScore > 100)) ||
    (scores.attendanceScore !== null &&
      (scores.attendanceScore < 0 || scores.attendanceScore > 100))
  ) {
    alert("성적 점수는 0점 이상 100점 이하로만 입력 가능합니다.");
    return;
  }

  try {
    await gradeStore.replyObjection(activeObjection.value.id, {
      approve: true,
      reply: objectionReplyText.value,
      newScores: {
        enrollmentId: activeObjection.value.enrollmentId,
        midtermScore: adjustScores.value.midtermScore,
        finalScore: adjustScores.value.finalScore,
        assignmentScore: adjustScores.value.assignmentScore,
        attendanceScore: adjustScores.value.attendanceScore,
      },
    });
    alert("성적 정정이 완료되었습니다.");
    closeObjectionModal();
    await loadGrades();
  } catch (error) {
    alert("정정 처리 중 오류가 발생했습니다.");
  }
};
</script>

<style scoped>
.form-select {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  color: #1a1f36;
  font-size: 0.9rem;
  cursor: pointer;
  min-width: 320px;
  height: 38px;
  box-sizing: border-box;
}

.current-semester-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: flex-end;
  padding-bottom: 2px;
  text-align: left;
}

.current-semester-info .label {
  color: #4f566b;
  font-size: 0.85rem;
  font-weight: 600;
}

.current-semester-info .value {
  color: var(--primary-color);
  font-size: 0.95rem;
  font-weight: 700;
  padding: 8px 0;
}

/* 성적 상세 내용 카드 */
.content-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #edf2f7;
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #edf2f7;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  color: #1a1f36;
  font-size: 1.1rem;
  font-weight: 700;
}

.card-body {
  padding: 20px;
}

.control-buttons {
  display: flex;
  gap: 8px;
}

/* 입력 필드 크기 및 형태 */
.table-input {
  width: 70px;
  text-align: center;
  height: 32px;
  font-size: 0.9rem;
}

.score-input-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.converted-score {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

/* 빈 화면 안내 */
.welcome-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #edf2f7;
  padding: 80px 0;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-state p {
  color: #64748b;
  font-size: 1.05rem;
  font-weight: 500;
}

.validation-error-alert {
  color: var(--primary-color);
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: left;
}

.objection-info {
  margin-bottom: 20px;
  text-align: left;
}

.objection-info p {
  margin-bottom: 8px;
  font-size: 0.95rem;
  color: #1a1f36;
}

.reason-box {
  background: #f8fafc;
  padding: 14px;
  border-radius: 6px;
  margin-top: 8px;
  border: 1px solid #edf2f7;
}

.reason-text {
  color: #4f566b;
  white-space: pre-wrap;
  margin-top: 4px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.objection-form {
  text-align: left;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1f36;
}

.form-textarea {
  width: 100%;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px 12px;
  color: #1a1f36;
  outline: none;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
}

.form-textarea:focus {
  border-color: var(--secondary-blue);
}

.score-adjust-section {
  margin-top: 20px;
}

.score-adjust-section h3 {
  font-size: 0.9rem;
  color: var(--primary-color);
  margin-bottom: 12px;
  font-weight: 600;
}

.adjust-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.adjust-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.adjust-item label {
  font-size: 0.8rem;
  color: #4f566b;
  font-weight: 600;
  text-align: center;
}

.adjust-grid .form-input {
  width: 100%;
  height: 36px;
  text-align: center;
  font-size: 0.9rem;
}

.converted-score-modal {
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
  margin-top: 2px;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid #edf2f7;
  padding-top: 16px;
}
</style>
