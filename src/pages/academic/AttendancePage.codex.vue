<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import myAxios from "../../api/myAxios";
import { useAcademicStore } from "../../store/academic/useAcademicStore";
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
  attachment: "\uCCA8\uBD80\uD30C\uC77C",
  select: "\uC120\uD0DD",
  selectDateFirst: "\uB0A0\uC9DC\uB97C \uBA3C\uC800 \uC120\uD0DD",
  noClassOnDate: "\uD574\uB2F9 \uB0A0\uC9DC\uC758 \uC218\uC5C5\uC774 \uC5C6\uC2B5\uB2C8\uB2E4",
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
const searchParams = reactive({
  keyword: "",
  year: 2026,
  semester: 1,
});
const excuseForm = reactive({
  enrollmentId: "",
  lectureDate: "",
  period: 1,
  reason: "",
  attachmentName: "",
});

const isStudent = computed(() => authStore.userInfo?.role === "STUDENT");
const isProfessor = computed(() => authStore.userInfo?.role === "PROFESSOR");

const targetTermText = computed(() => {
  return `${searchParams.year}${labels.yearSuffix} ${searchParams.semester}${labels.semester}`;
});

const normalizedKeyword = computed(() => searchParams.keyword.trim().toLowerCase());
const dayNames = ["\uC77C\uC694\uC77C", "\uC6D4\uC694\uC77C", "\uD654\uC694\uC77C", "\uC218\uC694\uC77C", "\uBAA9\uC694\uC77C", "\uAE08\uC694\uC77C", "\uD1A0\uC694\uC77C"];
const shortDayNames = ["\uC77C", "\uC6D4", "\uD654", "\uC218", "\uBAA9", "\uAE08", "\uD1A0"];

const filteredRates = computed(() => {
  if (!normalizedKeyword.value) return academicStore.attendanceRates;
  return academicStore.attendanceRates.filter((item) => item.courseName?.toLowerCase().includes(normalizedKeyword.value));
});

const filteredAttendance = computed(() => {
  if (!normalizedKeyword.value) return academicStore.attendanceList;
  return academicStore.attendanceList.filter((item) => item.courseName?.toLowerCase().includes(normalizedKeyword.value));
});

const filteredExcuseRequests = computed(() => {
  if (!normalizedKeyword.value) return academicStore.myExcuseRequests;
  return academicStore.myExcuseRequests.filter((item) => item.courseName?.toLowerCase().includes(normalizedKeyword.value));
});

const selectedDate = computed(() => {
  if (!excuseForm.lectureDate) return null;
  return new Date(`${excuseForm.lectureDate}T00:00:00`);
});

const selectedDayIndex = computed(() => {
  return selectedDate.value ? selectedDate.value.getDay() : null;
});

const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return "\uB0A0\uC9DC \uC120\uD0DD";

  const year = selectedDate.value.getFullYear();
  const month = String(selectedDate.value.getMonth() + 1).padStart(2, "0");
  const date = String(selectedDate.value.getDate()).padStart(2, "0");
  return `${year}.${month}.${date} ${shortDayNames[selectedDayIndex.value]}`;
});

const scheduleMatchesSelectedDate = (schedule) => {
  if (selectedDayIndex.value === null || !schedule) return false;

  const dayName = dayNames[selectedDayIndex.value];
  const shortDayName = shortDayNames[selectedDayIndex.value];
  const englishDayMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const englishDayName = englishDayMap[selectedDayIndex.value];

  return schedule
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .some((item) => item.includes(dayName) || item.includes(`${shortDayName}\uC694\uC77C`) || item.startsWith(shortDayName) || item.includes(englishDayName));
};

const hasAttendanceOnSelectedDate = (courseName) => {
  if (!excuseForm.lectureDate || !courseName) return false;

  return academicStore.attendanceList.some((attendance) => {
    return attendance.lectureDate === excuseForm.lectureDate && attendance.courseName === courseName;
  });
};

const getScheduleStartPeriod = (schedule) => {
  if (!scheduleMatchesSelectedDate(schedule)) return 1;

  const part = schedule.split(",").find((item) => scheduleMatchesSelectedDate(item));
  const match = part?.match(/(\d{2}):\d{2}/);
  if (!match) return 1;

  return Math.max(1, Number(match[1]) - 8);
};

const excuseCourseOptions = computed(() => {
  if (!excuseForm.lectureDate) return [];

  return enrollments.value
    .filter((enrollment) => {
      return scheduleMatchesSelectedDate(enrollment.schedule) || hasAttendanceOnSelectedDate(enrollment.courseName);
    })
    .map((enrollment) => {
    const id = enrollment.enrollmentId || enrollment.id;
      return id && enrollment.courseName ? { id, courseName: enrollment.courseName } : null;
    })
    .filter(Boolean);
});

const averageRate = computed(() => {
  const rates = academicStore.attendanceRates
    .map((item) => Number(item.attendanceRate))
    .filter((rate) => !Number.isNaN(rate));

  if (rates.length === 0) return "-";

  const sum = rates.reduce((acc, rate) => acc + rate, 0);
  return `${(sum / rates.length).toFixed(1)}%`;
});

const failTargetCount = computed(() => academicStore.attendanceRates.filter((item) => item.failTarget).length);
const pendingExcuseCount = computed(() => academicStore.myExcuseRequests.filter((item) => item.status === "PENDING").length);

const formatRate = (rate) => {
  if (rate === null || rate === undefined) return "-";
  return `${Number(rate).toFixed(1)}%`;
};

const loadEnrollments = async () => {
  const res = await myAxios.get("/api/enrollments/my", {
    params: {
      year: searchParams.year,
      semester: searchParams.semester,
    },
  });
  enrollments.value = res.data.data?.enrollments || [];
};

const loadStudentData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      academicStore.fetchAttendance(),
      academicStore.fetchAttendanceRates(),
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

  const reason = excuseForm.attachmentName
    ? `${excuseForm.reason.trim()} [\uCCA8\uBD80\uD30C\uC77C: ${excuseForm.attachmentName}]`
    : excuseForm.reason.trim();

  await academicStore.requestExcuse({
    enrollmentId: Number(excuseForm.enrollmentId),
    lectureDate: excuseForm.lectureDate,
    period: Number(excuseForm.period),
    reason,
  });

  excuseForm.lectureDate = "";
  excuseForm.period = 1;
  excuseForm.reason = "";
  excuseForm.attachmentName = "";
  alert("\uACF5\uACB0 \uC2E0\uCCAD\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
};

const selectAttachment = (event) => {
  const file = event.target.files?.[0];
  excuseForm.attachmentName = file?.name || "";
};

watch(
  () => excuseForm.lectureDate,
  () => {
    excuseForm.enrollmentId = "";
  }
);

watch(
  () => excuseForm.enrollmentId,
  () => {
    const selectedEnrollment = enrollments.value.find((enrollment) => {
      return String(enrollment.enrollmentId || enrollment.id) === String(excuseForm.enrollmentId);
    });

    excuseForm.period = getScheduleStartPeriod(selectedEnrollment?.schedule);
  }
);

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

      <section class="summary-section">
        <div class="summary-item">
          <span>{{ labels.averageRate }}</span>
          <strong>{{ averageRate }}</strong>
        </div>
        <div class="summary-item">
          <span>{{ labels.failRisk }}</span>
          <strong :class="{ danger: failTargetCount > 0 }">{{ failTargetCount }}</strong>
        </div>
        <div class="summary-item">
          <span>{{ labels.pendingExcuse }}</span>
          <strong>{{ pendingExcuseCount }}</strong>
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

      <section class="panel">
        <div class="panel-title">
          <h3>{{ labels.excuseTitle }}</h3>
        </div>
        <form class="excuse-form" @submit.prevent="submitExcuse">
          <div class="search-group date-chip-field">
            <label>{{ labels.date }}</label>
            <div class="date-chip-wrap">
              <span class="date-chip-text">{{ selectedDateLabel }}</span>
              <input v-model="excuseForm.lectureDate" type="date" aria-label="날짜 선택" />
            </div>
          </div>
          <div class="search-group subject-field">
            <label>{{ labels.subject }}</label>
            <select v-model="excuseForm.enrollmentId" :disabled="!excuseForm.lectureDate">
              <option value="">
                {{ !excuseForm.lectureDate ? labels.selectDateFirst : (excuseCourseOptions.length === 0 ? labels.noClassOnDate : labels.select) }}
              </option>
              <option
                v-for="course in excuseCourseOptions"
                :key="course.id"
                :value="course.id"
              >
                {{ course.courseName }}
              </option>
            </select>
          </div>
          <div class="search-group reason-field">
            <label>{{ labels.reason }}</label>
            <input v-model="excuseForm.reason" maxlength="500" type="text" placeholder="사유 입력" />
          </div>
          <div class="search-group attachment-field">
            <label>{{ labels.attachment }}</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.hwp,.hwpx" @change="selectAttachment" />
          </div>
          <button class="btn-primary" type="submit">{{ labels.apply }}</button>
        </form>
      </section>

      <div class="table-grid">
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

        <section class="panel">
          <div class="panel-title">
            <h3>{{ labels.resultTitle }}</h3>
          </div>
          <table class="data-table compact-table">
            <thead>
              <tr>
                <th>{{ labels.subject }}</th>
                <th>{{ labels.date }}</th>
                <th>{{ labels.status }}</th>
                <th>{{ labels.reason }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredExcuseRequests.length === 0">
                <td colspan="4" class="empty-text">{{ labels.emptyExcuse }}</td>
              </tr>
              <tr v-for="request in filteredExcuseRequests" :key="request.id">
                <td class="course-name">{{ request.courseName }}</td>
                <td>{{ request.lectureDate }}</td>
                <td>
                  <span :class="['status-badge', request.status?.toLowerCase()]">
                    {{ statusLabel[request.status] || request.status }}
                  </span>
                </td>
                <td>{{ request.rejectReason || request.reason }}</td>
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
.summary-section,
.panel {
  background: #fff;
  border: 1px solid #edf2f7;
  border-radius: 6px;
}

.search-section {
  padding: 24px 20px;
  margin-bottom: 24px;
}

.search-row,
.excuse-form {
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

.summary-section {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 24px;
  overflow: hidden;
}

.summary-item {
  display: flex;
  min-height: 74px;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-right: 1px solid #edf2f7;
}

.summary-item:last-child {
  border-right: 0;
}

.summary-item span {
  color: #4f566b;
  font-size: 0.9rem;
  font-weight: 700;
}

.summary-item strong {
  color: #071f49;
  font-size: 1.5rem;
  font-weight: 800;
}

.summary-item strong.danger,
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

.excuse-form {
  padding: 20px;
}

.date-chip-field {
  flex: 0 0 170px;
}

.date-chip-wrap {
  position: relative;
  height: 38px;
}

.date-chip-text {
  display: inline-flex;
  width: 100%;
  height: 38px;
  align-items: center;
  justify-content: center;
  border: 1px solid #d8dde6;
  border-radius: 999px;
  background: #f8fbff;
  color: #0b3d91;
  font-size: 0.9rem;
  font-weight: 800;
}

.date-chip-wrap input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 38px;
  opacity: 0;
  cursor: pointer;
}

.subject-field {
  flex: 1.2 1 240px;
}

.reason-field {
  flex: 1.4 1 240px;
}

.attachment-field {
  flex: 1.1 1 220px;
}

.attachment-field input {
  padding: 7px 10px;
}

.table-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
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
  .summary-section,
  .table-grid {
    grid-template-columns: 1fr;
  }

  .summary-item {
    border-right: 0;
    border-bottom: 1px solid #edf2f7;
  }

  .summary-item:last-child {
    border-bottom: 0;
  }
}

@media (max-width: 760px) {
  .search-row,
  .excuse-form {
    align-items: stretch;
    flex-direction: column;
  }

  .wide,
  .compact,
  .small,
  .date-chip-field,
  .subject-field,
  .reason-field,
  .attachment-field,
  .term-info,
  .btn-primary {
    width: 100%;
  }
}
</style>
