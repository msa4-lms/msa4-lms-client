<script setup>
defineProps({
  schedules: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <div class="schedule-list">
    <h3>학사일정</h3>

    <div v-for="schedule in schedules" :key="schedule.id" class="schedule-item">
      <div class="schedule-title">
        {{ schedule.title }}
      </div>

      <div class="schedule-date">
        {{ schedule.startDate }}
        <span v-if="schedule.endDate"> ~ {{ schedule.endDate }} </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-list {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  min-height: 0;
  overflow-y: auto;
}

.schedule-list h3 {
  padding-bottom: 12px;
  font-size: 23px;
  border-bottom: 1px solid #eeeeee;
}

.schedule-item {
  padding: 10px 0;
  border-bottom: 1px solid #eeeeee;
}

.schedule-item:last-child {
  border-bottom: none;
}

.schedule-title {
  font-weight: 600;
  margin-bottom: 6px;
}

.schedule-date {
  font-size: 14px;
  color: var(--primary-text-color);
}
</style>
