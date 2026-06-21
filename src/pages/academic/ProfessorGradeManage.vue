<template>
  <div class="grade-manage-container">
    <div class="glass-dashboard">
      <div class="header-section">
        <div>
          <h1 class="dashboard-title">교수 성적 관리 포털</h1>
          <p class="subtitle">담당하시는 강좌의 수강생 성적 입력, 상태 관리 및 이의신청을 처리할 수 있습니다.</p>
        </div>
        
        <!-- 강좌 선택 셀렉터 -->
        <div class="lecture-selector-group">
          <label for="lectureSelect">강좌 선택</label>
          <select id="lectureSelect" v-model="selectedLectureId" @change="loadGrades" class="form-select">
            <option :value="null" disabled>강좌를 선택하세요</option>
            <option v-for="lec in lectures" :key="lec.id" :value="lec.id">
              [{{ lec.courseCode }}] {{ lec.courseName }} ({{ lec.classroom }})
            </option>
          </select>
        </div>
      </div>

      <!-- 성적 관리 테이블 섹션 -->
      <div v-if="selectedLectureId" class="content-section">
        <div class="action-bar">
          <div class="lecture-info-tags">
            <span class="info-tag">정원: {{ currentLecture?.capacity }}명</span>
            <span class="info-tag">학기: {{ currentLecture?.academicYear }}학년도 {{ currentLecture?.term === 'FIRST' ? '1학기' : '2학기' }}</span>
          </div>

          <div class="control-buttons">
            <button @click="handleSave" class="btn-secondary">임시저장 (DRAFT)</button>
            <button @click="handleSubmitGrades" class="btn-primary">성적 일괄 제출 (SUBMIT)</button>
            <button @click="handlePublishGrades" class="btn-success">성적 전체 공개 (OPEN)</button>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>학생 이름</th>
                <th>학번</th>
                <th>중간고사</th>
                <th>기말고사</th>
                <th>과제</th>
                <th>출결</th>
                <th>가중 총점</th>
                <th>최종 등급</th>
                <th>진행 상태</th>
                <th>이의신청 관리</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="g in localGrades" :key="g.id">
                <td class="font-bold">{{ g.studentName }}</td>
                <td class="text-secondary">{{ g.studentLoginId }}</td>
                <td>
                  <input
                    type="number"
                    v-model.number="g.midtermScore"
                    min="0"
                    max="100"
                    step="0.01"
                    :disabled="g.status === 'FINAL'"
                    class="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    v-model.number="g.finalScore"
                    min="0"
                    max="100"
                    step="0.01"
                    :disabled="g.status === 'FINAL'"
                    class="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    v-model.number="g.assignmentScore"
                    min="0"
                    max="100"
                    step="0.01"
                    :disabled="g.status === 'FINAL'"
                    class="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    v-model.number="g.attendanceScore"
                    min="0"
                    max="100"
                    step="0.01"
                    :disabled="g.status === 'FINAL'"
                    class="table-input"
                  />
                </td>
                <td class="font-bold text-accent">{{ calculateTotal(g) }}</td>
                <td class="font-bold text-accent">{{ determineGrade(calculateTotal(g)) }}</td>
                <td>
                  <span :class="['status-badge', g.status.toLowerCase()]">
                    {{ g.status }}
                  </span>
                </td>
                <td>
                  <button
                    v-if="g.status === 'OBJECTION'"
                    @click="openObjectionModal(g)"
                    class="btn-warn btn-sm"
                  >
                    이의신청 보기
                  </button>
                  <span v-else class="text-secondary">-</span>
                </td>
              </tr>
              <tr v-if="localGrades.length === 0">
                <td colspan="10" class="no-data">수강생이 존재하지 않거나 수강 내역이 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="welcome-section">
        <p>상단에서 관리하실 강좌를 선택해 주세요.</p>
      </div>
    </div>

    <!-- 이의신청 처리 모달 -->
    <div v-if="isObjectionModalOpen" class="modal-overlay">
      <div class="modal-card">
        <h2>성적 이의신청 처리</h2>
        <div class="modal-body">
          <div class="objection-info">
            <p><strong>신청 학생:</strong> {{ activeObjection.studentName }} ({{ activeObjection.studentLoginId }})</p>
            <div class="reason-box">
              <p><strong>학생 이의 사유:</strong></p>
              <p class="reason-text">{{ activeObjection.objectionReason }}</p>
            </div>
          </div>

          <div class="objection-form">
            <div class="form-group">
              <label for="objectionReply">교수님 답변</label>
              <textarea
                id="objectionReply"
                v-model="objectionReplyText"
                rows="4"
                placeholder="답변을 입력해 주세요."
                class="form-textarea"
              ></textarea>
            </div>

            <!-- 승인 시 점수 재입력 폼 -->
            <div class="score-adjust-section">
              <h3>점수 재입력 (승인 시 적용)</h3>
              <div class="adjust-grid">
                <div>
                  <label>중간</label>
                  <input type="number" v-model.number="adjustScores.midtermScore" min="0" max="100" class="form-input" />
                </div>
                <div>
                  <label>기말</label>
                  <input type="number" v-model.number="adjustScores.finalScore" min="0" max="100" class="form-input" />
                </div>
                <div>
                  <label>과제</label>
                  <input type="number" v-model.number="adjustScores.assignmentScore" min="0" max="100" class="form-input" />
                </div>
                <div>
                  <label>출결</label>
                  <input type="number" v-model.number="adjustScores.attendanceScore" min="0" max="100" class="form-input" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="closeObjectionModal" class="btn-secondary">취소</button>
          <button @click="handleObjectionReject" class="btn-warn">이의 기각(반려/FINAL 확정)</button>
          <button @click="handleObjectionApprove" class="btn-success">이의 승인(성적 조정/APPROVED)</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useLectureProfessorStore } from "../../store/lecture/useLectureProfessorStore";
import { useGradeProfessorStore } from "../../store/academic/useGradeProfessorStore";

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

const lectures = computed(() => lectureStore.lectures);
const currentLecture = computed(() => 
  lectures.value.find(l => l.id === selectedLectureId.value)
);

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
  // 기존 DB에 비율 컬럼이 없을 때를 대비한 디폴트 값 제공
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
  
  const payload = localGrades.value.map(g => ({
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
  if (!confirm("성적을 최종 제출하시겠습니까? 제출 후 학생 공개 여부 결정 전까지만 수정 가능합니다.")) return;

  try {
    await gradeStore.updateGradesStatus(selectedLectureId.value, "SUBMITTED");
    alert("성적 일괄 제출 완료");
    await loadGrades();
  } catch (error) {
    alert("성적 제출 중 오류가 발생했습니다.");
  }
};

// 성적 공개
const handlePublishGrades = async () => {
  if (!selectedLectureId.value) return;
  if (!confirm("학생들에게 성적을 정식 공개(OPEN) 하시겠습니까?")) return;

  try {
    await gradeStore.updateGradesStatus(selectedLectureId.value, "OPENED");
    alert("성적이 공개되었습니다. 학생 이의신청이 가능해집니다.");
    await loadGrades();
  } catch (error) {
    alert("성적 공개 중 오류가 발생했습니다.");
  }
};

// 이의신청 모달 팝업 오픈
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

// 이의신청 기각/반려 (FINAL 처리)
const handleObjectionReject = async () => {
  if (!activeObjection.value) return;
  try {
    await gradeStore.replyObjection(activeObjection.value.id, {
      approve: false,
      reply: objectionReplyText.value,
    });
    alert("이의신청이 기각(반려)되었으며 성적이 최종 확정(FINAL)되었습니다.");
    closeObjectionModal();
    await loadGrades();
  } catch (error) {
    alert("기각 처리 중 오류가 발생했습니다.");
  }
};

// 이의신청 승인 (APPROVED 처리 및 성적 갱신)
const handleObjectionApprove = async () => {
  if (!activeObjection.value) return;
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
    alert("성적 조정이 완료되었으며 이의신청이 승인(APPROVED)되었습니다.");
    closeObjectionModal();
    await loadGrades();
  } catch (error) {
    alert("승인 처리 중 오류가 발생했습니다.");
  }
};
</script>

<style scoped>
.grade-manage-container {
  padding: 2.5rem;
  min-height: calc(100vh - 80px);
  background-color: #F8FAFC;
  color: #1E293B;
}

.glass-dashboard {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #E2E8F0;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
}

.dashboard-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #0B3D91;
  text-align: left;
}

.subtitle {
  color: #64748B;
  margin-top: 0.5rem;
  text-align: left;
}

.lecture-selector-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.lecture-selector-group label {
  font-size: 0.85rem;
  color: #64748B;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-select {
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  color: #1E293B;
  outline: none;
  font-size: 1rem;
  cursor: pointer;
  min-width: 320px;
  transition: border-color 0.2s ease-in-out;
}

.form-select:focus {
  border-color: #2563EB;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.lecture-info-tags {
  display: flex;
  gap: 0.75rem;
}

.info-tag {
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.2);
  color: #2563EB;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.control-buttons {
  display: flex;
  gap: 0.75rem;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: #FFFFFF;
}

.data-table th, .data-table td {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #E2E8F0;
}

.data-table th {
  background: #F1F5F9;
  color: #1E293B;
  font-weight: 700;
  font-size: 0.9rem;
}

.data-table tbody tr:hover {
  background: #F8FAFC;
}

.table-input {
  width: 75px;
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  padding: 0.4rem;
  color: #1E293B;
  text-align: center;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s ease-in-out;
}

.table-input:focus {
  border-color: #2563EB;
}

.font-bold {
  font-weight: 700;
}

.text-accent {
  color: #2563EB;
}

.text-secondary {
  color: #64748B;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-block;
}

.status-badge.draft {
  background: #E2E8F0;
  color: #64748B;
}

.status-badge.submitted {
  background: rgba(37, 99, 235, 0.1);
  color: #2563EB;
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.status-badge.opened {
  background: rgba(96, 165, 250, 0.15);
  color: #2563EB;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.status-badge.objection {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-badge.approved {
  background: rgba(34, 197, 94, 0.1);
  color: #22C55E;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-badge.final {
  background: rgba(34, 197, 94, 0.2);
  color: #16A34A;
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.btn-primary, .btn-secondary, .btn-success, .btn-warn {
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #2563EB;
  color: #FFFFFF;
}

.btn-primary:hover {
  background: #1D4ED8;
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
  background: #0B3D91;
  color: #FFFFFF;
}

.btn-success:hover {
  background: #082C6B;
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

.no-data {
  color: #64748B;
  font-style: italic;
}

.welcome-section {
  padding: 5rem 0;
  color: #64748B;
  font-size: 1.1rem;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  width: 100%;
  max-width: 550px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  color: #1E293B;
}

.modal-card h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #E2E8F0;
  padding-bottom: 0.75rem;
  text-align: left;
  color: #0B3D91;
  font-weight: 700;
}

.modal-body {
  margin-bottom: 2rem;
}

.objection-info {
  margin-bottom: 1.5rem;
  text-align: left;
}

.objection-info p {
  margin-bottom: 0.5rem;
}

.reason-box {
  background: #F8FAFC;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 0.5rem;
  border: 1px solid #E2E8F0;
}

.reason-text {
  color: #64748B;
  white-space: pre-wrap;
  margin-top: 0.25rem;
  font-size: 0.95rem;
}

.objection-form {
  text-align: left;
}

.form-textarea {
  width: 100%;
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  padding: 0.75rem;
  color: #1E293B;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s ease-in-out;
}

.form-textarea:focus {
  border-color: #2563EB;
}

.score-adjust-section {
  margin-top: 1.5rem;
}

.score-adjust-section h3 {
  font-size: 0.95rem;
  color: #0B3D91;
  margin-bottom: 0.75rem;
  font-weight: 700;
}

.adjust-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.form-input {
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  padding: 0.5rem;
  color: #1E293B;
  text-align: center;
  width: 100%;
  outline: none;
  transition: border-color 0.2s ease-in-out;
}

.form-input:focus {
  border-color: #2563EB;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid #E2E8F0;
  padding-top: 1.5rem;
}
</style>
