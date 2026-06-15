import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/auth/Login.vue";
import Main from "../pages/Main.vue";
import LectureList from "../pages/lectures/LectureList.vue";
import MyEnrollmentPage from "../pages/enrollment/MyEnrollmentPage.vue";

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/main',
    name: 'Main',
    component: Main,
  },
  {
    path: '/lectures',
    name: 'LectureList',
    component: LectureList,
  },
  {
    path: '/enrollments',
    name: 'MyEnrollment',
    component: MyEnrollmentPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
