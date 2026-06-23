<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import myAxios from "../../api/myAxios";
import { useAcademicStore } from "../../store/academic/useAcademicStore";
import { useAuthStore } from "../../store/auth/useAuthStore";
import MyPageContainer from "../../components/layout/MyPageContainer.vue";
import MyButton from "../../components/button/MyButton.vue";
import MySearchFilter from "../../components/search/MySearchFilter.vue";
import MyTable from "../../components/table/MyTable.vue";
import StatusBadge from "../../components/common/StatusBadge.vue";

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

const rateColumns = [
  { key: "subject", label: "과목", class: "col-subject" },
  { key: "accepted", label: "인정 출석" },
  { key: "total", label: "전체 수업" },
  { key: "rate", label: "출석률" },
  { key: "status", label: "상태" },
];

const attendanceColumns = [
  { key: "subject", label: "과목" },
  { key: "date", label: "날짜" },
  { key: "period", label: "교시" },
  { key: "status", label: "상태" },
];

const pendingColumns = [
  { key: "subject", label: "과목" },
  { key: "date", label: "날짜" },
  { key: "period", label: "교시" },
  { key: "reason", label: "사유" },
  { key: "status", label: "상태" },
];

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
  <MyPageContainer :title="isProfessor ? labels.pageProfessor : labels.pageStudent">
    <template v-if="isStudent">
      <MySearchFilter @search="onSearch" :submitText="labels.search">
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
      </MySearchFilter>

      <section class="panel">
        <div class="panel-title">
          <h3>{{ labels.rateTitle }}</h3>
        </div>
        <MyTable
          :columns="rateColumns"
          :loading="loading"
          :empty="filteredRates.length === 0"
          :emptyMessage="labels.emptyRate"
        >
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
              <StatusBadge :status="isWarningRate(rate) ? 'ABSENT' : 'PRESENT'" />
            </td>
          </tr>
        </MyTable>
      </section>

      <div class="table-grid single">
        <section class="panel">
          <div class="panel-title">
            <h3>{{ labels.recentTitle }}</h3>
          </div>
          <MyTable
            :columns="attendanceColumns"
            :loading="loading"
            :empty="filteredAttendance.length === 0"
            :emptyMessage="labels.emptyAttendance"
          >
            <tr
              v-for="att in filteredAttendance"
              :key="`${att.courseName}-${att.lectureDate}-${att.period}`"
            >
              <td class="course-name">{{ att.courseName }}</td>
              <td>{{ att.lectureDate }}</td>
              <td>{{ att.period }}</td>
              <td>
                <StatusBadge :status="att.status" />
              </td>
            </tr>
          </MyTable>
        </section>

      </div>
    </template>

    <template v-else-if="isProfessor">
      <section class="panel">
        <div class="panel-title">
          <h3>{{ labels.pendingApproval }}</h3>
        </div>
        <MyTable
          :columns="pendingColumns"
          :loading="loading"
          :empty="academicStore.pendingExcuseRequests.length === 0"
          :emptyMessage="labels.emptyPending"
        >
          <tr v-for="request in academicStore.pendingExcuseRequests" :key="request.id">
            <td class="course-name">{{ request.studentName }} - {{ request.courseName }}</td>
            <td>{{ request.lectureDate }}</td>
            <td>{{ request.period }}</td>
            <td>{{ request.reason }}</td>
            <td>
              <div class="button-group">
                <MyButton btnType="button" color="green" size="small" :content="labels.approve" @click="decideExcuse(request.id, 'APPROVED')" />
                <MyButton btnType="button" color="red" size="small" :content="labels.reject" @click="decideExcuse(request.id, 'REJECTED')" />
              </div>
            </td>
          </tr>
        </MyTable>
      </section>
    </template>
  </MyPageContainer>
</template>

<style scoped>
.panel {
  background: #fff;
  border: 1px solid #edf2f7;
  border-radius: 6px;
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
  font-weight: 600;
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

@media (max-width: 1000px) {
  .table-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .wide,
  .compact,
  .small,
  .term-info {
    width: 100%;
  }
}
</style>
