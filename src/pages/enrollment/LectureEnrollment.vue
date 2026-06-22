<script setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../../store/auth/useAuthStore";
import { useEnrollmentStore } from "../../store/enrollment/useEnrollmentStore";
import { useLectureStore } from "../../store/lecture/useLectureStore";
import MyButton from "../../components/button/MyButton.vue";
import MyInput from "../../components/input/MyInput.vue";
import MyPagination from "../../components/pagination/MyPagination.vue";
import MyTable from "../../components/table/MyTable.vue";
import MySearchFilter from "../../components/search/MySearchFilter.vue";
import CollegeDepartmentSelect from "../../components/search/CollegeDepartmentSelect.vue";
import ScheduleViewer from "../../components/formatters/ScheduleViewer.vue";

const lectureStore = useLectureStore();
const enrollmentStore = useEnrollmentStore();
const authStore = useAuthStore();

const searchParams = ref({
  courseName: "",
  professorName: "",
  departmentName: "",
  collegeName: "",
  targetGrade: "",
  year: 2026,
  semester: 1,
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
  { key: "apply", label: "신청" },
];

const filteredDepartments = computed(() => {
  if (!searchParams.value.collegeName) {
    const allDepartments = [];

    lectureStore.colleges.forEach((college) => {
      if (college.departments) {
        allDepartments.push(...college.departments);
      }
    });

    return Array.from(
      new Map(
        allDepartments.map((department) => [department.name, department])
      ).values()
    ).sort((a, b) => a.name.localeCompare(b.name));
  }

  const matchedCollege = lectureStore.colleges.find(
    (college) => college.name === searchParams.value.collegeName
  );

  return matchedCollege ? matchedCollege.departments || [] : [];
});

const onCollegeChange = () => {
  if (searchParams.value.collegeName) {
    const matchedCollege = lectureStore.colleges.find(
      (college) => college.name === searchParams.value.collegeName
    );
    const departmentNames = matchedCollege
      ? (matchedCollege.departments || []).map((department) => department.name)
      : [];

    if (!departmentNames.includes(searchParams.value.departmentName)) {
      searchParams.value.departmentName = "";
    }
  } else {
    searchParams.value.departmentName = "";
  }

  onSearch();
};

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

const apply = async (lectureId) => {
  if (!authStore.isLoggedIn) {
    alert("로그인이 필요한 서비스입니다.");
    return;
  }

  if (!confirm("해당 강의를 수강 신청하시겠습니까?")) {
    return;
  }

  await enrollmentStore.applyEnrollment(lectureId);
};

const isApplied = (lectureId) =>
  enrollmentStore.myEnrollments.some(
    (enrollment) => enrollment.lectureId === lectureId
  );

onMounted(async () => {
  lectureStore.lectures = [];
  lectureStore.totalCount = 0;

  await lectureStore.fetchColleges();

  if (authStore.isLoggedIn && authStore.userInfo) {
    const studentDepartmentName = authStore.userInfo.departmentName;

    if (studentDepartmentName) {
      const matchedCollege = lectureStore.colleges.find(
        (college) =>
          college.departments &&
          college.departments.some(
            (department) => department.name === studentDepartmentName
          )
      );

      if (matchedCollege) {
        searchParams.value.collegeName = matchedCollege.name;
      }

      searchParams.value.departmentName = studentDepartmentName;
    }

    if (authStore.userInfo.gradeLevel) {
      searchParams.value.targetGrade = authStore.userInfo.gradeLevel;
    }
  }

  lectureStore.fetchLectures(searchParams.value);

  if (authStore.isLoggedIn) {
    enrollmentStore.fetchMyEnrollments(
      searchParams.value.year,
      searchParams.value.semester
    );
  }
});
</script>

<template>
  <div class="lecture-list-container">
    <div class="page-header">
      <h2>수강 신청</h2>
    </div>

    <MySearchFilter @search="onSearch">
        <CollegeDepartmentSelect
          v-model:collegeName="searchParams.collegeName"
          v-model:departmentName="searchParams.departmentName"
          :colleges="lectureStore.colleges"
          @change="onSearch"
        />

        <div class="search-group">
          <label>대상 학년</label>
          <select v-model="searchParams.targetGrade" @change="onSearch">
            <option value="">전체</option>
            <option :value="1">1학년</option>
            <option :value="2">2학년</option>
            <option :value="3">3학년</option>
            <option :value="4">4학년</option>
          </select>
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

        <div class="current-semester-info">
          <span class="label">대상 학기</span>
          <span class="value"
            >{{ searchParams.year }}년 {{ searchParams.semester }}학기</span
          >
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
        <td>
          <MyButton
            btnType="button"
            :color="isApplied(lecture.id) ? 'gray' : 'green'"
            size="small"
            :content="isApplied(lecture.id) ? '신청완료' : '신청'"
            :disabled="isApplied(lecture.id)"
            @click="apply(lecture.id)"
          />
        </td>
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
  color: var(--primary-text-color);
}

.current-semester-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: flex-end;
  padding-bottom: 2px;
}

.current-semester-info .value {
  color: var(--primary-color);
  font-size: 0.95rem;
  font-weight: 700;
  padding: 8px 0;
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
  color: #1a1f36;
  font-weight: 600;
}
</style>
