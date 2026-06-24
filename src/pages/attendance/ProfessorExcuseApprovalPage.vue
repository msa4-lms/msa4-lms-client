<script setup>
import { computed, onMounted, ref } from "vue";
import { useAttendanceStore } from "../../store/attendance/useAttendanceStore";
import MyButton from "../../components/button/MyButton.vue";
import MyPageContainer from "../../components/layout/MyPageContainer.vue";
import MyTable from "../../components/table/MyTable.vue";
import myAxios from "../../api/myAxios";

defineOptions({ name: "ProfessorExcuseApprovalPage" });

const academicStore = useAttendanceStore();

const loading = ref(false);
const activeTab = ref("PENDING");
const rejectTarget = ref(null);
const rejectReason = ref("");

const columns = [
  { key: "student", label: "학생" },
  { key: "studentNo", label: "학번" },
  { key: "course", label: "과목" },
  { key: "date", label: "신청 날짜" },
  { key: "reason", label: "사유" },
  { key: "attachment", label: "첨부파일" },
  { key: "status", label: "처리" },
];

const pendingRequests = computed(() => {
  return academicStore.professorExcuseRequests.filter((request) => request.status === "PENDING");
});

const completedRequests = computed(() => {
  return academicStore.professorExcuseRequests.filter((request) => request.status !== "PENDING");
});

const visibleRequests = computed(() => {
  return activeTab.value === "PENDING" ? pendingRequests.value : completedRequests.value;
});

const extractAttachmentName = (reason = "") => {
  const match = reason.match(/\[첨부파일:\s*(.+?)\]$/);
  return match?.[1] || "";
};

const cleanReason = (reason = "") => {
  return reason.replace(/\s*\[첨부파일:\s*.+?\]$/, "").trim();
};

const attachmentName = (request) => {
  return request.attachmentOriginalName || extractAttachmentName(request.reason);
};

const openAttachment = async (request) => {
  if (!request.attachmentOriginalName) {
    alert("기존 신청에는 실제 첨부파일이 저장되어 있지 않습니다.");
    return;
  }

  const expectedContentType = request.attachmentContentType || "";
  const canOpen = expectedContentType === "application/pdf" || expectedContentType.startsWith("image/");
  const previewWindow = canOpen ? window.open("", "_blank") : null;

  try {
    const response = await myAxios.get(
      `/api/professor/academic/excuses/${request.id}/attachment`,
      { responseType: "blob" }
    );
    const blobUrl = URL.createObjectURL(response.data);

    if (canOpen) {
      if (previewWindow) {
        previewWindow.opener = null;
        previewWindow.location.href = blobUrl;
      } else {
        window.open(blobUrl, "_blank", "noopener,noreferrer");
      }
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      return;
    }

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = request.attachmentOriginalName;
    link.click();
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    if (previewWindow) previewWindow.close();
    console.error("첨부파일 열기 실패:", error);
  }
};

const statusLabel = (status) => {
  if (status === "APPROVED") return "승인";
  if (status === "REJECTED") return "반려";
  return "대기";
};

const loadRequests = async () => {
  loading.value = true;
  try {
    await academicStore.fetchProfessorExcuseRequests();
  } finally {
    loading.value = false;
  }
};

const approveRequest = async (request) => {
  if (!window.confirm(`${request.studentName} 학생의 공결 신청을 승인하시겠습니까?`)) return;

  await academicStore.decideExcuseRequest(request.id, {
    status: "APPROVED",
    rejectReason: "",
  });
};

const openRejectModal = (request) => {
  rejectTarget.value = request;
  rejectReason.value = "";
};

const closeRejectModal = () => {
  rejectTarget.value = null;
  rejectReason.value = "";
};

const rejectRequest = async () => {
  const reason = rejectReason.value.trim();
  if (!reason) {
    alert("반려 사유를 입력해주세요.");
    return;
  }

  await academicStore.decideExcuseRequest(rejectTarget.value.id, {
    status: "REJECTED",
    rejectReason: reason,
  });
  closeRejectModal();
};

onMounted(loadRequests);
</script>

<template>
  <MyPageContainer title="출결 승인">
    <section class="card">
      <div class="card-header">
        <h3>{{ activeTab === "PENDING" ? "승인 대기 공결 신청" : "처리 완료 내역" }}</h3>
        <div class="tab-bar">
          <button
            type="button"
            :class="['tab-button', { active: activeTab === 'PENDING' }]"
            @click="activeTab = 'PENDING'"
          >
            승인 대기
          </button>
          <button
            type="button"
            :class="['tab-button', { active: activeTab === 'COMPLETED' }]"
            @click="activeTab = 'COMPLETED'"
          >
            처리 완료
          </button>
        </div>
      </div>

      <div class="card-body">
        <MyTable
          :columns="columns"
          :loading="loading"
          :empty="visibleRequests.length === 0"
          :emptyMessage="activeTab === 'PENDING' ? '승인 대기 중인 공결 신청이 없습니다.' : '처리 완료된 공결 신청이 없습니다.'"
        >
          <tr v-for="request in visibleRequests" :key="request.id">
            <td class="student-name">{{ request.studentName }}</td>
            <td>{{ request.studentNo }}</td>
            <td class="course-name">{{ request.courseName }}</td>
            <td>
              <div>{{ request.lectureDate }}</div>
              <small>{{ request.period }}교시</small>
            </td>
            <td class="reason-cell">
              {{ cleanReason(request.reason) }}
              <p v-if="request.rejectReason" class="reject-reason">
                반려 사유: {{ request.rejectReason }}
              </p>
            </td>
            <td>
              <button
                v-if="attachmentName(request)"
                class="attachment-button"
                type="button"
                @click="openAttachment(request)"
              >
                {{ attachmentName(request) }}
              </button>
              <span v-else class="empty-value">없음</span>
            </td>
            <td>
              <div v-if="request.status === 'PENDING'" class="button-group">
                <MyButton
                  btnType="button"
                  color="green"
                  size="small"
                  content="승인"
                  @click="approveRequest(request)"
                />
                <MyButton
                  btnType="button"
                  color="red"
                  size="small"
                  content="반려"
                  @click="openRejectModal(request)"
                />
              </div>
              <span v-else :class="['status-text', request.status.toLowerCase()]">
                {{ statusLabel(request.status) }}
              </span>
            </td>
          </tr>
        </MyTable>
      </div>
    </section>

    <div v-if="rejectTarget" class="modal-overlay" @click.self="closeRejectModal">
      <section class="modal-card">
        <h2>공결 신청 반려</h2>
        <div class="modal-body">
          <dl class="request-summary">
            <dt>학생</dt>
            <dd>{{ rejectTarget.studentName }} ({{ rejectTarget.studentNo }})</dd>
            <dt>과목</dt>
            <dd>{{ rejectTarget.courseName }}</dd>
            <dt>날짜</dt>
            <dd>{{ rejectTarget.lectureDate }} {{ rejectTarget.period }}교시</dd>
          </dl>
          <div class="approval-form">
            <label for="reject-reason">반려 사유</label>
            <textarea
              id="reject-reason"
              v-model="rejectReason"
              class="form-textarea"
              maxlength="500"
              rows="5"
              placeholder="학생에게 전달할 반려 사유를 입력해주세요."
            />
          </div>
        </div>
        <div class="modal-actions">
          <MyButton btnType="button" color="white" size="small" content="닫기" @click="closeRejectModal" />
          <MyButton btnType="button" color="red" size="small" content="반려" @click="rejectRequest" />
        </div>
      </section>
    </div>
  </MyPageContainer>
</template>

<style scoped>
.card {
  overflow: hidden;
  background: #fff;
  border: 1px solid #edf2f7;
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #edf2f7;
}

.card-header h3 {
  color: #1a1f36;
  font-size: 1.1rem;
  font-weight: 700;
}

.card-body {
  padding: 20px;
}

.tab-bar {
  display: flex;
  gap: 8px;
}

.tab-button {
  height: 36px;
  border: 1px solid #d8dde6;
  border-radius: 4px;
  padding: 0 14px;
  background: #fff;
  color: #697386;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
}

.tab-button.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: #fff;
}

.student-name,
.course-name {
  color: #071f49;
  font-weight: 700;
}

.reason-cell {
  min-width: 220px;
  text-align: left;
}

.reject-reason {
  margin-top: 6px;
  color: #c5221f;
  font-size: 0.8rem;
}

.attachment-button {
  border: 0;
  padding: 0;
  background: transparent;
  color: #0b3d91;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: underline;
}

.empty-value {
  color: #94a3b8;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.status-text {
  font-size: 0.85rem;
  font-weight: 700;
}

.status-text.approved {
  color: #137333;
}

.status-text.rejected {
  color: #c5221f;
}

.modal-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
}

.modal-card {
  width: 100%;
  max-width: 500px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
}

.modal-card h2 {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #edf2f7;
  color: #1a1f36;
  font-size: 1.3rem;
  font-weight: 600;
}

.request-summary {
  display: grid;
  grid-template-columns: 70px 1fr;
  gap: 8px 12px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.request-summary dt {
  color: #697386;
  font-weight: 600;
}

.request-summary dd {
  margin: 0;
  color: #1f2937;
}

.approval-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.approval-form label {
  display: block;
  color: #1a1f36;
  font-size: 0.9rem;
  font-weight: 600;
}

.form-textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px 12px;
  box-sizing: border-box;
  background: #fff;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
}

.form-textarea:focus {
  border-color: var(--error-color);
  outline: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}

@media (max-width: 760px) {
  .card-header {
    align-items: stretch;
    flex-direction: column;
  }

  .tab-bar {
    width: 100%;
  }

  .tab-button {
    flex: 1;
  }
}
</style>
