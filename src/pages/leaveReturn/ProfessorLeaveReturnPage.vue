<template>
  <MyPageContainer title="휴/복학 결재 관리">
    <div class="attendance-section">
      <div class="common-section-header">
        <h3>결재 대기 목록</h3>
      </div>
      <div class="table-wrapper">
        <MyTable
          :columns="columns"
          :empty="pendingRequests.length === 0"
          emptyMessage="대기 중인 신청이 없습니다."
        >
          <tr v-for="req in pendingRequests" :key="req.id">
            <td>{{ req.studentName }}</td>
            <td>{{ req.studentLoginId }}</td>
            <td>{{ req.departmentName }}</td>
            <td>
              <span :class="['type-badge', req.requestType.toLowerCase()]">
                {{ formatRequestType(req.requestType) }}
              </span>
            </td>
            <td>{{ req.targetYear }}학년도 {{ req.targetSemester }}학기</td>
            <td class="reason-cell" :title="req.reason">
              {{ truncate(req.reason, 20) }}
            </td>
            <td>{{ formatDate(req.createdAt) }}</td>
            <td>
              <div class="action-buttons">
                <MyButton
                  color="deep-blue"
                  size="small"
                  content="승인"
                  @click="handleApproveDirect(req)"
                />
                <MyButton
                  color="error"
                  size="small"
                  content="반려"
                  @click="openRejectModal(req)"
                />
              </div>
            </td>
          </tr>
        </MyTable>
      </div>
    </div>

    <!-- 결재 처리 모달 -->
    <MyModal
      :isOpen="isModalOpen"
      title="학적 변동 상세 및 반려 처리"
      @close="closeModal"
    >
      <div class="info-grid">
        <div class="info-row">
          <span class="label">이름</span>
          <span class="value">{{ activeReq.studentName }}</span>
        </div>
        <div class="info-row">
          <span class="label">학번</span>
          <span class="value">{{ activeReq.studentLoginId }}</span>
        </div>
        <div class="info-row">
          <span class="label">소속</span>
          <span class="value">{{ activeReq.departmentName }}</span>
        </div>
        <div class="info-row">
          <span class="label">신청 유형</span>
          <span class="value font-bold">{{
            formatRequestType(activeReq.requestType)
          }}</span>
        </div>
        <div class="info-row">
          <span class="label">적용 학기</span>
          <span class="value"
            >{{ activeReq.targetYear }}학년도
            {{ activeReq.targetSemester }}학기</span
          >
        </div>
        <div
          v-if="activeReq.requestType === 'LEAVE' && activeReq.returnYear"
          class="info-row"
        >
          <span class="label">복학 예정</span>
          <span class="value"
            >{{ activeReq.returnYear }}학년도
            {{ activeReq.returnSemester }}학기</span
          >
        </div>
        <div class="info-row reason-row">
          <span class="label">신청 사유</span>
          <div class="value reason-box">{{ activeReq.reason }}</div>
        </div>
        <div v-if="activeReq.attachmentFilePath" class="info-row">
          <span class="label">증빙 서류</span>
          <span class="value">
            <a href="#" @click.prevent="openAttachment(activeReq)" class="download-link">
              첨부파일 다운로드
            </a>
          </span>
        </div>
      </div>

      <div class="approval-form">
        <label>반려 사유 (반려 시 필수)</label>
        <textarea
          v-model="rejectReason"
          rows="3"
          class="form-textarea"
          placeholder="반려 사유를 입력하세요."
        ></textarea>
      </div>
      
      <template #footer>
        <MyButton
          color="white"
          size="small"
          content="취소"
          @click="closeModal"
        />
        <MyButton
          color="error"
          size="small"
          content="반려 확인"
          @click="handleProcess('REJECTED')"
        />
      </template>
    </MyModal>
  </MyPageContainer>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import MyPageContainer from "../../components/layout/MyPageContainer.vue";
import MyTable from "../../components/table/MyTable.vue";
import MyButton from "../../components/button/MyButton.vue";
import MyModal from "../../components/common/MyModal.vue";
import myAxios from "../../api/myAxios";
import { useLeaveReturnStore } from "../../store/leaveReturn/useLeaveReturnStore";

defineOptions({ name: "ProfessorLeaveReturnPage" });

const store = useLeaveReturnStore();

const pendingRequests = computed(() => store.pendingRequests);

const columns = [
  { key: "studentName", label: "이름" },
  { key: "studentNo", label: "학번" },
  { key: "dept", label: "소속" },
  { key: "type", label: "유형" },
  { key: "target", label: "적용 학기" },
  { key: "reason", label: "신청 사유" },
  { key: "date", label: "신청일" },
  { key: "action", label: "관리" },
];

const isModalOpen = ref(false);
const activeReq = ref(null);
const rejectReason = ref("");

onMounted(async () => {
  await store.fetchPendingRequests();
});

const formatRequestType = (type) => {
  if (type === "LEAVE" || type === "GENERAL_LEAVE") return "일반휴학";
  if (type === "RETURN" || type === "GENERAL_RETURN") return "일반복학";
  if (type === "MILITARY_LEAVE") return "군휴학";
  if (type === "MILITARY_RETURN") return "군복학";
  return type;
};

const openAttachment = async (request) => {
  if (!request?.id) return;
  try {
    const response = await myAxios.get(
      `/api/professor/academic-requests/${request.id}/attachment`,
      { responseType: "blob" }
    );
    const blobUrl = URL.createObjectURL(response.data);
    const fileName = (request.attachmentFilePath || "attachment").split("/").pop();
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("첨부파일 다운로드 실패:", error);
    alert("첨부파일 다운로드에 실패했습니다.");
  }
};

const truncate = (text, len) => {
  if (!text) return "";
  return text.length > len ? text.substring(0, len) + "..." : text;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("ko-KR");
};

const handleApproveDirect = async (req) => {
  if (!confirm(`${req.studentName} 학생의 학적 변동 신청을 승인하시겠습니까?`)) return;

  try {
    await store.processRequest(req.id, {
      status: "APPROVED",
      rejectReason: null,
    });
    alert("승인 처리가 완료되었습니다.");
    await store.fetchPendingRequests();
  } catch (error) {
    alert("처리 중 오류가 발생했습니다.");
  }
};

const openRejectModal = (req) => {
  activeReq.value = req;
  rejectReason.value = "";
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  activeReq.value = null;
};

const handleProcess = async (status) => {
  if (status === "REJECTED" && !rejectReason.value.trim()) {
    alert("반려 시 반려 사유를 반드시 입력해야 합니다.");
    return;
  }

  if (!confirm(`해당 신청을 반려 처리하시겠습니까?`)) return;

  try {
    await store.processRequest(activeReq.value.id, {
      status,
      rejectReason: rejectReason.value,
    });
    alert("반려 처리가 완료되었습니다.");
    closeModal();
    await store.fetchPendingRequests();
  } catch (error) {
    alert("처리 중 오류가 발생했습니다.");
  }
};
</script>

<style scoped>
.attendance-section {
  margin-top: 32px;
}



.table-wrapper {
  overflow: hidden;
}

.type-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}
.type-badge.leave {
  background: #fffbeb;
  color: #d97706;
}
.type-badge.return {
  background: #ecfdf5;
  color: #059669;
}

.reason-cell {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.download-link {
  color: #3b82f6;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
}
.download-link:hover {
  color: #2563eb;
}


.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  align-items: flex-start;
}

.info-row .label {
  width: 100px;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
}

.info-row .value {
  flex: 1;
  color: #1a1f36;
  font-size: 0.95rem;
}

.reason-box {
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #edf2f7;
  white-space: pre-wrap;
}

.approval-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.approval-form label {
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
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
}

.form-textarea:focus {
  border-color: var(--error-color);
  outline: none;
}

</style>
