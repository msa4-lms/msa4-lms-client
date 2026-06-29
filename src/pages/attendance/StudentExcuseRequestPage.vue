<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import myAxios from "../../api/myAxios";
import { useAttendanceStore } from "../../store/attendance/useAttendanceStore";
import { useAuthStore } from "../../store/auth/useAuthStore";
import MyButton from "../../components/button/MyButton.vue";
import MyPageContainer from "../../components/layout/MyPageContainer.vue";
import MyTable from "../../components/table/MyTable.vue";
import StatusBadge from "../../components/common/StatusBadge.vue";
import MyInput from "../../components/input/MyInput.vue";

const academicStore = useAttendanceStore();
const authStore = useAuthStore();

const labels = {
  pageTitle: "공결 신청",
  resultTitle: "공결 신청 내역",
  subject: "과목",
  date: "날짜",
  reason: "사유",
  attachment: "첨부파일",
  select: "선택",
  selectDateFirst: "날짜를 먼저 선택",
  noClassOnDate: "해당 날짜의 수업이 없습니다",
  apply: "신청",
  status: "상태",
  emptyExcuse: "공결 신청 내역이 없습니다.",
  loading: "데이터를 불러오는 중입니다.",
};

const myExcuseColumns = [
  { key: "subject", label: "과목" },
  { key: "date", label: "날짜" },
  { key: "status", label: "상태" },
  { key: "reason", label: "사유" },
  { key: "attachment", label: "첨부파일" },
];

const pendingExcuseColumns = [
  { key: "subject", label: "과목" },
  { key: "date", label: "날짜" },
  { key: "period", label: "교시" },
  { key: "reason", label: "사유" },
  { key: "status", label: "상태" },
];

const dayNames = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
];
const shortDayNames = ["일", "월", "화", "수", "목", "금", "토"];

const enrollments = ref([]);
const loading = ref(false);
const attachmentInput = ref(null);
const searchParams = reactive({ year: 2026, semester: 1 });
const excuseForm = reactive({
  enrollmentId: "",
  lectureDate: "",
  period: 1,
  reason: "",
  attachmentName: "",
  attachmentFile: null,
});

const isStudent = computed(() => authStore.userInfo?.role === "STUDENT");

const extractAttachmentName = (reason = "") => {
  const match = reason.match(/\[첨부파일:\s*(.+?)\]$/);
  return match?.[1] || "";
};

const cleanReason = (reason = "") => {
  return reason.replace(/\s*\[첨부파일:\s*.+?\]$/, "").trim();
};

const attachmentName = (request) => {
  return request.attachmentOriginalName || extractAttachmentName(request.reason);
};

const openAttachment = async (request) => {
  if (!request.attachmentOriginalName) return;

  const contentType = request.attachmentContentType || "";
  const canPreview =
    contentType === "application/pdf" || contentType.startsWith("image/");
  const previewWindow = canPreview ? window.open("", "_blank") : null;

  try {
    const response = await myAxios.get(
      `/api/student/attendances/excuses/${request.id}/attachment`,
      { responseType: "blob" }
    );
    const blobUrl = URL.createObjectURL(response.data);

    if (canPreview) {
      if (previewWindow) {
        previewWindow.opener = null;
        previewWindow.location.href = blobUrl;
      } else {
        window.open(blobUrl, "_blank", "noopener,noreferrer");
      }
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      return;
    }

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = request.attachmentOriginalName;
    link.click();
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    if (previewWindow) previewWindow.close();
    console.error("첨부파일 열기 실패:", error);
  }
};

const selectedDate = computed(() => {
  if (!excuseForm.lectureDate) return null;
  return new Date(`${excuseForm.lectureDate}T00:00:00`);
});

const selectedDayIndex = computed(() =>
  selectedDate.value ? selectedDate.value.getDay() : null
);

const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return "날짜 선택";

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
    .some(
      (item) =>
        item.includes(dayName) ||
        item.includes(`${shortDayName}요일`) ||
        item.startsWith(shortDayName) ||
        item.includes(englishDayName)
    );
};

const hasAttendanceOnSelectedDate = (courseName) => {
  if (!excuseForm.lectureDate || !courseName) return false;

  return academicStore.attendanceList.some((attendance) => {
    return (
      attendance.lectureDate === excuseForm.lectureDate &&
      attendance.courseName === courseName
    );
  });
};

const getScheduleStartPeriod = (schedule) => {
  if (!scheduleMatchesSelectedDate(schedule)) return 1;

  const part = schedule
    .split(",")
    .find((item) => scheduleMatchesSelectedDate(item));
  const match = part?.match(/(\d{2}):\d{2}/);
  if (!match) return 1;

  return Math.max(1, Number(match[1]) - 8);
};

const hasExistingExcuseRequest = (enrollment, period) => {
  const enrollmentId = enrollment.enrollmentId || enrollment.id;

  return academicStore.myExcuseRequests.some(
    (request) =>
      String(request.enrollmentId) === String(enrollmentId) &&
      request.lectureDate === excuseForm.lectureDate &&
      Number(request.period) === Number(period)
  );
};

const excuseCourseOptions = computed(() => {
  if (!excuseForm.lectureDate) return [];

  return enrollments.value
    .filter(
      (enrollment) =>
        scheduleMatchesSelectedDate(enrollment.schedule) ||
        hasAttendanceOnSelectedDate(enrollment.courseName)
    )
    .map((enrollment) => {
      const id = enrollment.enrollmentId || enrollment.id;
      const period = getScheduleStartPeriod(enrollment.schedule);

      if (hasExistingExcuseRequest(enrollment, period)) return null;

      return id && enrollment.courseName
        ? { id, courseName: enrollment.courseName, period }
        : null;
    })
    .filter(Boolean);
});

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

const loadPageData = async () => {
  loading.value = true;
  try {
    if (isStudent.value) {
      await Promise.allSettled([
        academicStore.fetchAttendance(),
        academicStore.fetchMyExcuseRequests(),
        loadEnrollments(),
      ]);
    }
  } finally {
    loading.value = false;
  }
};

const decideExcuse = async (requestId, status) => {
  const rejectReason =
    status === "REJECTED" ? prompt("반려 사유를 입력해주세요.") : "";
  if (status === "REJECTED" && !rejectReason) return;
  await academicStore.decideExcuseRequest(requestId, { status, rejectReason });
};

const submitExcuse = async () => {
  if (
    !excuseForm.enrollmentId ||
    !excuseForm.lectureDate ||
    !excuseForm.reason.trim()
  ) {
    alert("과목, 날짜, 사유를 입력해주세요.");
    return;
  }

  const formData = new FormData();
  formData.append("enrollmentId", excuseForm.enrollmentId);
  formData.append("lectureDate", excuseForm.lectureDate);
  formData.append("period", excuseForm.period);
  formData.append("reason", excuseForm.reason.trim());
  if (excuseForm.attachmentFile) {
    formData.append("attachment", excuseForm.attachmentFile);
  }

  try {
    await academicStore.requestExcuse(formData);

    excuseForm.lectureDate = "";
    excuseForm.period = 1;
    excuseForm.reason = "";
    excuseForm.attachmentName = "";
    excuseForm.attachmentFile = null;
    if (attachmentInput.value) attachmentInput.value.value = "";
    alert("공결 신청이 완료되었습니다.");
  } catch (error) {
    console.error("공결 신청 실패:", error);
  }
};

const selectAttachment = (event) => {
  const file = event.target.files?.[0];
  excuseForm.attachmentName = file?.name || "";
  excuseForm.attachmentFile = file || null;
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
      return (
        String(enrollment.enrollmentId || enrollment.id) ===
        String(excuseForm.enrollmentId)
      );
    });

    excuseForm.period = getScheduleStartPeriod(selectedEnrollment?.schedule);
  }
);

onMounted(async () => {
  if (!authStore.isLoggedIn) return;
  await loadPageData();
});
</script>

<template>
  <MyPageContainer :title="labels.pageTitle">
    <template v-if="isStudent">
      <section class="panel-top">
        <form class="excuse-form" @submit.prevent="submitExcuse">
          <div class="search-group date-chip-field">
            <label>{{ labels.date }}</label>
            <div class="date-chip-wrap">
              <span class="date-chip-text">{{ selectedDateLabel }}</span>
              <MyInput
                v-model="excuseForm.lectureDate"
                type="date"
                aria-label="날짜 선택"
              />
            </div>
          </div>
          <div class="search-group subject-field">
            <label>{{ labels.subject }}</label>
            <select
              v-model="excuseForm.enrollmentId"
              :disabled="!excuseForm.lectureDate"
            >
              <option value="">
                {{
                  !excuseForm.lectureDate
                    ? labels.selectDateFirst
                    : excuseCourseOptions.length === 0
                    ? labels.noClassOnDate
                    : labels.select
                }}
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
            <MyInput
              v-model="excuseForm.reason"
              maxlength="500"
              type="text"
              placeholder="사유 입력"
            />
          </div>
          <div class="search-group attachment-field">
            <label>{{ labels.attachment }}</label>
            <MyInput
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.hwp,.hwpx"
              @change="selectAttachment"
            />
          </div>
          <div class="search-group button-field">
            <label>&nbsp;</label>
            <MyButton
              btnType="submit"
              color="deep-blue"
              size="small"
              :content="labels.apply"
            />
          </div>
        </form>
      </section>

      <section class="panel">
        <div class="common-section-header">
          <h3>{{ labels.resultTitle }}</h3>
        </div>
        <MyTable
          :columns="myExcuseColumns"
          :loading="loading"
          :empty="academicStore.myExcuseRequests.length === 0"
          :emptyMessage="labels.emptyExcuse"
        >
          <tr
            v-for="request in academicStore.myExcuseRequests"
            :key="request.id"
          >
            <td class="course-name">{{ request.courseName }}</td>
            <td>{{ request.lectureDate }}</td>
            <td class="student-status-cell">
              <StatusBadge :status="request.status" />
            </td>
            <td class="reason-cell">
              {{ request.rejectReason || cleanReason(request.reason) }}
            </td>
            <td class="attachment-cell">
              <button
                v-if="request.attachmentOriginalName"
                class="attachment-button"
                type="button"
                @click="openAttachment(request)"
              >
                {{ attachmentName(request) }}
              </button>
              <span v-else-if="attachmentName(request)" class="attachment-name">
                {{ attachmentName(request) }}
              </span>
              <span v-else class="empty-value">없음</span>
            </td>
          </tr>
        </MyTable>
      </section>
    </template>

    <template v-else-if="isProfessor">
      <section class="panel">
        <div class="common-section-header">
          <h3>공결 확인 대기</h3>
        </div>
        <MyTable
          :columns="pendingExcuseColumns"
          :loading="loading"
          :empty="academicStore.pendingExcuseRequests.length === 0"
          emptyMessage="승인 대기 중인 공결 신청이 없습니다."
        >
          <tr
            v-for="request in academicStore.pendingExcuseRequests"
            :key="request.id"
          >
            <td class="course-name">
              {{ request.studentName }} · {{ request.courseName }}
            </td>
            <td>{{ request.lectureDate }}</td>
            <td>{{ request.period }}</td>
            <td>{{ request.reason }}</td>
            <td>
              <div class="button-group">
                <MyButton
                  btnType="button"
                  color="green"
                  size="small"
                  content="승인"
                  @click="decideExcuse(request.id, 'APPROVED')"
                />
                <MyButton
                  btnType="button"
                  color="red"
                  size="small"
                  content="반려"
                  @click="decideExcuse(request.id, 'REJECTED')"
                />
              </div>
            </td>
          </tr>
        </MyTable>
      </section>
    </template>
  </MyPageContainer>
</template>

<style scoped>
.panel-top {
  margin-bottom: 20px;
  overflow: hidden;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
}



.excuse-form {
  display: grid;
  grid-template-columns:
    190px minmax(240px, 1fr) minmax(260px, 1.4fr) minmax(220px, 1fr)
    auto;
  align-items: flex-end;
  gap: 15px;
  padding: 15px;
}

.search-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.search-group label {
  color: #666;
  font-size: 0.8rem;
  font-weight: 600;
}

.search-group input,
.search-group select {
  width: 100%;
  height: 37px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  background: #fff;
  color: #111827;
  font-size: 0.9rem;
}

.search-group select:disabled {
  background: #f8f9fa;
  color: #8a94a6;
  cursor: not-allowed;
}

.search-group input[type="file"] {
  padding: 3px 8px;
  color: #64748b;
  font-size: 0.85rem;
  cursor: pointer;
}

.search-group input[type="file"]::file-selector-button {
  height: 29px;
  margin-right: 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: #f3f4f6;
  color: #374151;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-group input[type="file"]::file-selector-button:hover {
  background-color: #e5e7eb;
}

.date-chip-field {
  min-width: 0;
}

.date-chip-wrap {
  display: grid;
  grid-template-columns: 1fr 44px;
  align-items: center;
  min-width: 190px;
  height: 37px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}

.date-chip-text {
  padding: 0 8px;
  color: #111827;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

.date-chip-wrap input[type="date"] {
  justify-self: center;
  width: 24px;
  height: 37px;
  border: 0;
  padding: 0;
  background: transparent;
  color: transparent;
  cursor: pointer;
  font-size: 1.05rem;
}

.date-chip-wrap input[type="date"]::-webkit-datetime-edit,
.date-chip-wrap input[type="date"]::-webkit-datetime-edit-fields-wrapper,
.date-chip-wrap input[type="date"]::-webkit-datetime-edit-text,
.date-chip-wrap input[type="date"]::-webkit-datetime-edit-year-field,
.date-chip-wrap input[type="date"]::-webkit-datetime-edit-month-field,
.date-chip-wrap input[type="date"]::-webkit-datetime-edit-day-field {
  color: transparent;
}

.date-chip-wrap input[type="date"]::-webkit-calendar-picker-indicator {
  width: 22px;
  height: 22px;
  margin: 0;
  padding: 0;
  cursor: pointer;
}

.button-group {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.reason-cell {
  min-width: 180px;
  overflow-wrap: anywhere;
  white-space: normal;
}

.attachment-cell {
  min-width: 150px;
  max-width: 240px;
  overflow-wrap: anywhere;
  white-space: normal;
}

.attachment-button {
  border: 0;
  padding: 0;
  background: transparent;
  color: #0b3d91;
  cursor: pointer;
  font: inherit;
  text-align: left;
  text-decoration: underline;
}

.attachment-name {
  color: #475569;
}

.empty-value {
  color: #94a3b8;
}

.student-status-cell :deep(.status-badge) {
  padding: 0;
  background-color: transparent;
  border-radius: 0;
}

@media (max-width: 1100px) {
  .excuse-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .excuse-form {
    align-items: stretch;
    grid-template-columns: 1fr;
  }

  .date-chip-field,
  .subject-field,
  .reason-field,
  .attachment-field,
  .button-field {
    width: 100%;
    flex-basis: auto;
  }
}
</style>
