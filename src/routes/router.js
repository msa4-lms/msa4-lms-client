import { createRouter, createWebHistory } from "vue-router";
import GradePage from "../pages/academic/GradePage.vue";
import AttendancePage from "../pages/academic/AttendancePage.vue";
import ExcuseRequestPage from "../pages/academic/ExcuseRequestPage.vue";
import Login from "../pages/auth/Login.vue";
import LectureList from "../pages/lectures/LectureList.vue";
import LectureEnrollment from "../pages/enrollment/LectureEnrollment.vue";
import EnrollmentList from "../pages/enrollment/EnrollmentList.vue";
import { useAuthStore } from "../store/auth/useAuthStore.js";
import ProfileRouter from "../pages/profile/ProfileRouter.vue";
import Dashboard from "../pages/dashboard/Dashboard.vue";

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
    component: Dashboard,
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
    component: GradePage,
    meta: setMeta(true, false),
  },
  {
    path: "/profile",
    name: "Profile",
    component: ProfileRouter,
    meta: setMeta(true, false),
  },
  {
    path: "/attendance",
    name: "AttendancePage",
    component: AttendancePage,
    meta: setMeta(true, false),
  },
  {
    path: "/excuses",
    name: "ExcuseRequestPage",
    component: ExcuseRequestPage,
    meta: setMeta(true, false),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  if (!authStore.isLoggedIn && to.path !== "/") {
    try {
      await authStore.reissue();
    } catch (error) {}
  }

  // 인증이 필요한 페이지인데 로그인 안된 경우 -> 로그인 페이지로
  if (to.meta.isAuthenticated && !authStore.isLoggedIn) {
    return next("/");
  }

  if (to.meta.isGuestOnly && authStore.isLoggedIn) {
    return next("/main");
  }

  next();
});

router.afterEach((to) => {
  // 컴포넌트 외부에서 호출되므로 콜백 내부에서 동적으로 스토어를 임포트하여 사용
  import("../store/tab/useTabStore.js").then(({ useTabStore }) => {
    const tabStore = useTabStore();
    tabStore.addTab(to);
  });
});

export default router;
