<script setup>
import { onMounted, ref, computed } from 'vue';
import { useLectureStore } from '../../store/lecture/useLectureStore';
import { useEnrollmentStore } from '../../store/enrollment/useEnrollmentStore';
import { useAuthStore } from '../../store/auth/useAuthStore';

const lectureStore = useLectureStore();
const enrollmentStore = useEnrollmentStore();
const authStore = useAuthStore();

// 수강신청 전용 검색 파라미터 (현재 학기 2026-1 고정)
const searchParams = ref({
    courseName: '',
    professorName: '',
    departmentName: '',
    year: 2026, 
    semester: 1,
    page: 1,
    size: 10
});

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
        alert('로그인이 필요한 서비스입니다.');
        return;
    }
    
    if (!confirm('해당 강의를 수강 신청하시겠습니까?')) {
        return;
    }
    
    await enrollmentStore.applyEnrollment(lectureId);
};

/**
 * [시간 포맷터] 쉼표로 구분된 시간을 줄바꿈 배열로 변환
 */
const formatSchedule = (schedule) => {
  if (!schedule) return [];
  return schedule.split(',').map(s => s.trim());
};

const isApplied = (lectureId) => {
    return enrollmentStore.myEnrollments.some(e => e.lectureId === lectureId);
};

onMounted(() => {
    lectureStore.fetchLectures(searchParams.value);
    if (authStore.isLoggedIn) {
        // 수강신청 화면 진입 시 현재 학기 내역 로드
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
          <label>학과</label>
          <input v-model="searchParams.departmentName" type="text" placeholder="학과명 입력" @keyup.enter="onSearch">
        </div>
        <div class="search-group">
          <label>강의명</label>
          <input v-model="searchParams.courseName" type="text" placeholder="강의명 입력" @keyup.enter="onSearch">
        </div>
        <div class="search-group">
          <label>교수명</label>
          <input v-model="searchParams.professorName" type="text" placeholder="교수명 입력" @keyup.enter="onSearch">
        </div>
        <div class="current-semester-info">
          <span class="label">대상 학기</span>
          <span class="value">{{ searchParams.year }}년 {{ searchParams.semester }}학기</span>
        </div>
        <button class="btn-search" @click="onSearch">조회</button>
      </div>
    </div>

    <!-- 테이블 영역 -->
    <div class="table-container">
      <table class="lecture-table">
        <thead>
          <tr>
            <th>과목코드</th>
            <th>학과</th>
            <th>강의명</th>
            <th>학점</th>
            <th>담당교수</th>
            <th class="col-classroom">강의실</th>
            <th class="col-time">시간</th>
            <th class="col-capacity">정원</th>
            <th>신청</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="lectureStore.loading">
            <td colspan="9" class="loading-text">데이터를 불러오는 중입니다...</td>
          </tr>
          <tr v-else-if="lectureStore.lectures.length === 0">
            <td colspan="9" class="empty-text">조회된 강의가 없습니다.</td>
          </tr>
          <tr v-for="lecture in lectureStore.lectures" :key="lecture.id">
            <td>{{ lecture.courseCode }}</td>
            <td>{{ lecture.departmentName }}</td>
            <td class="course-name">{{ lecture.courseName }}</td>
            <td>{{ lecture.credits }}</td>
            <td>{{ lecture.professorName }}</td>
            <td class="classroom-text">{{ lecture.classroom }}</td>
            <td class="time-text">
              <div v-for="(time, idx) in formatSchedule(lecture.schedule)" :key="idx">
                {{ time }}
              </div>
            </td>
            <td>{{ lecture.capacity }}명</td>
            <td>
              <button 
                class="btn-apply" 
                :class="{ 'btn-applied': isApplied(lecture.id) }"
                :disabled="isApplied(lecture.id)" 
                @click="apply(lecture.id)"
              >
                {{ isApplied(lecture.id) ? '신청완료' : '신청' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <div class="pagination" v-if="totalPages > 0">
      <button 
        v-for="p in totalPages" 
        :key="p" 
        :class="{ active: searchParams.page === p }"
        @click="goToPage(p)"
      >
        {{ p }}
      </button>
    </div>
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

.search-group input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
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
  color: #0B3D91;
  padding: 8px 0;
}

.btn-search {
  padding: 8px 24px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  height: 38px;
}

.btn-search:hover {
  background-color: #1557b0;
}

.btn-apply {
  padding: 6px 12px;
  background-color: #34a853;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
}

.btn-apply:hover {
  background-color: #2d8e47;
}

.btn-apply.btn-applied {
  background-color: #6c757d;
  cursor: default;
}

.btn-apply.btn-applied:hover {
  background-color: #6c757d;
}

/* 테이블 스타일 */
.table-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #edf2f7;
  overflow: hidden;
}

.lecture-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.lecture-table th {
  background-color: #f8f9fa;
  padding: 12px 16px;
  font-size: 0.85rem;
  color: #4f566b;
  border-bottom: 2px solid #edf2f7;
  white-space: nowrap;
}

.lecture-table td {
  padding: 14px 16px;
  font-size: 0.9rem;
  border-bottom: 1px solid #edf2f7;
}

.col-classroom { width: 15%; }
.col-time { width: 22%; }
.col-capacity { width: 80px; }

.classroom-text { font-size: 0.85rem; }
.time-text { font-size: 0.85rem; color: #1a73e8; line-height: 1.5; }
.course-name { font-weight: 600; color: #1a1f36; }

.loading-text, .empty-text {
  text-align: center;
  padding: 40px !important;
  color: #697386;
}

/* 페이지네이션 스타일 */
.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 30px;
}

.pagination button {
  padding: 8px 14px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.9rem;
}

.pagination button.active {
  background-color: #1a73e8;
  color: white;
  border-color: #1a73e8;
  font-weight: 600;
}

.pagination button:hover:not(.active) {
  background-color: #f8f9fa;
}
</style>
