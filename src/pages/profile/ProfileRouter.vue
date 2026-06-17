<script setup>
import { computed } from "vue";
import { useAuthStore } from "../../store/auth/useAuthStore";

import StudentProfile from "./StudentProfile.vue";
import ProfessorProfile from "./ProfessorProfile.vue";
import AdminProfile from "./AdminProfile.vue";

const authStore = useAuthStore();

const profileComponent = computed(() => {
  switch (authStore.userInfo?.role) {
    case "STUDENT":
      return StudentProfile;
    case "PROFESSOR":
      return ProfessorProfile;
    case "ADMIN":
      return AdminProfile;
    default:
      return null;
  }
});
</script>

<template>
  <component :is="profileComponent" v-if="profileComponent" />
</template>
