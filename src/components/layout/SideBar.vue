<script setup>
import { ref } from "vue";
import { useAuthStore } from "../../store/auth/useAuthStore";

const authStore = useAuthStore();

const activeMenus = ref({
  studentAcademic: false,
  studentCourse: false,
  studentGrade: false,
  studentAttendance: false,
  professorTeacher: false,
  professorStudent: false,
  professorCourse: false,
  professorGrade: false,
  professorAttendance: false,
});

const toggleMenu = (menuKey) => {
  activeMenus.value[menuKey] = !activeMenus.value[menuKey];
};

const alertReady = () => {
  alert("준비 중인 서비스입니다.");
};
</script>

<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <!-- 메인 화면 링크 -->
      <router-link to="/main" class="nav-item main-link">메인 화면</router-link>

      <!-- 학생 전용 메뉴 -->
      <template v-if="authStore.userInfo?.role === 'STUDENT'">
        <!-- 학사관리 -->
        <div class="menu-group">
          <div class="menu-header" @click="toggleMenu('studentAcademic')">
            <span>학사관리</span>
            <span
              class="chevron"
              :class="{ rotated: !activeMenus.studentAcademic }"
              >▼</span
            >
          </div>
          <div class="submenu-list" v-show="activeMenus.studentAcademic">
            <router-link to="/profile" class="submenu-item"
              >학적조회</router-link
            >
            <router-link to="/leave-return" class="submenu-item"
              >휴/복학 신청</router-link
            >
          </div>
        </div>

        <!-- 수강 관리 -->
        <div class="menu-group">
          <div class="menu-header" @click="toggleMenu('studentCourse')">
            <span>수강 관리</span>
            <span
              class="chevron"
              :class="{ rotated: !activeMenus.studentCourse }"
              >▼</span
            >
          </div>
          <div class="submenu-list" v-show="activeMenus.studentCourse">
            <router-link to="/enrollments" class="submenu-item"
              >시간표 조회</router-link
            >
            <router-link to="/registration" class="submenu-item"
              >수강 신청</router-link
            >
          </div>
        </div>

        <!-- 성적 관리 -->
        <div class="menu-group">
          <div class="menu-header" @click="toggleMenu('studentGrade')">
            <span>성적 관리</span>
            <span
              class="chevron"
              :class="{ rotated: !activeMenus.studentGrade }"
              >▼</span
            >
          </div>
          <div class="submenu-list" v-show="activeMenus.studentGrade">
            <router-link to="/grade" class="submenu-item"
              >성적 조회</router-link
            >
          </div>
        </div>

        <!-- 출결 관리 -->
        <div class="menu-group">
          <div class="menu-header" @click="toggleMenu('studentAttendance')">
            <span>출결 관리</span>
            <span
              class="chevron"
              :class="{ rotated: !activeMenus.studentAttendance }"
              >▼</span
            >
          </div>
          <div class="submenu-list" v-show="activeMenus.studentAttendance">
            <router-link to="/attendance" class="submenu-item"
              >출결 조회</router-link
            >
            <router-link to="/excuses" class="submenu-item"
              >공결 신청</router-link
            >
          </div>
        </div>
      </template>

      <template v-if="authStore.userInfo?.role === 'PROFESSOR'">
        <!-- 교사관리 -->
        <div class="menu-group">
          <div class="menu-header" @click="toggleMenu('professorTeacher')">
            <span>교사관리</span>
            <span
              class="chevron"
              :class="{ rotated: !activeMenus.professorTeacher }"
              >▼</span
            >
          </div>
          <div class="submenu-list" v-show="activeMenus.professorTeacher">
            <router-link to="/profile" class="submenu-item"
              >교적 조회</router-link
            >
          </div>
        </div>

        <!-- 학생 관리 -->
        <div class="menu-group">
          <div class="menu-header" @click="toggleMenu('professorStudent')">
            <span>학생 관리</span>
            <span
              class="chevron"
              :class="{ rotated: !activeMenus.professorStudent }"
              >▼</span
            >
          </div>
          <div class="submenu-list" v-show="activeMenus.professorStudent">
            <router-link to="/professor/leave-return" class="submenu-item"
              >휴/복학 결재</router-link
            >
          </div>
        </div>

        <!-- 강의 관리 -->
        <div class="menu-group">
          <div class="menu-header" @click="toggleMenu('professorCourse')">
            <span>강의 관리</span>
            <span
              class="chevron"
              :class="{ rotated: !activeMenus.professorCourse }"
              >▼</span
            >
          </div>
          <div class="submenu-list" v-show="activeMenus.professorCourse">
            <router-link to="/professor/lectures/create" class="submenu-item"
              >강의 개설</router-link
            >
            <router-link to="/lectures" class="submenu-item"
              >강의 조회</router-link
            >
          </div>
        </div>

        <!-- 성적 관리 -->
        <div class="menu-group">
          <div class="menu-header" @click="toggleMenu('professorGrade')">
            <span>성적 관리</span>
            <span
              class="chevron"
              :class="{ rotated: !activeMenus.professorGrade }"
              >▼</span
            >
          </div>
          <div class="submenu-list" v-show="activeMenus.professorGrade">
            <router-link to="/professor/grades/input" class="submenu-item"
              >성적 입력</router-link
            >
            <a href="#" class="submenu-item" @click.prevent="alertReady"
              >성적 정정</a
            >
          </div>
        </div>

        <!-- 출결 관리 -->
        <div class="menu-group">
          <div class="menu-header" @click="toggleMenu('professorAttendance')">
            <span>출결 관리</span>
            <span
              class="chevron"
              :class="{ rotated: !activeMenus.professorAttendance }"
              >▼</span
            >
          </div>
          <div class="submenu-list" v-show="activeMenus.professorAttendance">
            <router-link to="/professor/attendance/approvals" class="submenu-item"
              >출결 승인</router-link
            >
            <a href="#" class="submenu-item" @click.prevent="alertReady"
              >출결 확인</a
            >
            <a href="#" class="submenu-item" @click.prevent="alertReady"
              >출석부</a
            >
          </div>
        </div>
      </template>

      <template v-if="authStore.userInfo?.role === 'ADMIN'">
        <router-link to="/students" class="nav-item">사용자 관리</router-link>
        <router-link to="/profile" class="nav-item">내 정보</router-link>
      </template>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  background-color: #fff;
  padding-top: 47px;
  height: calc(100vh);
  position: sticky;
  top: 64px;
  box-sizing: border-box;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 메인 링크 */
.main-link {
  border-left: 4px solid transparent;
}

.nav-item {
  padding: 12px 24px;
  text-decoration: none;
  color: #4a5568;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s;
  display: block;
}

.nav-item:hover {
  background-color: #f7fafc;
  color: #1a73e8;
}

/* 메뉴 그룹 */
.menu-group {
  display: flex;
  flex-direction: column;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  cursor: pointer;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.95rem;
  user-select: none;
  transition: all 0.2s;
}

.menu-header:hover {
  background-color: #f7fafc;
  color: #1a73e8;
}

.chevron {
  font-size: 0.7rem;
  transition: transform 0.2s ease;
  color: #a0aec0;
}

.chevron.rotated {
  transform: rotate(-180deg);
}

/* 서브메뉴 */
.submenu-list {
  background-color: #f7fafc;
  border-top: 1px solid #edf2f7;
  border-bottom: 1px solid #edf2f7;
  transition: max-height 0.3s ease;
}

.submenu-item {
  display: block;
  padding: 10px 24px 10px 38px;
  text-decoration: none;
  color: #718096;
  font-size: 0.88rem;
  font-weight: 500;
  transition: all 0.2s;
}

.submenu-item:hover {
  background-color: #edf2f7;
  color: #1a73e8;
}

.router-link-active {
  background-color: #e8f0fe;
  color: #1a73e8;
  font-weight: 600;
}

.router-link-active.main-link {
  border-left: 4px solid #1a73e8;
}
</style>
