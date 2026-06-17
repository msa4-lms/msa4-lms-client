import { defineStore } from "pinia";
import { ref } from "vue";
import myAxios from "../../api/myAxios";

export const useAcademicStore = defineStore("academic", () => {
  const gradeSummary = ref({
    totalGpa: 0.0,
    totalCredits: 0,
    semesterGrades: [],
  });
  const attendanceList = ref([]);

  // 성적 조회
  const fetchGrades = async (studentId) => {
    try {
      const res = await myAxios.get(`/api/academic/grades`, {
        params: { studentId },
      });
      if (res.data.code === "00") {
        gradeSummary.value = res.data.data;
      }
    } catch (error) {
      console.error("성적 조회 실패:", error);
    }
  };

  // 출결 조회
  const fetchAttendance = async (studentId) => {
    try {
      const res = await myAxios.get(`/api/academic/attendance`, {
        params: { studentId },
      });
      if (res.data.code === "00") {
        attendanceList.value = res.data.data;
      }
    } catch (error) {
      console.error("출결 조회 실패:", error);
    }
  };

  return { gradeSummary, attendanceList, fetchGrades, fetchAttendance };
});
