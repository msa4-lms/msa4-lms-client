<template>
  <MyPageContainer title="휴/복학 결재 관리">
    <div class="card">
      <div class="card-header">
        <h3>결재 대기 목록</h3>
      </div>
      <div class="card-body">
        <MyTable
          :columns="columns"
          :empty="pendingRequests.length === 0"
          emptyMessage="대기 중인 신청이 없습니다."
        >
          <tr v-for="req in pendingRequests" :key="req.id">
            <td>{{ req.studentName }} ({{ req.studentLoginId }})</td>
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
                  content="상세/승인"
                  @click="openModal(req)"
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
      title="학적 변동 결재"
      @close="closeModal"
    >
      <div class="info-grid">
        <div class="info-row">
          <span class="label">이름(학번)</span>
          <span class="value"
            >{{ activeReq.studentName }} ({{
              activeReq.studentLoginId
            }})</span
          >
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
          content="닫기"
          @click="closeModal"
        />
        <MyButton
          color="error"
          size="small"
          content="반려 처리"
          @click="handleProcess('REJECTED')"
        />
        <MyButton
          color="deep-blue"
          size="small"
          content="승인 처리"
          @click="handleProcess('APPROVED')"
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
import { useLeaveReturnStore } from "../../store/leaveReturn/useLeaveReturnStore";

defineOptions({ name: "ProfessorLeaveReturnPage" });

const store = useLeaveReturnStore();

const pendingRequests = computed(() => store.pendingRequests);

const columns = [
  { key: "student", label: "학생(학번)" },
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

const formatRequestType = (type) => (type === "LEAVE" ? "휴학" : "복학");

const truncate = (text, len) => {
  if (!text) return "";
  return text.length > len ? text.substring(0, len) + "..." : text;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("ko-KR");
};

const openModal = (req) => {
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

  const actionName = status === "APPROVED" ? "승인" : "반려";
  if (!confirm(`해당 신청을 ${actionName} 처리하시겠습니까?`)) return;

  try {
    await store.processRequest(activeReq.value.id, {
      status,
      rejectReason: status === "REJECTED" ? rejectReason.value : null,
    });
    alert(`${actionName} 처리가 완료되었습니다.`);
    closeModal();
    await store.fetchPendingRequests();
  } catch (error) {
    alert("처리 중 오류가 발생했습니다.");
  }
};
</script>

<style scoped>
.card {
  background: white;
  border-radius: 12px;
  border: 1px solid #edf2f7;
  overflow: hidden;
}

.card-header {
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
