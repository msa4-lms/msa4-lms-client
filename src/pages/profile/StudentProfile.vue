<script setup>
import { computed, onMounted } from "vue";
import { useProfileStore } from "../../store/profile/useProfileStore";
import PasswordChange from "./PasswordChange.vue";
import MyInput from "../../components/input/MyInput.vue";
import MyPageContainer from "../../components/layout/MyPageContainer.vue";

const profileStore = useProfileStore();

onMounted(async () => {
  await profileStore.fetchStudentProfile();
});

const user = computed(() => profileStore.profile || {});

const formatStatus = (status) => {
  if (status === "ENROLLED") return "재학";
  if (status === "GRADUATED") return "졸업";
  if (status === "LEAVE") return "휴학";
  return status || "-";
};

const student = computed(() => ({
  name: user.value.name || "-",
  status: formatStatus(user.value.status),
  department: user.value.departmentName || "-",
  grade: user.value.grade ? `${user.value.grade}학년` : "-",
  studentNo: user.value.studentNo || "-",
  email: user.value.email || "-",
  phone: user.value.phoneNum || "-",
  address: user.value.address || "-",
  college: user.value.collegeName || "-",
  advisor: user.value.advisorName || "-",
  entranceYear: user.value.admissionYear || "-",
  credits:
    user.value.credits !== null && user.value.credits !== undefined
      ? `${user.value.credits} 학점`
      : "-",
}));

const summaryItems = computed(() => [
  { label: "입학년도", value: student.value.entranceYear + "년" },
  { label: "소속", value: student.value.college },
  { label: "학과", value: student.value.department },
  { label: "지도교수", value: student.value.advisor },
]);

const basicRows = computed(() => [
  { label: "이름", value: student.value.name },
  { label: "학번", value: student.value.studentNo },
  { label: "학과", value: student.value.department },
  { label: "학년", value: student.value.grade },
  { label: "이메일", value: student.value.email },
  { label: "연락처", value: student.value.phone },
  { label: "주소", value: student.value.address },
]);

const academicRows = computed(() => [
  { label: "학적 상태", value: student.value.status },
  { label: "입학년도", value: student.value.entranceYear },
  { label: "소속 단과대학", value: student.value.college },
  { label: "지도교수", value: student.value.advisor },
  { label: "학과", value: student.value.department },
  { label: "총 취득 학점", value: student.value.credits },
]);
</script>

<template>
  <MyPageContainer title="내 정보">

    <article class="profile-hero">
      <div class="student-intro">
        <div class="profile-image" aria-hidden="true"></div>

        <div class="student-main">
          <div class="name-row">
            <h2>{{ student.name }}</h2>
            <span class="status-badge">{{ student.status }}</span>
          </div>

          <ul class="quick-list" aria-label="학생 기본 요약">
            <li>
              <span class="icon" aria-hidden="true">◆</span>
              <span>{{ student.department }} {{ student.grade }}</span>
            </li>
            <li>
              <span class="icon" aria-hidden="true">◆</span>
              <span>학번 {{ student.studentNo }}</span>
            </li>
            <li>
              <span class="icon" aria-hidden="true">◆</span>
              <span>{{ student.email }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="summary-grid">
        <div
          v-for="item in summaryItems"
          :key="item.label"
          class="summary-item"
        >
          <span aria-hidden="true">◆</span>
          <span class="summary-label">{{ item.label }}</span>
          <span>{{ item.value }}</span>
        </div>
      </div>
    </article>

    <div class="info-grid">
      <article class="info-card">
        <header class="card-title">
          <span class="title-icon person" aria-hidden="true"></span>
          <h2>기본 정보</h2>
        </header>

        <dl class="info-list">
          <div v-for="row in basicRows" :key="row.label" class="info-row">
            <dt>{{ row.label }}</dt>
            <dd>{{ row.value }}</dd>
          </div>
        </dl>
      </article>

      <article class="info-card">
        <header class="card-title">
          <span class="title-icon cap" aria-hidden="true"></span>
          <h2>학적 정보</h2>
        </header>

        <dl class="info-list">
          <div v-for="row in academicRows" :key="row.label" class="info-row">
            <dt>{{ row.label }}</dt>
            <dd>{{ row.value }}</dd>
          </div>
        </dl>
      </article>
    </div>

    <article class="security-card">
      <div class="security-copy">
        <span class="security-icon" aria-hidden="true"></span>
        <div>
          <h2>계정 보안</h2>
          <p>비밀번호를 변경하여 계정을 안전하게 관리하세요.</p>
        </div>
      </div>

      <PasswordChange />
    </article>
  </MyPageContainer>
</template>

<style scoped>
.student-profile-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  color: var(--primary-text-color);
}

.page-heading {
  padding-bottom: 10x;
}

.page-heading h2 {
  margin-bottom: 8px;
  color: var(--primary-text-color);
  letter-spacing: 0;
}

.page-heading p {
  color: var(--primary-text-color);
  font-size: 1rem;
}

.profile-hero,
.info-card,
.security-card {
  background: var(--personal-color-white);
  border: 1px solid #e5eaf2;
  border-radius: 8px;
}

.profile-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  margin-bottom: 28px;
  padding: 28px 50px;
}

.student-intro {
  display: flex;
  align-items: center;
  gap: 70px;
  min-width: 0;
}

.profile-image {
  width: 148px;
  height: 180px;
  background-image: url("/student-profile.jpeg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  flex: 0 0 148px;
  overflow: hidden;
}

.student-main {
  min-width: 0;
}

.name-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 12px;
  margin-bottom: 18px;
}

.name-row h2 {
  color: var(--primary-text-color);
  font-size: 1.75rem;
  letter-spacing: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 4px 12px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1756b8;
  font-size: 0.88rem;
  font-weight: 500;
}

.quick-list {
  display: flex;
  flex-direction: column;
  gap: 13px;
  list-style: none;
}

.quick-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  color: var(--primary-text-color);
  font-size: 1rem;
}

.quick-list strong {
  overflow-wrap: anywhere;
}

.icon {
  width: 18px;
  color: var(--secondary-text-color);
  font-size: 0.9rem;
  text-align: center;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px 34px;
  padding-left: 90px;
  border-left: 1px solid #d5dbe6;
}

.summary-item {
  display: grid;
  grid-template-columns: 24px minmax(72px, 1fr) minmax(92px, 1fr);
  align-items: center;
  gap: 10px;
  min-height: 34px;
}

.summary-label {
  color: var(--primary-text-color);
}

.summary-item strong {
  color: var(--primary-text-color);
}

.line-icon,
.title-icon {
  position: relative;
  display: inline-block;
  color: var(--secondary-text-color);
}

.line-icon {
  width: 20px;
  height: 20px;
}

.line-icon.calendar::before {
  content: "";
  position: absolute;
  inset: 3px 2px 2px;
  border: 2px solid currentColor;
  border-radius: 4px;
}

.line-icon.calendar::after {
  content: "";
  position: absolute;
  left: 5px;
  right: 5px;
  top: 8px;
  border-top: 2px solid currentColor;
}

.line-icon.users::before,
.line-icon.person::before {
  content: "";
  position: absolute;
  left: 7px;
  top: 2px;
  width: 7px;
  height: 7px;
  border: 2px solid currentColor;
  border-radius: 50%;
}

.line-icon.users::after,
.line-icon.person::after {
  content: "";
  position: absolute;
  left: 3px;
  bottom: 2px;
  width: 14px;
  height: 8px;
  border: 2px solid currentColor;
  border-radius: 8px 8px 3px 3px;
}

.line-icon.clock::before {
  content: "";
  position: absolute;
  inset: 2px;
  border: 2px solid currentColor;
  border-radius: 50%;
}

.line-icon.clock::after {
  content: "";
  position: absolute;
  left: 10px;
  top: 5px;
  width: 5px;
  height: 7px;
  border-left: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 26px;
  margin-bottom: 30px;
}

.info-card {
  padding: 26px 30px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 18px;
  border-bottom: 2px solid #e5eaf2;
}

.card-title h2,
.security-copy h2 {
  color: var(--primary-text-color);
  font-size: 1.25rem;
  letter-spacing: 0;
}

.title-icon {
  width: 24px;
  height: 24px;
}

.title-icon.person::before {
  content: "";
  position: absolute;
  left: 8px;
  top: 1px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color);
}

.title-icon.person::after {
  content: "";
  position: absolute;
  left: 2px;
  bottom: 1px;
  width: 20px;
  height: 12px;
  border-radius: 12px 12px 4px 4px;
  background: var(--primary-color);
}

.title-icon.cap::before {
  content: "";
  position: absolute;
  left: 1px;
  top: 4px;
  width: 22px;
  height: 14px;
  background: var(--primary-color);
  clip-path: polygon(50% 0, 100% 38%, 50% 76%, 0 38%);
}

.title-icon.cap::after {
  content: "";
  position: absolute;
  left: 7px;
  bottom: 2px;
  width: 10px;
  height: 6px;
  border-radius: 0 0 6px 6px;
  background: var(--primary-color);
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: grid;
  grid-template-columns: minmax(92px, 0.36fr) minmax(0, 1fr);
  min-height: 44px;
  padding: 13px 40px;
  border-bottom: 1px solid #e5eaf2;
}

.info-row:last-child {
  border-bottom: 0;
}

.info-row dt {
  color: var(--primary-text-color);
}

.info-row dd {
  min-width: 0;
  color: var(--primary-text-color);
  overflow-wrap: anywhere;
}

.security-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 26px 36px;
  border-left: 4px solid var(--primary-color);
}

.security-copy {
  display: flex;
  align-items: center;
  gap: 22px;
}

.security-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  flex: 0 0 68px;
  border-radius: 50%;
  background: #cfe0ff;
  color: var(--primary-color);
}

.security-icon::before {
  content: "";
  position: absolute;
  width: 25px;
  height: 21px;
  bottom: 18px;
  border-radius: 4px;
  background: var(--primary-color);
}

.security-icon::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 17px;
  top: 18px;
  border: 5px solid #174aa5;
  border-bottom: 0;
  border-radius: 14px 14px 0 0;
}

.security-copy p {
  margin-top: 6px;
  color: #475569;
}

.security-card > :deep(button.deep-blue) {
  width: 180px;
  height: 52px;
  border-radius: 6px;
}

@media (max-width: 1080px) {
  .profile-hero,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    padding-top: 26px;
    padding-left: 0;
    border-top: 1px solid #d5dbe6;
    border-left: 0;
  }
}

@media (max-width: 720px) {
  .student-profile-page {
    max-width: none;
  }

  .profile-hero,
  .info-card,
  .security-card {
    padding: 22px;
  }

  .student-intro,
  .security-card,
  .security-copy {
    align-items: flex-start;
  }

  .student-intro,
  .security-card {
    flex-direction: column;
  }

  .avatar {
    width: 118px;
    height: 118px;
    flex-basis: 118px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .summary-item,
  .info-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .security-card > :deep(button.deep-blue) {
    width: 100%;
  }
}
</style>
