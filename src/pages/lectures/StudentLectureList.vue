<script setup>
import { ref, onMounted, computed } from "vue";
import { useLectureStore } from "../../store/lecture/useLectureStore";
import { useAuthStore } from "../../store/auth/useAuthStore";
import MyTable from "../../components/table/MyTable.vue";
import MyPageContainer from "../../components/layout/MyPageContainer.vue";
import ScheduleViewer from "../../components/formatters/ScheduleViewer.vue";
import MySearchFilter from "../../components/search/MySearchFilter.vue";

const lectureStore = useLectureStore();

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const currentSemester = currentMonth >= 1 && currentMonth <= 6 ? 1 : 2;

const authStore = useAuthStore();
const yearOptions = computed(() => {
  const cy = now.getFullYear();
  const endYear = authStore.userInfo?.endYear || cy;
  const startYear = authStore.userInfo?.createdAt 
    ? parseInt(authStore.userInfo.createdAt.substring(0, 4)) 
    : endYear - 3;
  const years = [];
  for (let y = endYear; y >= startYear; y--) {
    years.push(y);
  }
  return years;
});

const searchParams = ref({
  year: currentYear,
  semester: currentSemester,
});

const onSearch = () => {
  lectureStore.fetchMyLectures(searchParams.value);
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
];

onMounted(() => {
  lectureStore.lectures = [];
  lectureStore.totalCount = 0;
  lectureStore.fetchMyLectures(searchParams.value);
});
</script>

<template>
  <MyPageContainer title="나의 강의 조회">

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
      :loading="lectureStore.loading"
      :empty="lectureStore.lectures.length === 0"
      emptyMessage="조회된 강의가 없습니다."
    >
      <tr v-for="lecture in lectureStore.lectures" :key="lecture.id">
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
