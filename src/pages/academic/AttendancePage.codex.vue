<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import myAxios from "../../api/myAxios";
import { useAcademicStore } from "../../store/academic/useAcademicStore";
import { useAuthStore } from "../../store/auth/useAuthStore";

const academicStore = useAcademicStore();
const authStore = useAuthStore();

const labels = {
  pageStudent: "\uCD9C\uACB0 \uD604\uD669",
  pageProfessor: "\uCD9C\uACB0 \uAD00\uB9AC",
  pendingExcuse: "\uC2B9\uC778 \uB300\uAE30 \uACF5\uACB0",
  rateTitle: "\uACFC\uBAA9\uBCC4 \uCD9C\uC11D\uB960",
  recentTitle: "\uCD5C\uADFC \uCD9C\uACB0 \uB0B4\uC5ED",
  pendingApproval: "\uACF5\uACB0 \uC2B9\uC778 \uB300\uAE30",
  year: "\uC5F0\uB3C4",
  semester: "\uD559\uAE30",
  targetTerm: "\uB300\uC0C1 \uD559\uAE30",
  firstSemester: "1\uD559\uAE30",
  secondSemester: "2\uD559\uAE30",
  yearSuffix: "\uB144",
  search: "\uC870\uD68C",
  subject: "\uACFC\uBAA9",
  subjectName: "\uACFC\uBAA9\uBA85",
  date: "\uB0A0\uC9DC",
  period: "\uAD50\uC2DC",
  reason: "\uC0AC\uC720",
  select: "\uC120\uD0DD",
  approve: "\uC2B9\uC778",
  reject: "\uBC18\uB824",
  accepted: "\uC778\uC815 \uCD9C\uC11D",
  totalClass: "\uC804\uCCB4 \uC218\uC5C5",
  rate: "\uCD9C\uC11D\uB960",
  status: "\uC0C1\uD0DC",
  normal: "\uC815\uC0C1",
  warning: "\uACBD\uACE0",
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
const searchParams = reactive({
  keyword: "",
  year: 2026,
  semester: 1,
});

const isStudent = computed(() => authStore.userInfo?.role === "STUDENT");
const isProfessor = computed(() => authStore.userInfo?.role === "PROFESSOR");

const targetTermText = computed(() => {
  return `${searchParams.year}${labels.yearSuffix} ${searchParams.semester}${labels.semester}`;
});

const normalizedKeyword = computed(() => searchParams.keyword.trim().toLowerCase());
const filteredRates = computed(() => {
  if (!normalizedKeyword.value) return academicStore.attendanceRates;
  return academicStore.attendanceRates.filter((item) => item.courseName?.toLowerCase().includes(normalizedKeyword.value));
});

const filteredAttendance = computed(() => {
  if (!normalizedKeyword.value) return academicStore.attendanceList;
  return academicStore.attendanceList.filter((item) => item.courseName?.toLowerCase().includes(normalizedKeyword.value));
});

const formatRate = (rate) => {
  if (rate === null || rate === undefined) return "-";
  return `${Number(rate).toFixed(1)}%`;
};

const isWarningRate = (rate) => Number(rate.attendanceRate) < 80;

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
    console.error("수강 내역 조회 실패:", error);
  }
};

const loadStudentData = async () => {
  loading.value = true;
  try {
    await Promise.allSettled([
      academicStore.fetchAttendance(),
      academicStore.fetchAttendanceRates({
        year: searchParams.year,
        semester: searchParams.semester,
      }),
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
  <div class="attendance-container">
    <div class="page-header">
      <h2>{{ isProfessor ? labels.pageProfessor : labels.pageStudent }}</h2>
    </div>

    <template v-if="isStudent">
      <section class="search-section">
        <div class="search-row">
          <div class="search-group wide">
            <label>{{ labels.subjectName }}</label>
            <input v-model="searchParams.keyword" type="text" placeholder="과목명 입력" @keyup.enter="onSearch" />
          </div>
          <div class="search-group compact">
            <label>{{ labels.year }}</label>
            <select v-model="searchParams.year">
              <option :value="2026">2026{{ labels.yearSuffix }}</option>
              <option :value="2025">2025{{ labels.yearSuffix }}</option>
              <option :value="2024">2024{{ labels.yearSuffix }}</option>
              <option :value="2023">2023{{ labels.yearSuffix }}</option>
            </select>
          </div>
          <div class="search-group compact">
            <label>{{ labels.semester }}</label>
            <select v-model="searchParams.semester">
              <option :value="1">{{ labels.firstSemester }}</option>
              <option :value="2">{{ labels.secondSemester }}</option>
            </select>
          </div>
          <div class="term-info">
            <span class="label">{{ labels.targetTerm }}</span>
            <span class="value">{{ targetTermText }}</span>
          </div>
          <button class="btn-primary" type="button" @click="onSearch">{{ labels.search }}</button>
        </div>
      </section>

      <section class="panel">
        <div class="panel-title">
          <h3>{{ labels.rateTitle }}</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-subject">{{ labels.subject }}</th>
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
            <tr v-else-if="filteredRates.length === 0">
              <td colspan="5" class="empty-text">{{ labels.emptyRate }}</td>
            </tr>
            <tr v-for="rate in filteredRates" :key="rate.enrollmentId">
              <td class="course-name">{{ rate.courseName }}</td>
              <td>{{ rate.attendedCount }}</td>
              <td>{{ rate.totalCount }}</td>
              <td>
                <span :class="['rate-text', { danger: isWarningRate(rate) }]">
                  {{ formatRate(rate.attendanceRate) }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', { danger: isWarningRate(rate) }]">
                  {{ isWarningRate(rate) ? labels.warning : labels.normal }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <div class="table-grid single">
        <section class="panel">
          <div class="panel-title">
            <h3>{{ labels.recentTitle }}</h3>
          </div>
          <table class="data-table compact-table">
            <thead>
              <tr>
                <th>{{ labels.subject }}</th>
                <th>{{ labels.date }}</th>
                <th>{{ labels.period }}</th>
                <th>{{ labels.status }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredAttendance.length === 0">
                <td colspan="4" class="empty-text">{{ labels.emptyAttendance }}</td>
              </tr>
              <tr
                v-for="att in filteredAttendance"
                :key="`${att.courseName}-${att.lectureDate}-${att.period}`"
              >
                <td class="course-name">{{ att.courseName }}</td>
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
        </section>

      </div>
    </template>

    <template v-else-if="isProfessor">
      <section class="panel">
        <div class="panel-title">
          <h3>{{ labels.pendingApproval }}</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ labels.subject }}</th>
              <th>{{ labels.date }}</th>
              <th>{{ labels.period }}</th>
              <th>{{ labels.reason }}</th>
              <th>{{ labels.status }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="empty-text">{{ labels.loading }}</td>
            </tr>
            <tr v-else-if="academicStore.pendingExcuseRequests.length === 0">
              <td colspan="5" class="empty-text">{{ labels.emptyPending }}</td>
            </tr>
            <tr v-for="request in academicStore.pendingExcuseRequests" :key="request.id">
              <td class="course-name">{{ request.studentName }} - {{ request.courseName }}</td>
              <td>{{ request.lectureDate }}</td>
              <td>{{ request.period }}</td>
              <td>{{ request.reason }}</td>
              <td>
                <div class="button-group">
                  <button type="button" class="btn-approve" @click="decideExcuse(request.id, 'APPROVED')">
                    {{ labels.approve }}
                  </button>
                  <button type="button" class="btn-reject" @click="decideExcuse(request.id, 'REJECTED')">
                    {{ labels.reject }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </div>
</template>

<style scoped>
.attendance-container {
  width: 100%;
  margin: 0;
  padding-bottom: 50px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  color: #071f49;
  font-size: 1.5rem;
  font-weight: 800;
}

.search-section,
.panel {
  background: #fff;
  border: 1px solid #edf2f7;
  border-radius: 6px;
}

.search-section {
  padding: 24px 20px;
  margin-bottom: 24px;
}

.search-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.search-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-group label,
.term-info .label {
  color: #24324a;
  font-size: 0.85rem;
  font-weight: 700;
}

.search-group input,
.search-group select {
  width: 100%;
  height: 38px;
  border: 1px solid #d8dde6;
  border-radius: 4px;
  padding: 8px 12px;
  background: #fff;
  color: #111827;
  font-size: 0.9rem;
}

.search-group input:focus,
.search-group select:focus {
  border-color: #3267e3;
  outline: none;
}

.search-group select:disabled {
  background: #f8f9fa;
  color: #8a94a6;
  cursor: not-allowed;
}

.wide {
  flex: 0 0 260px;
}

.compact {
  flex: 0 0 120px;
}

.small {
  flex: 0 0 86px;
}

.term-info {
  display: flex;
  min-width: 110px;
  flex-direction: column;
  gap: 6px;
}

.term-info .value {
  color: #0b3d91;
  font-size: 1rem;
  font-weight: 800;
  line-height: 38px;
  white-space: nowrap;
}

.btn-primary {
  min-width: 78px;
  height: 38px;
  border: 0;
  border-radius: 4px;
  padding: 8px 24px;
  background: #3267e3;
  color: #fff;
  cursor: pointer;
  font-weight: 800;
}

.btn-primary:hover {
  background: #2454bf;
}

.rate-text.danger {
  color: #dc2626;
}

.panel {
  margin-bottom: 24px;
  overflow: hidden;
}

.panel-title {
  padding: 16px 20px;
  border-bottom: 1px solid #edf2f7;
}

.panel-title h3 {
  color: #1a1f36;
  font-size: 1rem;
  font-weight: 800;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background: #f8f9fa;
  border-bottom: 2px solid #edf2f7;
  color: #4f566b;
  font-size: 0.85rem;
  font-weight: 800;
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

.col-subject {
  width: 42%;
}

.course-name {
  color: #071f49;
  font-weight: 800;
}

.rate-text {
  color: #0b3d91;
  font-weight: 800;
}

.status-badge {
  display: inline;
  min-width: 0;
  padding: 0;
  background: transparent;
  color: #137333;
  font-size: 0.8rem;
  font-weight: 800;
}

.status-badge.danger,
.status-badge.absent,
.status-badge.rejected {
  background: transparent;
  color: #c5221f;
}

.status-badge.pending,
.status-badge.late,
.status-badge.tardy {
  background: transparent;
  color: #b06000;
}

.status-badge.excused,
.status-badge.approved {
  background: transparent;
  color: #1a73e8;
}

.table-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
}

.table-grid.single {
  grid-template-columns: minmax(0, 1fr);
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

.btn-approve,
.btn-reject {
  height: 32px;
  border: 0;
  border-radius: 4px;
  padding: 6px 12px;
  color: #fff;
  cursor: pointer;
  font-weight: 700;
}

.btn-approve {
  background: #34a853;
}

.btn-reject {
  background: #dc3545;
}

@media (max-width: 1000px) {
  .table-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .search-row {
    align-items: stretch;
    flex-direction: column;
  }

  .wide,
  .compact,
  .small,
  .term-info,
  .btn-primary {
    width: 100%;
  }
}
</style>
