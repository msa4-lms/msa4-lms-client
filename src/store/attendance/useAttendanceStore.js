import { defineStore } from "pinia";
import { ref } from "vue";
import myAxios from "../../api/myAxios";

export const useAttendanceStore = defineStore("attendance", () => {
  const attendanceList = ref([]);
  const attendanceRates = ref([]);
  const myExcuseRequests = ref([]);
  const pendingExcuseRequests = ref([]);
  const professorExcuseRequests = ref([]);

  const fetchAttendance = async () => {
    try {
      const res = await myAxios.get(`/api/student/attendances/attendance`, {
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
      const res = await myAxios.get("/api/student/attendances/attendance-rates", {
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
      const res = await myAxios.get("/api/student/attendances/excuses/my", {
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
      const res = await myAxios.get("/api/professor/attendances/excuses/pending", {
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

  const fetchProfessorExcuseRequests = async () => {
    try {
      const res = await myAxios.get("/api/professor/attendances/excuses", {
        suppressErrorAlert: true,
      });
      if (res.data.code === "00") {
        professorExcuseRequests.value = res.data.data;
      }
    } catch (error) {
      professorExcuseRequests.value = [];
      console.error("교수 공결 신청 목록 조회 실패:", error);
    }
  };

  const requestExcuse = async (payload) => {
    const res = await myAxios.post("/api/student/attendances/excuses", payload);
    if (res.data.code === "00") {
      await fetchMyExcuseRequests();
    }
    return res.data;
  };

  const decideExcuseRequest = async (requestId, payload) => {
    const res = await myAxios.patch(`/api/professor/attendances/excuses/${requestId}`, payload);
    if (res.data.code === "00") {
      await fetchPendingExcuseRequests();
      await fetchProfessorExcuseRequests();
    }
    return res.data;
  };

  const fetchLectureAttendances = async (lectureId, date) => {
    const res = await myAxios.get(`/api/professor/attendances/lecture/${lectureId}`, {
      params: { date },
    });
    return res.data.data;
  };

  const saveAttendance = async (payload) => {
    const res = await myAxios.post(`/api/professor/attendances`, payload);
    return res.data;
  };

  const updateAttendance = async (id, payload) => {
    const res = await myAxios.patch(`/api/professor/attendances/${id}`, null, {
      params: payload,
    });
    return res.data;
  };

  return {
    attendanceList,
    attendanceRates,
    myExcuseRequests,
    pendingExcuseRequests,
    professorExcuseRequests,
    fetchAttendance,
    fetchAttendanceRates,
    fetchMyExcuseRequests,
    fetchPendingExcuseRequests,
    fetchProfessorExcuseRequests,
    requestExcuse,
    decideExcuseRequest,
    fetchLectureAttendances,
    saveAttendance,
    updateAttendance,
  };
});
