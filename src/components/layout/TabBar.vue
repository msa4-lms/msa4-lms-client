<script setup>
import { useTabStore } from '../../store/tab/useTabStore';
import { useRouter } from 'vue-router';

const tabStore = useTabStore();
const router = useRouter();

const selectTab = (path) => {
  if (tabStore.activeTab !== path) {
    router.push(path);
  }
};

const closeTab = (path, event) => {
  event.stopPropagation();
  tabStore.removeTab(path);
};
</script>

<template>
  <div class="tab-bar" v-if="tabStore.tabs.length > 0">
    <div
      v-for="tab in tabStore.tabs"
      :key="tab.path"
      :class="['tab-item', { active: tab.path === tabStore.activeTab }]"
      @click="selectTab(tab.path)"
    >
      <span class="tab-title">{{ tab.title }}</span>
      <button class="close-btn" @click="closeTab(tab.path, $event)">
        ×
      </button>
    </div>
  </div>
</template>

<style scoped>
.tab-bar {
  display: flex;
  background-color: #e2e8f0;
  padding: 8px 8px 0 8px;
  gap: 4px;
  overflow-x: auto;
  border-bottom: 1px solid #cbd5e1;
}

.tab-bar::-webkit-scrollbar {
  height: 4px;
}

.tab-bar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}

.tab-item {
  display: flex;
  align-items: center;
  background-color: #f1f5f9;
  color: #64748b;
  padding: 8px 16px;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  min-width: 120px;
  max-width: 200px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  border: 1px solid transparent;
  border-bottom: none;
}

.tab-item:hover {
  background-color: #e2e8f0;
}

.tab-item.active {
  background-color: #ffffff;
  color: #0b3d91;
  border-color: #cbd5e1;
}

.tab-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
}

.close-btn {
  background: none;
  border: none;
  color: inherit;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  opacity: 0.6;
  padding: 0 4px;
}

.close-btn:hover {
  opacity: 1;
  color: #ef4444;
}
</style>
