<script setup>
const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['changePage']);

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('changePage', page);
  }
};
</script>

<template>
  <div class="pagination" v-if="totalPages > 0">
    <button 
      v-for="p in totalPages" 
      :key="p" 
      :class="{ active: currentPage === p }"
      @click="goToPage(p)"
    >
      {{ p }}
    </button>
  </div>
</template>

<style scoped>
</style>
