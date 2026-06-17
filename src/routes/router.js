import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/auth/Login.vue";
import Main from "../pages/Main.vue";
import LectureList from "../pages/lectures/LectureList.vue";
import LectureEnrollment from "../pages/enrollment/LectureEnrollment.vue";
import EnrollmentList from "../pages/enrollment/EnrollmentList.vue";
import { useAuthStore } from "../store/auth/useAuthStore.js";
import ProfileRouter from "../pages/profile/ProfileRouter.vue";

const setMeta = (isAuthenticated, isGuestOnly) => {
  return {
    isAuthenticated, // 인증된 사용자
    isGuestOnly, // 게스트
  };
};

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login,
    meta: setMeta(false, true),
  },
  {
    path: "/main",
    name: "Main",
    component: Main,
    meta: setMeta(true, false),
  },
  {
    path: "/lectures",
    name: "LectureList",
    component: LectureList,
    meta: setMeta(true, false),
  },
  {
    path: "/enrollments",
    name: "EnrollmentList",
    component: EnrollmentList,
    meta: setMeta(true, false),
  },
  {
    path: "/registration",
    name: "Registration",
    component: LectureEnrollment,
    meta: setMeta(true, false),
  },
  {
    path: "/grade",
    name: "Grade",
    component: Main, // 미구현 상태이므로 메인으로 연결
    meta: setMeta(true, false),
  },
  {
    path: "/profile",
    name: "Profile",
    component: ProfileRouter, // 미구현 상태이므로 메인으로 연결
    meta: setMeta(true, false),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isLoggedIn) {
    try {
      await authStore.reissue();
    } catch (error) {}
  }

  if (to.meta.isAuthenticated && !authStore.isLoggedIn) {
    return next("/");
  }

  if (to.meta.isGuestOnly && authStore.isLoggedIn) {
    return next("/");
  }

  next();
});

export default router;
