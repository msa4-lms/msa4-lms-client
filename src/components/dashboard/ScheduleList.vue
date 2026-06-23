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

    <div class="schedule-container">
      <div
        v-for="schedule in schedules"
        :key="schedule.id"
        class="schedule-item"
      >
        <div class="schedule-title">
          {{ schedule.title }}
        </div>

        <div class="schedule-date">
          {{ schedule.startDate }}
          <span v-if="schedule.endDate"> ~ {{ schedule.endDate }} </span>
        </div>
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
}

.schedule-list h3 {
  padding-bottom: 12px;
  margin-bottom: 16px;
  font-size: 23px;
  border-bottom: 1px solid #eeeeee;
}

.schedule-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.schedule-item {
  background: #ffffff;
  border: 1px solid #eeeeee;
  border-radius: 10px;
  padding: 14px;
  transition: all 0.2s ease;
}

.schedule-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
}

.schedule-date {
  font-size: 14px;
  color: var(--primary-text-color);
}
</style>
