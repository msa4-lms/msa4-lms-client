import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/auth/Login.vue";
import Main from "../pages/Main.vue";
import LectureList from "../pages/lectures/LectureList.vue";
import EnrollmentList from "../pages/enrollment/EnrollmentList.vue";

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
    name: 'EnrollmentList',
    component: EnrollmentList,
  },
  {
    path: '/registration',
    name: 'Registration',
    component: LectureList, // 수강 신청은 강의 목록에서 진행하므로 우선 연결
  },
  {
    path: '/grade',
    name: 'Grade',
    component: Main, // 미구현 상태이므로 메인으로 연결
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Main, // 미구현 상태이므로 메인으로 연결
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
