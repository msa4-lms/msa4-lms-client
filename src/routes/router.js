import { createRouter, createWebHistory } from "vue-router";
<<<<<<< HEAD
import Home from "../pages/Home.vue";
import Login from "../pages/auth/Login.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login,
  },
  {
    path: "/home",
    name: "Home",
    component: Home,
=======
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
>>>>>>> 7aa87304f8dce3401c912458d14ec093e5934189
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
