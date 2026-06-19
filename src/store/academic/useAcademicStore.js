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

  // 성적 조회
  const fetchGrades = async () => {
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
      const res = await myAxios.get(`/api/student/academic/attendance`);
      if (res.data.code === "00") {
        attendanceList.value = res.data.data;
      }
    } catch (error) {
      console.error("출결 조회 실패:", error);
    }
  };

  const fetchAttendanceRates = async () => {
    const res = await myAxios.get("/api/academic/attendance-rates");
    if (res.data.code === "00") {
      attendanceRates.value = res.data.data;
    }
  };

  const fetchMyExcuseRequests = async () => {
    const res = await myAxios.get("/api/academic/excuses/my");
    if (res.data.code === "00") {
      myExcuseRequests.value = res.data.data;
    }
  };

  const fetchPendingExcuseRequests = async () => {
    const res = await myAxios.get("/api/academic/excuses/pending");
    if (res.data.code === "00") {
      pendingExcuseRequests.value = res.data.data;
    }
  };

  const requestExcuse = async (payload) => {
    const res = await myAxios.post("/api/academic/excuses", payload);
    if (res.data.code === "00") {
      await fetchMyExcuseRequests();
    }
    return res.data;
  };

  const decideExcuseRequest = async (requestId, payload) => {
    const res = await myAxios.patch(`/api/academic/excuses/${requestId}`, payload);
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
