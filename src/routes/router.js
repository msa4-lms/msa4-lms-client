import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import MyEnrollmentPage from "../pages/enrollment/MyEnrollmentPage.vue";

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/enrollment',
    name: 'MyEnrollment',
    component: MyEnrollmentPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
