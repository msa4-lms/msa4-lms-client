<template>
  <span :class="['status-badge', statusClass]">
    {{ statusLabel }}
  </span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
});

const statusLabel = computed(() => {
  switch (props.status) {
    case "UNENTERED":
      return "미입력";
    case "PENDING":
      return "대기중";
    case "APPROVED":
    case "ACTIVE":
      return "승인됨";
    case "REJECTED":
    case "DROPPED":
      return "반려됨";
    case "PRESENT":
      return "출석";
    case "LATE":
      return "지각";
    case "ABSENT":
      return "결석";
    case "EXCUSED":
      return "공결";
    case "DRAFT":
      return "임시저장";
    case "SUBMITTED":
      return "제출완료";
    case "OPENED":
      return "공개됨";
    case "OBJECTION":
      return "이의신청";
    case "FINAL":
      return "성적확정";
    default:
      return props.status;
  }
});

const statusClass = computed(() => {
  switch (props.status) {
    case "APPROVED":
    case "ACTIVE":
    case "PRESENT":
    case "EXCUSED":
    case "OPENED":
    case "FINAL":
      return "approved";
    case "REJECTED":
    case "DROPPED":
    case "ABSENT":
    case "OBJECTION":
      return "rejected";
    case "UNENTERED":
      return "unentered";
    case "PENDING":
    case "LATE":
    case "DRAFT":
      return "pending";
    case "SUBMITTED":
      return "submitted";
    default:
      return "pending";
  }
});
</script>

<style scoped>
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-block;
  text-align: center;
}

.status-badge.pending {
  color: var(--primary-text-color);
}

.status-badge.approved {
  color: var(--primary-text-color);
}

.status-badge.rejected {
  color: var(--personal-color-red);
}

.status-badge.submitted {
  color: var(--primary-text-color);
}

.status-badge.unentered {
  color: var(--personal-color-red);
}
</style>
