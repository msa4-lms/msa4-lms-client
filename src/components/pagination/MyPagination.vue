<script setup>
defineProps({
  currentPage: Number,
  totalPages: Number,
});

const emit = defineEmits(["page-change"]);
</script>

<template>
  <div class="pagination" v-if="totalPages > 0">
    <button
      v-for="page in totalPages"
      :key="page"
      :class="{ active: currentPage === page }"
      @click="emit('page-change', page)"
    >
      {{ page }}
    </button>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 30px;
}

.pagination button {
  padding: 8px 14px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.9rem;
}

.pagination button.active {
  background-color: var(--primary-color);
  color: white;
  font-weight: 600;
}

.pagination button:hover:not(.active) {
  background-color: #f8f9fa;
}
</style>
