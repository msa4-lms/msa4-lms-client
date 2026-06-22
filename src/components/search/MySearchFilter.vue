<script setup>
import MyButton from "../button/MyButton.vue";

defineProps({
  showSubmit: {
    type: Boolean,
    default: true
  },
  submitText: {
    type: String,
    default: "조회"
  }
});

defineEmits(['search']);
</script>

<template>
  <div class="search-section">
    <div class="search-row">
      <slot></slot>
      <MyButton
        v-if="showSubmit"
        btnType="button"
        color="deep-blue"
        size="small"
        :content="submitText"
        @click="$emit('search')"
      />
    </div>
  </div>
</template>

<style>
/* Scoped를 제거하거나 다른 검색 그룹에서 쓰일 수 있게 공통 제공 */
.search-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #edf2f7;
  margin-bottom: 24px;
}

.search-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.search-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-group label {
  color: #4f566b;
  font-size: 0.85rem;
  font-weight: 600;
}

.search-group select {
  min-width: 160px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  box-sizing: border-box;
  font-size: 0.9rem;
}
</style>
