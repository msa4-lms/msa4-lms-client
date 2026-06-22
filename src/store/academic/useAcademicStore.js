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
  const myExcuseRequests = ref([]);
  const pendingExcuseRequests = ref([]);

  // 성적 조회 (연도 및 학기 필터링 추가)
  const fetchGrades = async (params = {}) => {
    try {
      const res = await myAxios.get(`/api/student/academic/grades`);
      if (res.data.code === "00") {
        gradeSummary.value = res.data.data;
      }
    } catch (error) {
      console.error("성적 조회 실패:", error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await myAxios.get(`/api/student/academic/attendance`, {
        suppressErrorAlert: true,
      });
      if (res.data.code === "00") {
        attendanceList.value = res.data.data;
      }
    } catch (error) {
      attendanceList.value = [];
      console.error("출결 조회 실패:", error);
    }
  };

  const fetchAttendanceRates = async (params = {}) => {
    try {
      const res = await myAxios.get("/api/student/academic/attendance-rates", {
        params,
        suppressErrorAlert: true,
      });
      if (res.data.code === "00") {
        attendanceRates.value = res.data.data;
      }
    } catch (error) {
      attendanceRates.value = [];
      console.error("출석률 조회 실패:", error);
    }
  };

  const fetchMyExcuseRequests = async () => {
    try {
      const res = await myAxios.get("/api/student/academic/excuses/my", {
        suppressErrorAlert: true,
      });
      if (res.data.code === "00") {
        myExcuseRequests.value = res.data.data;
      }
    } catch (error) {
      myExcuseRequests.value = [];
      console.error("공결 내역 조회 실패:", error);
    }
  };

  const fetchPendingExcuseRequests = async () => {
    try {
      const res = await myAxios.get("/api/professor/academic/excuses/pending", {
        suppressErrorAlert: true,
      });
      if (res.data.code === "00") {
        pendingExcuseRequests.value = res.data.data;
      }
    } catch (error) {
      pendingExcuseRequests.value = [];
      console.error("공결 승인 대기 조회 실패:", error);
    }
  };

  const requestExcuse = async (payload) => {
    const res = await myAxios.post("/api/student/academic/excuses", payload);
    if (res.data.code === "00") {
      await fetchMyExcuseRequests();
    }
    return res.data;
  };

  const decideExcuseRequest = async (requestId, payload) => {
    const res = await myAxios.patch(`/api/professor/academic/excuses/${requestId}`, payload);
    if (res.data.code === "00") {
      await fetchPendingExcuseRequests();
      await fetchAttendanceRates();
    }
    return res.data;
  };

  return {
    gradeSummary,
    attendanceList,
    attendanceRates,
    myExcuseRequests,
    pendingExcuseRequests,
    fetchGrades,
    fetchAttendance,
    fetchAttendanceRates,
    fetchMyExcuseRequests,
    fetchPendingExcuseRequests,
    requestExcuse,
    decideExcuseRequest,
  };
});
