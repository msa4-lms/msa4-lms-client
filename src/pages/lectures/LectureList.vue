<script setup>
import { computed, onMounted, ref } from "vue";
import { useLectureStore } from "../../store/lecture/useLectureStore";
import MyButton from "../../components/button/MyButton.vue";
import MyInput from "../../components/input/MyInput.vue";
import MyPagination from "../../components/pagination/MyPagination.vue";
import MyTable from "../../components/table/MyTable.vue";

const lectureStore = useLectureStore();

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const currentSemester = currentMonth >= 1 && currentMonth <= 6 ? 1 : 2;

const searchParams = ref({
  courseName: "",
  professorName: "",
  departmentName: "",
  year: currentYear,
  semester: currentSemester,
  page: 1,
  size: 10,
});

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

const onSearch = () => {
  searchParams.value.page = 1;
  lectureStore.fetchLectures(searchParams.value);
};

const goToPage = (page) => {
  searchParams.value.page = page;
  lectureStore.fetchLectures(searchParams.value);
};

const totalPages = computed(() =>
  Math.ceil(lectureStore.totalCount / searchParams.value.size)
);

const formatSchedule = (schedule) => {
  if (!schedule) return [];
  return schedule.split(",").map((item) => item.trim());
};

onMounted(() => {
  lectureStore.lectures = [];
  lectureStore.totalCount = 0;
  lectureStore.fetchLectures(searchParams.value);
});
</script>

<template>
  <div class="lecture-list-container">
    <div class="page-header">
      <h2>강의 조회</h2>
    </div>

    <div class="search-section">
      <div class="search-row">
        <div class="search-group">
          <label>학과</label>
          <MyInput
            v-model="searchParams.departmentName"
            placeholder="학과명 입력"
            @keyup-enter="onSearch"
          />
        </div>

        <div class="search-group">
          <label>강의명</label>
          <MyInput
            v-model="searchParams.courseName"
            placeholder="강의명 입력"
            @keyup-enter="onSearch"
          />
        </div>

        <div class="search-group">
          <label>교수명</label>
          <MyInput
            v-model="searchParams.professorName"
            placeholder="교수명 입력"
            @keyup-enter="onSearch"
          />
        </div>

        <div class="search-group">
          <label>연도</label>
          <select v-model="searchParams.year">
            <option :value="2026">2026년</option>
            <option :value="2025">2025년</option>
            <option :value="2024">2024년</option>
            <option :value="2023">2023년</option>
          </select>
        </div>

        <div class="search-group">
          <label>학기</label>
          <select v-model="searchParams.semester">
            <option :value="1">1학기</option>
            <option :value="2">2학기</option>
          </select>
        </div>

        <MyButton
          btnType="submit"
          color="deep-blue"
          size="small"
          content="조회"
          @click="onSearch"
        />
      </div>
    </div>

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
        <td class="time-text">
          <div
            v-for="(time, index) in formatSchedule(lecture.schedule)"
            :key="index"
          >
            {{ time }}
          </div>
        </td>
        <td>{{ lecture.capacity }}명</td>
      </tr>
    </MyTable>

    <MyPagination
      :currentPage="searchParams.page"
      :totalPages="totalPages"
      @page-change="goToPage"
    />
  </div>
</template>

<style scoped>
.lecture-list-container {
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 50px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 1.5rem;
  color: #1a1f36;
}

.search-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #edf2f7;
  margin-bottom: 24px;
}

.search-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.search-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #4f566b;
}

.search-group select {
  min-width: 160px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 0.9rem;
}

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

.course-name {
  color: var(--primary-text-color);
}
</style>
