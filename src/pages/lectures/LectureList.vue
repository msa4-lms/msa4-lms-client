<script setup>
import { onMounted, ref } from 'vue';
import { useLectureStore } from '../../store/lecture/useLectureStore';

const lectureStore = useLectureStore();

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const currentSemester = currentMonth >= 1 && currentMonth <= 6 ? 1 : 2;

const searchParams = ref({
    courseName: '',
    professorName: '',
    year: currentYear,
    semester: currentSemester,
    page: 1,
    size: 10
});

const onSearch = () => {
    lectureStore.fetchLectures(searchParams.value);
};

onMounted(() => {
    onSearch();
});
</script>

<template>
  <div class="lecture-list-container">
    <div class="page-header">
      <h2>강의 조회</h2>
    </div>

    <!-- 검색 바 -->
    <div class="search-section">
      <div class="search-row">
        <div class="search-group">
          <label>강의명</label>
          <input v-model="searchParams.courseName" type="text" placeholder="강의명 입력" @keyup.enter="onSearch">
        </div>
        <div class="search-group">
          <label>교수명</label>
          <input v-model="searchParams.professorName" type="text" placeholder="교수명 입력" @keyup.enter="onSearch">
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
        <button class="btn-search" @click="onSearch">조회</button>
      </div>
    </div>

    <!-- 테이블 영역 -->
    <div class="table-container">
      <table class="lecture-table">
        <thead>
          <tr>
            <th>과목코드</th>
            <th>강의명</th>
            <th>학점</th>
            <th>담당교수</th>
            <th>강의실</th>
            <th>시간</th>
            <th>정원</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="lectureStore.loading">
            <td colspan="7" class="loading-text">데이터를 불러오는 중입니다...</td>
          </tr>
          <tr v-else-if="lectureStore.lectures.length === 0">
            <td colspan="7" class="empty-text">조회된 강의가 없습니다.</td>
          </tr>
          <tr v-for="lecture in lectureStore.lectures" :key="lecture.id">
            <td>{{ lecture.courseCode }}</td>
            <td class="course-name">{{ lecture.courseName }}</td>
            <td>{{ lecture.credits }}</td>
            <td>{{ lecture.professorName }}</td>
            <td>{{ lecture.classroom }}</td>
            <td>{{ lecture.schedule }}</td>
            <td>{{ lecture.capacity }}명</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.lecture-list-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 1.5rem;
  color: #1a1f36;
}

.page-header p {
  color: #697386;
  font-size: 0.9rem;
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

.search-group input, .search-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
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
}

.lecture-table td {
  padding: 14px 16px;
  font-size: 0.9rem;
  border-bottom: 1px solid #edf2f7;
}

.course-name {
  font-weight: 600;
  color: #1a73e8;
}

.loading-text, .empty-text {
  text-align: center;
  padding: 40px !important;
  color: #697386;
}
</style>
