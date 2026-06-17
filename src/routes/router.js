import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import GradePage from "../pages/academic/GradePage.vue";
import AttendancePage from "../pages/academic/AttendancePage.vue";

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/academic/grades',
    name: 'GradePage',
    component: GradePage,
  },
  {
    path: '/academic/attendance',
    name: 'AttendancePage',
    component: AttendancePage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
