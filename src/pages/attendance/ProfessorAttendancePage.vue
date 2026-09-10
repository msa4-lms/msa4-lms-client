<template>
  <MyPageContainer :title="getMenuTitle('/professor/attendance')">
    <!-- 상단 강의 및 날짜 선택 (MySearchFilter 사용) -->
    <MySearchFilter :showSubmit="false">
      <div class="search-group">
        <label for="lectureSelect">강의 선택</label>
        <select
          id="lectureSelect"
          v-model="selectedLectureId"
          @change="loadAttendances"
          class="form-select"
        >
          <option :value="null" disabled>강의를 선택하세요</option>
          <option v-for="lec in lectures" :key="lec.id" :value="lec.id">
            [{{ lec.courseCode }}] {{ lec.courseName }} ({{ lec.classroom }})
          </option>
        </select>
      </div>

      <div class="search-group" v-if="selectedLectureId">
        <label for="dateSelect">출결 일자</label>
        <input
          type="date"
          id="dateSelect"
          v-model="selectedDate"
          @change="loadAttendances"
          class="form-input"
        />
      </div>

      <div v-if="selectedLectureId" class="current-semester-info">
        <span class="label">강의 정보</span>
        <span class="value">
          정원: {{ currentLecture?.capacity }}명 |
          {{ currentYear }}학년도 {{ currentTerm }}
        </span>
      </div>
    </MySearchFilter>

    <!-- 출결 관리 테이블 섹션 -->
    <div class="attendance-section">
      <div class="common-section-header">
        <h3>수강생 출결 관리</h3>
        <div class="control-buttons">
          <MyButton
            color="deep-blue"
            size="middle"
            content="출결 일괄 저장"
            @click="handleSave"
          />
        </div>
      </div>

      <div class="table-wrapper">
        <MyTable
          :columns="attendanceColumns"
          :empty="localAttendances.length === 0"
          emptyMessage="수강생이 존재하지 않거나 해당 강의의 정보가 없습니다."
        >
          <tr v-for="att in localAttendances" :key="att.enrollmentId">
            <td>{{ att.studentName }}</td>
            <td>{{ att.enrollmentId }}</td>
            <td>{{ att.courseName }}</td>
            <td>
              <StatusBadge :status="att.originalStatus || 'ABSENT'" />
            </td>
            <td>
              <div class="edit-status">
                <select v-model="att.status" class="form-select status-select-small">
                  <option value="PRESENT">출석</option>
                  <option value="LATE">지각</option>
                  <option value="ABSENT">결석</option>
                  <option value="EXCUSED">출석인정</option>
                </select>
              </div>
            </td>
            <td>
              <MyInput
                type="text"
                v-model="att.remarks"
                placeholder="비고 입력"
                class="table-input"
              />
            </td>
          </tr>
        </MyTable>
      </div>
    </div>

  </MyPageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getCurrentSemesterLabel } from "../../constants/semester";
import { getMenuTitle } from "../../config/menuConfig";
import MyPageContainer from "../../components/layout/MyPageContainer.vue";
import StatusBadge from "../../components/common/StatusBadge.vue";
import MySearchFilter from "../../components/search/MySearchFilter.vue";
import MyTable from "../../components/table/MyTable.vue";
import MyButton from "../../components/button/MyButton.vue";
import MyInput from "../../components/input/MyInput.vue";
import { useAttendanceStore } from "../../store/attendance/useAttendanceStore";
import { useGradeProfessorStore } from "../../store/grade/useGradeProfessorStore";
import { notify } from "../../composables/useDialog";

defineOptions({ name: "ProfessorAttendancePage" });

const attStore = useAttendanceStore();
const gradeStore = useGradeProfessorStore();

const lectures = computed(() => gradeStore.lectures);
const selectedLectureId = ref(null);
const selectedDate = ref(new Date().toISOString().split("T")[0]);
const localAttendances = ref([]);

const currentYear = computed(() => new Date().getFullYear());
const currentTerm = computed(() => getCurrentSemesterLabel());

const currentLecture = computed(() => {
  return lectures.value.find((l) => l.id === selectedLectureId.value);
});

const attendanceColumns = [
  { key: "studentName", label: "학생 이름" },
  { key: "enrollmentId", label: "수강 ID" },
  { key: "courseName", label: "강의명" },
  { key: "status", label: "출결 상태" },
  { key: "editStatus", label: "출결 수정" },
  { key: "remarks", label: "비고" },
];

onMounted(async () => {
  await gradeStore.getLectures();
});

const loadAttendances = async () => {
  if (!selectedLectureId.value || !selectedDate.value) return;

  try {
    const data = await attStore.fetchLectureAttendances(
      selectedLectureId.value,
      selectedDate.value
    );
    // clone data for local editing, preserving original status and defaulting empty status to ABSENT
    localAttendances.value = (data || []).map((item) => ({
      ...item,
      originalStatus: item.status,
      status: item.status || "ABSENT"
    }));
  } catch (error) {
    console.error("출결 내역 조회 실패:", error);
  }
};

const handleSave = async () => {
  if (!selectedLectureId.value || !selectedDate.value) return;

  try {
    for (const att of localAttendances.value) {
      if (!att.status) continue; // skip unselected

      if (att.id) {
        // Update existing attendance
        await attStore.updateAttendance(att.id, {
          status: att.status,
          remarks: att.remarks || "",
        });
      } else {
        // Create new attendance
        await attStore.saveAttendance({
          enrollmentId: att.enrollmentId,
          lectureDate: selectedDate.value,
          period: att.period || 1,
          status: att.status,
          remarks: att.remarks || "",
        });
      }
    }
    notify("출결 정보가 성공적으로 저장되었습니다.");
    await loadAttendances(); // reload to get newly created ids
  } catch (error) {
    console.error("출결 저장 실패:", error);
  }
};
</script>

<style scoped>
.welcome-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: white;
  border-radius: 12px;
  border: 1px solid #edf2f7;
}

.empty-state {
  text-align: center;
  color: #64748b;
  font-size: 1.1rem;
}

.search-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: 20px;
}

.search-group label {
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
}

.form-select,
.form-input {
  padding: 8px 32px 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  min-width: 200px;
  background-color: white;
}

.current-semester-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  padding: 8px 16px;
  background: #f8fafc;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}

.current-semester-info .label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.current-semester-info .value {
  font-size: 0.9rem;
  color: #1e293b;
  font-weight: 500;
}

.edit-status {
  display: flex;
  justify-content: center;
  align-items: center;
}

.status-select-small {
  padding: 4px 24px 4px 8px;
  font-size: 0.85rem;
  min-width: 80px;
  height: 32px;
  border-radius: 4px;
}

.attendance-section {
  margin-top: 32px;
}



.control-buttons {
  display: flex;
  gap: 8px;
}

.table-wrapper {
  overflow: hidden;
}

.table-input {
  width: 100%;
}

.status-select {
  width: 120px;
  padding: 6px 12px;
}
</style>
