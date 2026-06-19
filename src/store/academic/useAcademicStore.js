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
  const attendanceRates = ref([]);
  const excuseRequests = ref([]);

  // 성적 조회 (연도 및 학기 필터링 추가)
  const fetchGrades = async (params = {}) => {
    try {
      const res = await myAxios.get(`/api/academic/grades`, { params });
      if (res.data.code === "00") {
        gradeSummary.value = res.data.data;
      }
    } catch (error) {
      console.error("성적 조회 실패:", error);
    }
  };

  // 출결 조회
  const fetchAttendance = async () => {
    try {
      const res = await myAxios.get(`/api/academic/attendance`);
      if (res.data.code === "00") {
        attendanceList.value = res.data.data;
      }
    } catch (error) {
      console.error("출결 조회 실패:", error);
    }
  };

  const fetchAttendanceRates = async () => {
    try {
      const res = await myAxios.get(`/api/academic/attendance-rates`);
      if (res.data.code === "00") {
        attendanceRates.value = res.data.data;
      }
    } catch (error) {
      console.error("출석률 조회 실패:", error);
    }
  };

  const requestExcuse = async (form) => {
    try {
      const res = await myAxios.post(`/api/academic/excuses`, form);
      if (res.data.code === "00") {
        alert("공결 신청이 완료되었습니다.");
        await fetchExcuseRequests();
      }
    } catch (error) {
      console.error("공결 신청 실패:", error);
    }
  };

  const fetchExcuseRequests = async () => {
    try {
      const res = await myAxios.get(`/api/academic/excuses/my`);
      if (res.data.code === "00") {
        excuseRequests.value = res.data.data;
      }
    } catch (error) {
      console.error("공결 승인 결과 조회 실패:", error);
    }
  };

  return {
    gradeSummary,
    attendanceList,
    attendanceRates,
    excuseRequests,
    fetchGrades,
    fetchAttendance,
    fetchAttendanceRates,
    requestExcuse,
    fetchExcuseRequests,
  };
});
