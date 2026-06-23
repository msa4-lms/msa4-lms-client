<template>
  <MyPageContainer title="휴/복학 신청">
    <!-- 신청 폼 (좌측/상단) -->
    <div class="apply-section">
      <h3>학적 변동 신청서 작성</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>신청 유형</label>
          <select v-model="form.requestType" class="form-select">
            <option value="LEAVE">휴학</option>
            <option value="RETURN">복학</option>
          </select>
        </div>

        <div class="form-group">
          <label>적용 학년도</label>
          <MyInput type="number" v-model.number="form.targetYear" placeholder="예: 2026" />
        </div>

        <div class="form-group">
          <label>적용 학기</label>
          <select v-model.number="form.targetSemester" class="form-select">
            <option value="1">1학기</option>
            <option value="2">2학기</option>
          </select>
        </div>

        <div v-if="form.requestType === 'LEAVE'" class="form-group">
          <label>복학 예정 학년도 (선택)</label>
          <MyInput type="number" v-model.number="form.returnYear" placeholder="예: 2027" />
        </div>

        <div v-if="form.requestType === 'LEAVE'" class="form-group">
          <label>복학 예정 학기 (선택)</label>
          <select v-model.number="form.returnSemester" class="form-select">
            <option :value="null">선택 안 함</option>
            <option value="1">1학기</option>
            <option value="2">2학기</option>
          </select>
        </div>

        <div class="form-group full-width">
          <label>사유</label>
          <textarea v-model="form.reason" rows="3" class="form-textarea" placeholder="상세 사유를 입력해주세요."></textarea>
        </div>
      </div>
      <div class="submit-action">
        <MyButton color="deep-blue" size="middle" content="신청서 제출" @click="handleSubmit" />
      </div>
    </div>

    <!-- 신청 내역 (우측/하단) -->
    <div class="history-section" style="margin-top: 30px;">
      <h3>나의 신청 내역</h3>
      <MyTable
        :columns="historyColumns"
        :empty="myRequests.length === 0"
        emptyMessage="신청 내역이 없습니다."
      >
        <tr v-for="req in myRequests" :key="req.id">
          <td>{{ formatRequestType(req.requestType) }}</td>
          <td>{{ req.targetYear }}학년도 {{ req.targetSemester }}학기</td>
          <td class="reason-cell" :title="req.reason">{{ truncate(req.reason, 20) }}</td>
          <td>
            <StatusBadge :status="req.status" />
          </td>
          <td class="reason-cell" :title="req.rejectReason || '-'">{{ truncate(req.rejectReason || '-', 15) }}</td>
          <td>{{ formatDate(req.createdAt) }}</td>
        </tr>
      </MyTable>
    </div>
  </MyPageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import MyPageContainer from "../../components/layout/MyPageContainer.vue";
import MyInput from "../../components/input/MyInput.vue";
import MyButton from "../../components/button/MyButton.vue";
import MyTable from "../../components/table/MyTable.vue";
import StatusBadge from "../../components/common/StatusBadge.vue";
import { useLeaveReturnStore } from "../../store/academic/useLeaveReturnStore";

defineOptions({ name: "LeaveReturnPage" });

const store = useLeaveReturnStore();

const form = ref({
  requestType: "LEAVE",
  targetYear: new Date().getFullYear(),
  targetSemester: 1,
  returnYear: null,
  returnSemester: null,
  reason: "",
});

const myRequests = computed(() => store.myRequests);

const historyColumns = [
  { key: "type", label: "유형" },
  { key: "target", label: "적용 학기" },
  { key: "reason", label: "신청 사유" },
  { key: "status", label: "진행 상태" },
  { key: "reject", label: "반려 사유" },
  { key: "date", label: "신청일" },
];

onMounted(async () => {
  await store.fetchMyRequests();
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

const handleSubmit = async () => {
  if (!form.value.reason.trim()) {
    alert("사유를 입력해주세요.");
    return;
  }
  if (!confirm(`${formatRequestType(form.value.requestType)} 신청을 제출하시겠습니까?`)) return;

  try {
    await store.submitRequest(form.value);
    alert("신청이 완료되었습니다.");
    form.value.reason = "";
    await store.fetchMyRequests();
  } catch (error) {
    alert("신청 중 오류가 발생했습니다.");
  }
};
</script>

<style scoped>
.apply-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #edf2f7;
}

.apply-section h3, .history-section h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1f36;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #edf2f7;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4f566b;
}

.form-select {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  color: #1a1f36;
  font-size: 0.95rem;
  height: 40px;
}

.form-textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
}

.form-textarea:focus, .form-select:focus {
  border-color: var(--secondary-blue);
  outline: none;
}

.submit-action {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.history-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #edf2f7;
}

.reason-cell {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
