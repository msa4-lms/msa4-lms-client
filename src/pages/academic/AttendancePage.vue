<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import myAxios from "../../api/myAxios";
import { useAcademicStore } from "../../store/academic/useAcademicStore";
import MyButton from "../../components/button/MyButton.vue";
import { useAuthStore } from "../../store/auth/useAuthStore";

const academicStore = useAcademicStore();
const authStore = useAuthStore();

const labels = {
  pageStudent: "\uCD9C\uACB0 \uD604\uD669",
  pageProfessor: "\uCD9C\uACB0 \uAD00\uB9AC",
  averageRate: "\uD3C9\uADE0 \uCD9C\uC11D\uB960",
  failRisk: "F \uCC98\uB9AC \uC704\uD5D8 \uACFC\uBAA9",
  pendingExcuse: "\uC2B9\uC778 \uB300\uAE30 \uACF5\uACB0",
  rateTitle: "\uACFC\uBAA9\uBCC4 \uCD9C\uC11D\uB960",
  excuseTitle: "\uACF5\uACB0 \uC2E0\uCCAD",
  recentTitle: "\uCD5C\uADFC \uCD9C\uACB0 \uB0B4\uC5ED",
  resultTitle: "\uACF5\uACB0 \uC2B9\uC778 \uACB0\uACFC",
  pendingApproval: "\uACF5\uACB0 \uC2B9\uC778 \uB300\uAE30",
  year: "\uC870\uD68C \uC5F0\uB3C4",
  semester: "\uD559\uAE30",
  targetTerm: "\uB300\uC0C1 \uD559\uAE30",
  firstSemester: "1\uD559\uAE30",
  secondSemester: "2\uD559\uAE30",
  yearSuffix: "\uB144",
  search: "\uC870\uD68C",
  subject: "\uACFC\uBAA9",
  date: "\uB0A0\uC9DC",
  period: "\uAD50\uC2DC",
  reason: "\uC0AC\uC720",
  select: "\uC120\uD0DD",
  apply: "\uC2E0\uCCAD",
  approve: "\uC2B9\uC778",
  reject: "\uBC18\uB824",
  accepted: "\uC778\uC815 \uCD9C\uC11D",
  totalClass: "\uC804\uCCB4 \uC218\uC5C5",
  rate: "\uCD9C\uC11D\uB960",
  status: "\uC0C1\uD0DC",
  normal: "\uC815\uC0C1",
  under75: "75% \uBBF8\uB9CC",
  emptyRate: "\uCD9C\uC11D\uB960 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
  emptyAttendance: "\uB4F1\uB85D\uB41C \uCD9C\uACB0 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  emptyExcuse: "\uACF5\uACB0 \uC2E0\uCCAD \uB0B4\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  emptyPending: "\uC2B9\uC778 \uB300\uAE30 \uC911\uC778 \uACF5\uACB0 \uC2E0\uCCAD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  loading: "\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4.",
};

const statusLabel = {
  PRESENT: "\uCD9C\uC11D",
  ABSENT: "\uACB0\uC11D",
  LATE: "\uC9C0\uAC01",
  TARDY: "\uC9C0\uAC01",
  EXCUSED: "\uACF5\uACB0",
  PENDING: "\uB300\uAE30",
  APPROVED: "\uC2B9\uC778",
  REJECTED: "\uBC18\uB824",
};

const enrollments = ref([]);
const loading = ref(false);
const searchParams = reactive({ year: 2026, semester: 1 });
const excuseForm = reactive({
  enrollmentId: "",
  lectureDate: "",
  period: 1,
  reason: "",
});

const selectedCourse = ref(null);
const isStudent = computed(() => authStore.userInfo?.role === "STUDENT");

const filteredAttendanceList = computed(() => {
  if (!selectedCourse.value) return [];
  return academicStore.attendanceList.filter((att) => att.courseName === selectedCourse.value);
});
const isProfessor = computed(() => authStore.userInfo?.role === "PROFESSOR");

const targetTermText = computed(() => {
  return `${searchParams.year}${labels.yearSuffix} ${searchParams.semester}${labels.semester}`;
});

const formatRate = (rate) => {
  if (rate === null || rate === undefined) return "-";
  return `${Number(rate).toFixed(1)}%`;
};

const loadEnrollments = async () => {
  try {
    const res = await myAxios.get("/api/student/enrollments/my", {
      params: {
        year: searchParams.year,
        semester: searchParams.semester,
      },
      suppressErrorAlert: true,
    });
    enrollments.value = res.data.data?.enrollments || [];
  } catch (error) {
    enrollments.value = [];
    console.warn("수강 내역 조회 실패(백엔드 500 에러 등):", error);
  }
};

const loadStudentData = async () => {
  loading.value = true;
  selectedCourse.value = null;
  try {
    await Promise.allSettled([
      academicStore.fetchAttendance(),
      academicStore.fetchAttendanceRates({ year: searchParams.year, semester: searchParams.semester }),
      academicStore.fetchMyExcuseRequests(),
      loadEnrollments(),
    ]);
  } finally {
    loading.value = false;
  }
};

const loadProfessorData = async () => {
  loading.value = true;
  try {
    await academicStore.fetchPendingExcuseRequests();
  } finally {
    loading.value = false;
  }
};

const onSearch = async () => {
  if (isStudent.value) {
    await loadStudentData();
  }
};

const submitExcuse = async () => {
  if (!excuseForm.enrollmentId || !excuseForm.lectureDate || !excuseForm.reason.trim()) {
    alert("\uACFC\uBAA9, \uB0A0\uC9DC, \uC0AC\uC720\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.");
    return;
  }

  await academicStore.requestExcuse({
    enrollmentId: Number(excuseForm.enrollmentId),
    lectureDate: excuseForm.lectureDate,
    period: Number(excuseForm.period),
    reason: excuseForm.reason.trim(),
  });

  excuseForm.lectureDate = "";
  excuseForm.period = 1;
  excuseForm.reason = "";
  alert("\uACF5\uACB0 \uC2E0\uCCAD\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
};

const decideExcuse = async (requestId, status) => {
  const rejectReason = status === "REJECTED" ? prompt("\uBC18\uB824 \uC0AC\uC720\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.") : "";
  if (status === "REJECTED" && !rejectReason) return;

  await academicStore.decideExcuseRequest(requestId, { status, rejectReason });
};

onMounted(async () => {
  if (!authStore.isLoggedIn) return;

  if (isStudent.value) await loadStudentData();
  if (isProfessor.value) await loadProfessorData();
});
</script>

<template>
  <div class="attendance-page">
    <div class="page-heading">
      <h2>{{ isProfessor ? labels.pageProfessor : labels.pageStudent }}</h2>
    </div>

    <template v-if="isStudent">
      <section class="filter-section">
        <div class="filter-row">
          <div class="filter-group">
            <label>{{ labels.year }}</label>
            <select v-model="searchParams.year">
              <option :value="2026">2026{{ labels.yearSuffix }}</option>
              <option :value="2025">2025{{ labels.yearSuffix }}</option>
              <option :value="2024">2024{{ labels.yearSuffix }}</option>
              <option :value="2023">2023{{ labels.yearSuffix }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>{{ labels.semester }}</label>
            <select v-model="searchParams.semester">
              <option :value="1">{{ labels.firstSemester }}</option>
              <option :value="2">{{ labels.secondSemester }}</option>
            </select>
          </div>
          <div class="current-term-info">
            <span class="label">{{ labels.targetTerm }}</span>
            <span class="value">{{ targetTermText }}</span>
          </div>
          <MyButton btnType="button" color="deep-blue" size="small" :content="labels.search" @click="onSearch" />
        </div>
      </section>

      <section class="table-section">
        <div class="section-header">
          <h3>{{ labels.rateTitle }}</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ labels.subject }}</th>
              <th>{{ labels.accepted }}</th>
              <th>{{ labels.totalClass }}</th>
              <th>{{ labels.rate }}</th>
              <th>{{ labels.status }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="empty-text">{{ labels.loading }}</td>
            </tr>
            <tr v-else-if="academicStore.attendanceRates.length === 0">
              <td colspan="5" class="empty-text">{{ labels.emptyRate }}</td>
            </tr>
            <tr
              v-for="rate in academicStore.attendanceRates"
              :key="rate.enrollmentId"
              class="clickable-row"
              :class="{ 'selected-row': selectedCourse === rate.courseName }"
              @click="selectedCourse = rate.courseName"
            >
              <td class="course-name">{{ rate.courseName }}</td>
              <td>{{ rate.attendedCount }}</td>
              <td>{{ rate.totalCount }}</td>
              <td>
                <span :class="['rate-text', { danger: rate.failTarget }]">
                  {{ formatRate(rate.attendanceRate) }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', { danger: rate.failTarget }]">
                  {{ rate.failTarget ? labels.under75 : labels.normal }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>



      <section class="table-section">
        <div class="section-header">
          <h3>{{ selectedCourse ? `${selectedCourse} 출결 내역` : '과목을 선택하면 출결 내역이 표시됩니다.' }}</h3>
        </div>
        <table class="data-table compact" v-if="selectedCourse">
          <thead>
            <tr>
              <th>{{ labels.date }}</th>
              <th>{{ labels.period }}</th>
              <th>{{ labels.status }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredAttendanceList.length === 0">
              <td colspan="3" class="empty-text">{{ labels.emptyAttendance }}</td>
            </tr>
            <tr
              v-for="att in filteredAttendanceList"
              :key="`${att.courseName}-${att.lectureDate}-${att.period}`"
            >
              <td>{{ att.lectureDate }}</td>
              <td>{{ att.period }}</td>
              <td>
                <span :class="['status-badge', att.status?.toLowerCase()]">
                  {{ statusLabel[att.status] || att.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state-box">
          <p>위의 과목별 출석률 표에서 원하시는 과목을 클릭해주세요.</p>
        </div>
      </section>
    </template>


  </div>
</template>

<style scoped>
.attendance-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  padding-bottom: 50px;
  color: var(--primary-text-color);
}

.page-heading {
  padding-bottom: 10px;
}

.page-heading h2 {
  margin-bottom: 8px;
  color: var(--primary-text-color);
  letter-spacing: 0;
  font-size: 1.5rem;
}

.filter-section,
.form-section,
.table-section {
  background: var(--personal-color-white, #fff);
  border: 1px solid #e5eaf2;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

.filter-section {
  padding: 20px;
  margin-bottom: 22px;
}

.filter-row,
.excuse-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label,
.current-term-info .label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #2f3a4f;
}

.filter-group input,
.filter-group select {
  width: 220px;
  height: 38px;
  border: 1px solid #d9dee7;
  border-radius: 4px;
  padding: 8px 12px;
  background: #fff;
  color: #1f2937;
  font-size: 0.92rem;
}

.current-term-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: flex-end;
  min-width: 90px;
}

.current-term-info .value {
  color: #0b3d91;
  font-size: 1rem;
  font-weight: 800;
  padding: 8px 0;
}

.btn-approve,
.btn-reject {
  height: 38px;
  border: 0;
  border-radius: 4px;
  padding: 8px 24px;
  color: #fff;
  cursor: pointer;
  font-weight: 700;
}

.rate-text.danger {
  color: #dc2626;
}

.table-section,
.form-section {
  margin-bottom: 22px;
  overflow: hidden;
}

.section-header {
  padding: 16px 20px;
  border-bottom: 1px solid #edf2f7;
}

.section-header h3 {
  color: #1a1f36;
  font-size: 1.02rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background-color: #f8f9fa;
  border-bottom: 2px solid #edf2f7;
  color: #4f566b;
  font-size: 0.85rem;
  padding: 13px 16px;
  white-space: nowrap;
}

.data-table td {
  border-bottom: 1px solid #edf2f7;
  color: #334155;
  font-size: 0.9rem;
  padding: 14px 16px;
}

.data-table tr:last-child td {
  border-bottom: 0;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clickable-row:hover {
  background-color: #f8fafc;
}

.selected-row {
  background-color: #eef2ff !important;
}

.empty-state-box {
  padding: 60px 20px;
  text-align: center;
  color: #64748b;
  font-size: 0.95rem;
  background-color: #f8fafc;
}

.course-name {
  color: #1a1f36;
  font-weight: 700;
}

.rate-text {
  color: #0b3d91;
  font-weight: 800;
}

.status-badge {
  display: inline-flex;
  min-width: 56px;
  justify-content: center;
  border-radius: 4px;
  padding: 4px 9px;
  background: #e6f4ea;
  color: #137333;
  font-size: 0.8rem;
  font-weight: 800;
}

.status-badge.danger,
.status-badge.absent,
.status-badge.rejected {
  background: #fce8e6;
  color: #c5221f;
}

.status-badge.pending,
.status-badge.late,
.status-badge.tardy {
  background: #fef7e0;
  color: #b06000;
}

.status-badge.excused,
.status-badge.approved {
  background: #e8f0fe;
  color: #1a73e8;
}

.form-section {
  padding-bottom: 20px;
}

.excuse-row {
  padding: 20px;
}

.subject-field {
  flex: 1.2;
}

.subject-field select,
.reason-field input {
  width: 100%;
}

.period-field input {
  width: 90px;
}

.reason-field {
  flex: 1.4;
}



.empty-text {
  color: #697386;
  padding: 38px 16px !important;
  text-align: center;
}

.button-group {
  display: flex;
  gap: 8px;
}

.btn-approve {
  background-color: #34a853;
  padding: 6px 12px;
}

.btn-reject {
  background-color: #dc3545;
  padding: 6px 12px;
}


@media (max-width: 760px) {
  .filter-row,
  .excuse-row {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-group,
  .filter-group input,
  .filter-group select {
    width: 100%;
  }
}
</style>
