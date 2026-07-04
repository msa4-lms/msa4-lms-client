<script setup>
import { computed, onMounted, reactive, watch } from "vue";
import { useGradeStore } from "../../store/grade/useGradeStore";
import { useAuthStore } from "../../store/auth/useAuthStore";
import MyTable from "../../components/table/MyTable.vue";
import MyPageContainer from "../../components/layout/MyPageContainer.vue";
import MySearchFilter from "../../components/search/MySearchFilter.vue";

const academicStore = useGradeStore();
const authStore = useAuthStore();

const yearOptions = computed(() => {
  const cy = new Date().getFullYear();
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

const gradeColumns = [
  { key: "semester", label: "연도/학기" },
  { key: "courseCode", label: "과목코드" },
  { key: "courseName", label: "과목명" },
  { key: "credits", label: "학점" },
  { key: "grade", label: "등급" },
];

const labels = {
  all: "전체",
  year: "연도",
  semester: "학기",
  subjectName: "과목명",
  targetTerm: "대상 학기",
  firstSemester: "1학기",
  secondSemester: "2학기",
  yearSuffix: "년",
  search: "조회",
};

const searchParams = reactive({
  year: "",
  semester: "",
  courseName: "",
});

const appliedSearchParams = reactive({
  year: "",
  semester: "",
  courseName: "",
});

const targetTermText = () => {
  if (searchParams.year === "" && searchParams.semester === "")
    return labels.all;
  if (searchParams.year === "")
    return `${labels.all} ${searchParams.semester}${labels.semester}`;
  if (searchParams.semester === "")
    return `${searchParams.year}${labels.yearSuffix} ${labels.all}`;
  return `${searchParams.year}${labels.yearSuffix} ${searchParams.semester}${labels.semester}`;
};

const displayedGrades = computed(() => {
  return academicStore.gradeSummary.semesterGrades.filter((grade) => {
    const matchesYear =
      appliedSearchParams.year === "" ||
      Number(grade.year) === Number(appliedSearchParams.year);
    const matchesSemester =
      appliedSearchParams.semester === "" ||
      Number(grade.semester) === Number(appliedSearchParams.semester);
    const matchesCourse =
      appliedSearchParams.courseName === "" ||
      grade.courseName === appliedSearchParams.courseName;
    return matchesYear && matchesSemester && matchesCourse;
  });
});

const allGrades = computed(() => academicStore.gradeSummary.semesterGrades);

const courseOptions = computed(() => {
  const courses = academicStore.gradeSummary.semesterGrades
    .filter((grade) => {
      const matchesYear =
        searchParams.year === "" ||
        Number(grade.year) === Number(searchParams.year);
      const matchesSemester =
        searchParams.semester === "" ||
        Number(grade.semester) === Number(searchParams.semester);
      return matchesYear && matchesSemester;
    })
    .map((grade) => grade.courseName)
    .filter(Boolean);

  return [...new Set(courses)];
});

const displayedTotalCredits = computed(() => {
  return displayedGrades.value.reduce(
    (total, grade) => total + Number(grade.credits || 0),
    0
  );
});

const calculateGpa = (grades) => {
  const totalCredits = grades.reduce(
    (total, grade) => total + Number(grade.credits || 0),
    0
  );
  if (totalCredits === 0) return "0.0";

  const gradePointSum = grades.reduce((total, grade) => {
    return total + Number(grade.gradePoint || 0) * Number(grade.credits || 0);
  }, 0);

  return (Math.round((gradePointSum / totalCredits) * 100) / 100).toFixed(2);
};

const displayedTotalGpa = computed(() => {
  return calculateGpa(displayedGrades.value);
});

const allTotalCredits = computed(() => {
  return allGrades.value.reduce(
    (total, grade) => total + Number(grade.credits || 0),
    0
  );
});

const allTotalGpa = computed(() => {
  return calculateGpa(allGrades.value);
});

const isConfirmedGrade = (grade) => grade.status != null;

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await onSearch();
  }
});

const onSearch = async () => {
  await academicStore.fetchGrades();
  appliedSearchParams.year = searchParams.year;
  appliedSearchParams.semester = searchParams.semester;
  appliedSearchParams.courseName = searchParams.courseName;
};

watch(
  () => [searchParams.year, searchParams.semester],
  () => {
    searchParams.courseName = "";
  }
);
</script>

<template>
  <MyPageContainer title="성적 조회">
    <MySearchFilter @search="onSearch" :submitText="labels.search">
      <div class="search-group compact">
        <label>{{ labels.year }}</label>
        <select v-model="searchParams.year">
          <option value="">{{ labels.all }}</option>
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}{{ labels.yearSuffix }}</option>
        </select>
      </div>
      <div class="search-group compact">
        <label>{{ labels.semester }}</label>
        <select v-model="searchParams.semester">
          <option value="">{{ labels.all }}</option>
          <option :value="1">{{ labels.firstSemester }}</option>
          <option :value="2">{{ labels.secondSemester }}</option>
        </select>
      </div>
      <div class="search-group wide">
        <label>{{ labels.subjectName }}</label>
        <select v-model="searchParams.courseName">
          <option value="">{{ labels.all }}</option>
          <option v-for="course in courseOptions" :key="course" :value="course">
            {{ course }}
          </option>
        </select>
      </div>
      <div class="term-info">
        <span class="label">{{ labels.targetTerm }}</span>
        <span class="value">{{ targetTermText() }}</span>
      </div>
    </MySearchFilter>

    <div class="summary-grid">
      <section class="summary-card">
        <span>조회 평균 평점</span>
        <strong>{{ displayedTotalGpa }} <small>/ 4.5</small></strong>
      </section>

      <section class="summary-card">
        <span>조회 이수 학점</span>
        <strong>{{ displayedTotalCredits }} <small>학점</small></strong>
      </section>

      <section class="summary-card">
        <span>전체 평균 평점</span>
        <strong>{{ allTotalGpa }} <small>/ 4.5</small></strong>
      </section>

      <section class="summary-card">
        <span>총 전체 이수 학점</span>
        <strong>{{ allTotalCredits }} <small>학점</small></strong>
      </section>
    </div>

    <!-- 상세 성적 테이블 -->
    <div class="content-card table-section">
      <div class="common-section-header">
        <h3>학기별 상세 성적</h3>
      </div>

      <MyTable
        :columns="gradeColumns"
        :empty="displayedGrades.length === 0"
        emptyMessage="조회된 성적 내역이 없습니다."
      >
        <tr v-for="(grade, index) in displayedGrades" :key="index">
          <td class="semester">{{ grade.year }}년 {{ grade.semester }}학기</td>
          <td>{{ grade.courseCode }}</td>
          <td class="name">{{ grade.courseName }}</td>
          <td>{{ grade.credits }}</td>
          <td class="grade">
            <span v-if="isConfirmedGrade(grade)">{{ grade.grade }}</span>
            <span v-else class="text-secondary">미입력</span>
          </td>
        </tr>
      </MyTable>
    </div>
  </MyPageContainer>
</template>

<style scoped>
.grade-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
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

.page-heading p {
  color: var(--primary-text-color);
  font-size: 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 22px;
}

.wide {
  flex: 0 0 260px;
}

.compact {
  flex: 0 0 120px;
}

.search-group input {
  width: 100%;
  height: 38px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  background: #fff;
  color: #111827;
  box-sizing: border-box;
  font-size: 0.9rem;
}

.term-info {
  display: flex;
  min-width: 110px;
  flex-direction: column;
  gap: 6px;
}

.term-info .label {
  color: #4f566b;
  font-size: 0.85rem;
  font-weight: 600;
}

.term-info .value {
  color: #0b3d91;
  font-size: 1rem;
  font-weight: 800;
  line-height: 38px;
  white-space: nowrap;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border: 1px solid #edf2f7;
}

.summary-card span {
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 600;
}

.summary-card strong {
  color: #071f49;
  font-size: 1.5rem;
  font-weight: 700;
}

.summary-card strong small {
  color: #64748b;
  font-size: 1.5rem;
  font-weight: 700;
  margin-left: 4px;
}



.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
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

.no-data {
  padding: 60px 0;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-state p {
  color: #64748b;
  line-height: 1.6;
}

@media (max-width: 760px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
