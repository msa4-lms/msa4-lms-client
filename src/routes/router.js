import { createRouter, createWebHistory } from "vue-router";
import Main from "../pages/Main.vue";
import LectureList from "../pages/lectures/LectureList.vue";

const routes = [
  {
    path: '/',
    name: 'Main',
    component: Main,
  },
  {
    path: '/lectures',
    name: 'LectureList',
    component: LectureList,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
