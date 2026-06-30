import { createRouter, createWebHistory } from "vue-router";
const StudentGradePage = () => import("../pages/grade/StudentGradePage.vue");
const StudentAttendancePage = () => import("../pages/attendance/StudentAttendancePage.vue");
const StudentExcuseRequestPage = () =>
  import("../pages/attendance/StudentExcuseRequestPage.vue");
const Login = () => import("../pages/auth/Login.vue");
const StudentLectureList = () => import("../pages/lectures/StudentLectureList.vue");
const StudentLectureEnrollment = () =>
  import("../pages/enrollment/StudentLectureEnrollment.vue");
const StudentEnrollmentList = () => import("../pages/enrollment/StudentEnrollmentList.vue");
import { useAuthStore } from "../store/auth/useAuthStore.js";
import { notify } from "../composables/useDialog";
import ProfessorGradeCorrect from "../pages/grade/ProfessorGradeCorrect.vue";
const ProfileRouter = () => import("../pages/profile/ProfileRouter.vue");
const Dashboard = () => import("../pages/dashboard/Dashboard.vue");
const ProfessorLectureCreate = () =>
  import("../pages/lectures/ProfessorLectureCreate.vue");
const ProfessorGradeManage = () =>
  import("../pages/grade/ProfessorGradeManage.vue");
const ProfessorExcuseApprovalPage = () =>
  import("../pages/attendance/ProfessorExcuseApprovalPage.vue");
const StudentLeaveReturnPage = () =>
  import("../pages/leaveReturn/StudentLeaveReturnPage.vue");
const ProfessorLeaveReturnPage = () =>
  import("../pages/leaveReturn/ProfessorLeaveReturnPage.vue");
const ProfessorAttendancePage = () =>
  import("../pages/attendance/ProfessorAttendancePage.vue");
const setMeta = (isAuthenticated, isGuestOnly, roles = []) => {
  return {
    isAuthenticated, // 인증된 사용자
    isGuestOnly, // 게스트
    roles, // 접근을 허용할 권한 목록
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
    name: "StudentLectureList",
    component: StudentLectureList,
    meta: setMeta(true, false),
  },
  {
    path: "/enrollments",
    name: "StudentEnrollmentList",
    component: StudentEnrollmentList,
    meta: setMeta(true, false),
  },
  {
    path: "/registration",
    name: "Registration",
    component: StudentLectureEnrollment,
    meta: setMeta(true, false),
  },
  {
    path: "/grade",
    name: "Grade",
    component: StudentGradePage,
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
    name: "StudentAttendancePage",
    component: StudentAttendancePage,
    meta: setMeta(true, false, ["STUDENT"]),
  },
  {
    path: "/excuses",
    name: "StudentExcuseRequestPage",
    component: StudentExcuseRequestPage,
    meta: setMeta(true, false, ["STUDENT"]),
  },
  {
    path: "/professor/lectures/create",
    name: "ProfessorLectureCreate",
    component: ProfessorLectureCreate,
    meta: setMeta(true, false, ["PROFESSOR"]),
  },
  {
    path: "/professor/grades/input",
    name: "ProfessorGradeInput",
    component: ProfessorGradeManage,
    meta: setMeta(true, false, ["PROFESSOR"]),
  },
  {
    path: "/professor/grades/correct",
    name: "ProfessorGradeCorrect",
    component: ProfessorGradeCorrect,
    meta: setMeta(true, false, ["PROFESSOR"]),
  },
  {
    path: "/professor/attendance/approvals",
    name: "ProfessorExcuseApproval",
    component: ProfessorExcuseApprovalPage,
    meta: setMeta(true, false, ["PROFESSOR"]),
  },
  {
    path: "/professor/attendance",
    name: "ProfessorAttendancePage",
    component: ProfessorAttendancePage,
    meta: setMeta(true, false, ["PROFESSOR"]),
  },
  {
    path: "/leave-return/general",
    name: "LeaveReturnGeneralPage",
    component: StudentLeaveReturnPage,
    meta: setMeta(true, false, ["STUDENT"]),
  },
  {
    path: "/leave-return/military",
    name: "LeaveReturnMilitaryPage",
    component: StudentLeaveReturnPage,
    meta: setMeta(true, false, ["STUDENT"]),
  },
  {
    path: "/professor/leave-return",
    name: "ProfessorLeaveReturnPage",
    component: ProfessorLeaveReturnPage,
    meta: setMeta(true, false, ["PROFESSOR"]),
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

  // 역할 기반 접근 제어 검사
  if (to.meta.roles && to.meta.roles.length > 0) {
    const userRole = authStore.userInfo?.role;
    if (!to.meta.roles.includes(userRole)) {
      notify("접근 권한이 없습니다.");
      return next("/main");
    }
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
