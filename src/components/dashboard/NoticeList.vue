<script setup>
defineProps({
  notices: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <div class="notice-section">
    <div class="section-header">
      <h2>공지사항</h2>
    </div>
    <div class="notice-list">
    <div v-for="notice in notices" :key="notice.id" class="notice-item">
      <div class="notice-title">
        {{ notice.title }}
      </div>

      <div class="notice-content">
        {{ notice.content }}
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
.notice-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-header {
  margin-bottom: 16px;
  padding: 0 4px;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1f36;
  margin: 0;
}

.notice-list {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  flex: 1;
  overflow-y: auto;
}

.notice-item {
  padding: 15px 0px;
  border-bottom: 1px solid #eeeeee;
}

.notice-item:last-child {
  border-bottom: none;
}

.notice-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.notice-content {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}
</style>
