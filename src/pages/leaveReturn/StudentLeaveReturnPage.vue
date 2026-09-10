<template>
  <MyPageContainer :title="pageTitle">
    <!-- 신청 폼 (좌측/상단) -->
    <div class="attendance-section">
      <div class="common-section-header">
        <h3>학적 변동 신청서 작성</h3>
      </div>
      <div class="apply-section">
        <div class="form-grid">
        <div class="form-group">
          <label>신청 유형</label>
          <select v-model="form.requestType" class="form-select">
            <option :value="isMilitary ? 'MILITARY_LEAVE' : 'GENERAL_LEAVE'">휴학</option>
            <option v-if="!isMilitary" value="GENERAL_RETURN">복학</option>
          </select>
        </div>

        <div class="form-group">
          <label>시작 기간</label>
          <MyInput type="text" :modelValue="startPeriodLabel" readonly disabled />
        </div>

        <div v-if="form.requestType.includes('LEAVE')" class="form-group">
          <label>복학 예정</label>
          <MyInput type="text" :modelValue="returnPeriodLabel" readonly disabled />
        </div>

        <div v-if="form.requestType.includes('LEAVE')" class="form-group full-width">
          <label>{{ isMilitary ? '입영통지서 첨부 (필수)' : '증빙 서류 첨부 (선택)' }}</label>
          <input type="file" ref="fileInput" class="form-control" accept="image/*,.pdf" @change="handleFileChange" />
          <small v-if="isMilitary" class="text-muted" style="color:red; font-size: 0.8rem; margin-top:4px;">* 군휴학 신청 시 입영통지서 첨부는 필수입니다.</small>
        </div>

        <div v-if="!isMilitary && form.requestType.includes('LEAVE')" class="form-group full-width">
          <label>사유</label>
          <textarea v-model="form.reason" rows="3" class="form-textarea" placeholder="상세 사유를 입력해주세요."></textarea>
        </div>
      </div>
      <div class="submit-action">
        <MyButton color="deep-blue" size="middle" content="신청서 제출" @click="handleSubmit" />
      </div>
      </div>
    </div>

    <!-- 신청 내역 (우측/하단) -->
    <div class="attendance-section" style="margin-top: 30px;">
      <div class="common-section-header">
        <h3>나의 신청 내역</h3>
      </div>
      <div class="table-wrapper">
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
    </div>
  </MyPageContainer>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import MyPageContainer from "../../components/layout/MyPageContainer.vue";
import MyInput from "../../components/input/MyInput.vue";
import MyButton from "../../components/button/MyButton.vue";
import MyTable from "../../components/table/MyTable.vue";
import StatusBadge from "../../components/common/StatusBadge.vue";
import { useLeaveReturnStore } from "../../store/leaveReturn/useLeaveReturnStore";
import { notify, confirmDialog } from "../../composables/useDialog";

defineOptions({ name: "StudentLeaveReturnPage" });

const route = useRoute();
const store = useLeaveReturnStore();

const isMilitary = computed(() => route.path.includes("military"));
const pageTitle = computed(() => (isMilitary.value ? "군휴학 신청" : "일반휴학/복학 신청"));

const form = ref({
  requestType: "GENERAL_LEAVE",
  // 신청 대상 학기는 아래 nextYear/nextSemester(신청 시점 기준 다음 학기)로 채워진다.
  targetYear: null,
  targetSemester: null,
  returnYear: null,
  returnSemester: null,
  reason: "",
});

const fileInput = ref(null);
const attachedFile = ref(null);

const handleFileChange = (e) => {
  if (e.target.files.length > 0) {
    attachedFile.value = e.target.files[0];
  } else {
    attachedFile.value = null;
  }
};

// 시작 기간 계산
const today = new Date();
const currentMonth = today.getMonth() + 1;
const currentYear = today.getFullYear();

let nextYear = currentYear;
let nextSemester = 1;
if (currentMonth >= 3 && currentMonth <= 8) {
  nextSemester = 2;
  nextYear = currentYear;
} else if (currentMonth >= 9) {
  nextSemester = 1;
  nextYear = currentYear + 1;
} else {
  nextSemester = 1;
  nextYear = currentYear;
}

form.value.targetYear = nextYear;
form.value.targetSemester = nextSemester;

const startPeriodLabel = computed(() => `${nextYear}학년도 ${nextSemester}학기`);

// 복학 예정 계산
const returnYear = computed(() => {
  if (isMilitary.value) {
    return nextYear + 2; // 2년 (4학기)
  } else {
    return nextSemester === 1 ? nextYear : nextYear + 1; // 1학기 후
  }
});

const returnSemester = computed(() => {
  if (isMilitary.value) {
    return nextSemester; // 학기는 동일하게
  } else {
    return nextSemester === 1 ? 2 : 1; // 반대 학기
  }
});

const returnPeriodLabel = computed(() => `${returnYear.value}학년도 ${returnSemester.value}학기`);

watch(
  isMilitary,
  (newVal) => {
    form.value.requestType = newVal ? "MILITARY_LEAVE" : "GENERAL_LEAVE";
    attachedFile.value = null;
    if (fileInput.value) fileInput.value.value = "";
  },
  { immediate: true }
);

watch(
  [returnYear, returnSemester],
  ([y, s]) => {
    form.value.returnYear = y;
    form.value.returnSemester = s;
  },
  { immediate: true }
);

const myRequests = computed(() => {
  return store.myRequests.filter(req => {
    if (isMilitary.value) {
      // 군휴학 탭: 군휴학 신청 이력만
      return req.requestType === "MILITARY_LEAVE";
    } else {
      // 일반휴학 탭: 군휴학 신청을 제외한 나머지(일반휴학/일반복학/군복학) 모두
      return req.requestType !== "MILITARY_LEAVE";
    }
  });
});

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

const formatRequestType = (type) => {
  if (type === "LEAVE" || type === "GENERAL_LEAVE") return "일반휴학";
  if (type === "RETURN" || type === "GENERAL_RETURN") return "일반복학";
  if (type === "MILITARY_LEAVE") return "군휴학";
  if (type === "MILITARY_RETURN") return "군복학";
  return type;
};

const truncate = (text, len) => {
  if (!text) return "";
  return text.length > len ? text.substring(0, len) + "..." : text;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("ko-KR");
};

const handleSubmit = async () => {
  if (isMilitary.value && form.value.requestType === "MILITARY_LEAVE" && !attachedFile.value) {
    notify("군휴학 신청 시 입영통지서 첨부는 필수입니다.");
    return;
  }

  if (isMilitary.value) {
    form.value.reason = form.value.requestType === "MILITARY_LEAVE" ? "군입대" : "군제대 후 복학";
  } else if (form.value.requestType.includes('RETURN')) {
    form.value.reason = "복학";
  } else if (!form.value.reason.trim()) {
    notify("사유를 입력해주세요.");
    return;
  }

  if (!(await confirmDialog(`${formatRequestType(form.value.requestType)} 신청을 제출하시겠습니까?`))) return;

  try {
    const formData = new FormData();
    formData.append("request", new Blob([JSON.stringify(form.value)], { type: "application/json" }));
    if (attachedFile.value) {
      formData.append("file", attachedFile.value);
    }
    await store.submitRequest(formData);
    notify("신청이 완료되었습니다.");
    form.value.reason = "";
    attachedFile.value = null;
    if (fileInput.value) fileInput.value.value = "";
    await store.fetchMyRequests();
  } catch (error) {
    console.error("학적 변동 신청 실패:", error);
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

.attendance-section {
  margin-top: 32px;
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
  color: #4f566b;
}

.form-select, .form-control {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  color: #1a1f36;
  font-size: 0.95rem;
  height: 40px;
  box-sizing: border-box;
}

.form-control[type="file"] {
  padding: 5px 12px;
}

.form-textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  box-sizing: border-box;
}

.form-textarea:focus, .form-select:focus, .form-control:focus {
  border-color: var(--secondary-blue);
  outline: none;
}

.submit-action {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.table-wrapper {
  overflow: hidden;
}

.reason-cell {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
