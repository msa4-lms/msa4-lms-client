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
      return "approved";
    case "REJECTED":
    case "DROPPED":
    case "ABSENT":
      return "rejected";
    case "PENDING":
    case "LATE":
      return "pending";
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
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background-color: #f8d7da;
  color: #721c24;
}
</style>
