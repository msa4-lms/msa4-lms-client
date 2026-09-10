<script setup>
import { ref, onMounted, computed } from "vue";
import { useEnrollmentStore } from "../../store/enrollment/useEnrollmentStore";
import { useLectureStore } from "../../store/lecture/useLectureStore";
import { useAuthStore } from "../../store/auth/useAuthStore";
import { getCurrentSemester } from "../../constants/semester";
import MyTable from "../../components/table/MyTable.vue";
import MyPageContainer from "../../components/layout/MyPageContainer.vue";
import ScheduleViewer from "../../components/formatters/ScheduleViewer.vue";
import MySearchFilter from "../../components/search/MySearchFilter.vue";
import MyButton from "../../components/button/MyButton.vue";
import { useRouter } from "vue-router";

const enrollmentStore = useEnrollmentStore();
const lectureStore = useLectureStore();
const router = useRouter();

const now = new Date();
const currentYear = now.getFullYear();
const currentSemester = getCurrentSemester(now);

const authStore = useAuthStore();
const yearOptions = computed(() => {
  const cy = now.getFullYear();
  const endYear = authStore.userInfo?.endYear || cy;
  const startYear = authStore.userInfo?.startYear
    ? authStore.userInfo.startYear
    : endYear - 3;
  const years = [];
  for (let y = endYear; y >= startYear; y--) {
    years.push(y);
  }
  return years;
});

const searchParams = ref({
  year: yearOptions.value[0],
  semester: currentSemester,
});

const isProfessor = computed(() => authStore.userInfo?.role === "PROFESSOR");
const pageTitle = computed(() => (isProfessor.value ? "나의 강의 조회" : "강의 조회"));
const pageSubtitle = computed(() =>
  isProfessor.value
    ? "담당 강의를 학기별로 확인합니다."
    : "현재 백엔드에서 조회 가능한 본인 수강 강의를 학기별로 확인합니다."
);
const loading = computed(() =>
  isProfessor.value ? lectureStore.loading : enrollmentStore.loading
);
const displayedLectures = computed(() =>
  isProfessor.value ? lectureStore.lectures : enrollmentStore.myEnrollments
);

const onSearch = () => {
  if (isProfessor.value) {
    lectureStore.fetchMyLectures(searchParams.value);
    return;
  }
  enrollmentStore.fetchMyEnrollments(searchParams.value.year, searchParams.value.semester);
};

const lectureColumns = [
  { key: "courseCode", label: "과목코드" },
  { key: "departmentName", label: "학과" },
  { key: "courseName", label: "강의명" },
  { key: "credits", label: "학점" },
  { key: "targetGrade", label: "대상학년" },
  { key: "professorName", label: "담당교수" },
  { key: "classroom", label: "강의실", class: "col-classroom" },
  { key: "schedule", label: "시간", class: "col-time" },
  { key: "capacity", label: "정원", class: "col-capacity" },
  { key: "detail", label: "상세" },
];

onMounted(() => {
  onSearch();
});
</script>

<template>
  <MyPageContainer
    :title="pageTitle"
    :subtitle="pageSubtitle"
  >

    <MySearchFilter @search="onSearch">
        <div class="search-group">
          <label>연도</label>
          <select v-model="searchParams.year">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}년</option>
          </select>
        </div>

        <div class="search-group">
          <label>학기</label>
          <select v-model="searchParams.semester">
            <option :value="1">1학기</option>
            <option :value="2">2학기</option>
          </select>
        </div>
    </MySearchFilter>

    <MyTable
      :columns="lectureColumns"
      :loading="loading"
      :empty="displayedLectures.length === 0"
      emptyMessage="조회된 강의가 없습니다."
    >
      <tr v-for="lecture in displayedLectures" :key="lecture.enrollmentId || lecture.id">
        <td>{{ lecture.courseCode }}</td>
        <td>{{ lecture.departmentName }}</td>
        <td class="course-name">{{ lecture.courseName }}</td>
        <td>{{ lecture.credits }}</td>
        <td>{{ lecture.targetGrade }}학년</td>
        <td>{{ lecture.professorName }}</td>
        <td class="classroom-text">{{ lecture.classroom }}</td>
        <td>
          <ScheduleViewer :schedule="lecture.schedule" />
        </td>
        <td>{{ lecture.capacity }}명</td>
        <td>
          <MyButton
            v-if="!isProfessor"
            btnType="button"
            color="deep-blue"
            size="small"
            content="상세"
            @click="router.push({ path: '/evaluations', query: { enrollmentId: lecture.enrollmentId } })"
          />
          <span v-else>-</span>
        </td>
      </tr>
    </MyTable>
  </MyPageContainer>
</template>

<style scoped>

.col-classroom {
  width: 15%;
}

.col-time {
  width: 22%;
}

.col-capacity {
  width: 80px;
}

.classroom-text {
  font-size: 0.85rem;
}

.time-text {
  color: var(--primary-text-color);
  font-size: 0.85rem;
  line-height: 1.5;
}

</style>
