<script setup>
import { onMounted, ref, computed } from "vue";
import { useLectureStore } from "../../store/lecture/useLectureStore";
import { useEnrollmentStore } from "../../store/enrollment/useEnrollmentStore";
import { useAuthStore } from "../../store/auth/useAuthStore";
import MyButton from "../../components/button/MyButton.vue";
import MyTable from "../../components/table/MyTable.vue";
import MyPagination from "../../components/pagination/MyPagination.vue";
import MyInput from "../../components/input/MyInput.vue";

const lectureStore = useLectureStore();
const enrollmentStore = useEnrollmentStore();
const authStore = useAuthStore();

// 수강신청 전용 검색 파라미터 (현재 학기 2026-1 고정)
const searchParams = ref({
  courseName: "",
  professorName: "",
  departmentName: "",
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
  { key: "professorName", label: "담당교수" },
  { key: "classroom", label: "강의실", class: "col-classroom" },
  { key: "schedule", label: "시간", class: "col-time" },
  { key: "capacity", label: "정원", class: "col-capacity" },
  { key: "apply", label: "신청" },
];

const onSearch = () => {
  searchParams.value.page = 1;
  lectureStore.fetchLectures(searchParams.value);
};

const goToPage = (p) => {
  searchParams.value.page = p;
  lectureStore.fetchLectures(searchParams.value);
};

const totalPages = computed(() => {
  return Math.ceil(lectureStore.totalCount / searchParams.value.size);
});

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

/**
 * [시간 포맷터] 쉼표로 구분된 시간을 줄바꿈 배열로 변환
 */
const formatSchedule = (schedule) => {
  if (!schedule) return [];
  return schedule.split(",").map((s) => s.trim());
};

const isApplied = (lectureId) => {
  return enrollmentStore.myEnrollments.some((e) => e.lectureId === lectureId);
};

onMounted(async () => {
    // 0. 스토어 상태 초기화하여 이전 페이지 데이터가 보이는 현상(플래시) 방지
    lectureStore.lectures = [];
    lectureStore.totalCount = 0;

    // 1. 단과대 및 학과 데이터 로드
    await lectureStore.fetchColleges();
    
    // 2. 현재 로그인한 학생의 학과 기본 설정
    if (authStore.isLoggedIn && authStore.userInfo) {
        const studentDeptName = authStore.userInfo.departmentName;
        if (studentDeptName) {
            // 해당 학과가 포함된 단과대 조회
            const matchedCollege = lectureStore.colleges.find(c =>
                c.departments && c.departments.some(d => d.name === studentDeptName)
            );
            if (matchedCollege) {
                searchParams.value.collegeName = matchedCollege.name;
            }
            searchParams.value.departmentName = studentDeptName;
        }
    }

    // 3. 디폴트 강의 조회 및 수강신청 이력 조회
    lectureStore.fetchLectures(searchParams.value);
    if (authStore.isLoggedIn) {
        enrollmentStore.fetchMyEnrollments(searchParams.value.year, searchParams.value.semester);
    }
});
</script>

<template>
  <div class="lecture-list-container">
    <div class="page-header">
      <h2>수강 신청</h2>
    </div>

    <!-- 검색 바 (연도/학기 선택 삭제) -->
    <div class="search-section">
      <div class="search-row">
        <div class="search-group">
          <label>단과대</label>
          <select v-model="searchParams.collegeName" @change="onCollegeChange">
            <option value="">전체</option>
            <option v-for="college in lectureStore.colleges" :key="college.id" :value="college.name">
              {{ college.name }}
            </option>
          </select>
        </div>
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
            placeholder="교수명명 입력"
            @keyup-enter="onSearch"
          />
        </div>
        <div class="current-semester-info">
          <span class="label">대상 학기</span>
          <span class="value"
            >{{ searchParams.year }}년 {{ searchParams.semester }}학기</span
          >
        </div>
        <MyButton
          color="deep-blue"
          size="small"
          content="조회"
          @click="onSearch"
        />
      </div>
    </div>

    <!-- 테이블 영역 -->
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
        <td>{{ lecture.professorName }}</td>
        <td class="classroom-text">{{ lecture.classroom }}</td>
        <td class="time-text">
          <div
            v-for="(time, idx) in formatSchedule(lecture.schedule)"
            :key="idx"
          >
            {{ time }}
          </div>
        </td>
        <td>{{ lecture.capacity }}명</td>
        <td>
          <MyButton
            :content="isApplied(lecture.id) ? '신청완료' : '신청'"
            :disabled="isApplied(lecture.id)"
            :color="isApplied(lecture.id) ? 'gray' : 'green'"
            size="small"
            @click="apply(lecture.id)"
          />
        </td>
      </tr>
    </MyTable>
  </div>

  <!-- 페이지네이션 -->
  <MyPagination
    :current-page="searchParams.page"
    :total-pages="totalPages"
    @page-change="goToPage"
  />
</template>

<style scoped>
.lecture-list-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 1.5rem;
  color: #1a1f36;
}

/* 검색 섹션 */
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

.current-semester-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: flex-end;
  padding-bottom: 2px;
}

.current-semester-info .label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #4f566b;
}

.current-semester-info .value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0b3d91;
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
  font-size: 0.85rem;
  color: var(--primary-text-color);
  line-height: 1.5;
}
.course-name {
  color: var(--primary-text-color);
}
</style>
