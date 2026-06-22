<script setup>
defineProps({
  notices: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <div class="notice-list">
    <h2>공지사항</h2>

    <div v-for="notice in notices" :key="notice.id" class="notice-item">
      <div class="notice-title">
        {{ notice.title }}
      </div>

      <div class="notice-content">
        {{ notice.content }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.notice-list {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.notice-list h2 {
  padding-bottom: 12px;
  font-size: 23px;
  border-bottom: 1px solid #eeeeee;
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
