import { createRouter, createWebHistory } from "vue-router";
const GradePage = () => import("../pages/academic/GradePage.vue");
const AttendancePage = () => import("../pages/academic/AttendancePage.vue");
const ExcuseRequestPage = () => import("../pages/academic/ExcuseRequestPage.vue");
const Login = () => import("../pages/auth/Login.vue");
const LectureList = () => import("../pages/lectures/LectureList.vue");
const LectureEnrollment = () => import("../pages/enrollment/LectureEnrollment.vue");
const EnrollmentList = () => import("../pages/enrollment/EnrollmentList.vue");
import { useAuthStore } from "../store/auth/useAuthStore.js";
const ProfileRouter = () => import("../pages/profile/ProfileRouter.vue");
const Dashboard = () => import("../pages/dashboard/Dashboard.vue");
const ProfessorLectureCreate = () => import("../pages/lectures/ProfessorLectureCreate.vue");
const ProfessorGradeManage = () => import("../pages/academic/ProfessorGradeManage.vue");
const LeaveReturnPage = () => import("../pages/academic/LeaveReturnPage.vue");
const ProfessorLeaveReturnPage = () => import("../pages/academic/ProfessorLeaveReturnPage.vue");
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
  {
    path: "/professor/lectures/create",
    name: "ProfessorLectureCreate",
    component: ProfessorLectureCreate,
    meta: setMeta(true, false),
  },
  {
    path: "/professor/grades/input",
    name: "ProfessorGradeInput",
    component: ProfessorGradeManage,
    meta: setMeta(true, false),
  },
  {
    path: "/professor/grades/correct",
    name: "ProfessorGradeCorrect",
    component: ProfessorGradeManage,
    meta: setMeta(true, false),
  },
  {
    path: "/leave-return",
    name: "LeaveReturnPage",
    component: LeaveReturnPage,
    meta: setMeta(true, false),
  },
  {
    path: "/professor/leave-return",
    name: "ProfessorLeaveReturnPage",
    component: ProfessorLeaveReturnPage,
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
