import { defineStore } from "pinia";
import { ref } from "vue";
import myAxios from "../../api/myAxios";

export const useLeaveReturnStore = defineStore("leaveReturn", () => {
  const myRequests = ref([]);
  const pendingRequests = ref([]);

  const fetchMyRequests = async () => {
    try {
      const response = await myAxios.get("/api/student/academic-requests/my");
      myRequests.value = response.data.data;
    } catch (error) {
      console.error("Failed to fetch my requests:", error);
      throw error;
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await myAxios.get("/api/professor/academic-requests/pending");
      pendingRequests.value = response.data.data;
    } catch (error) {
      console.error("Failed to fetch pending requests:", error);
      throw error;
    }
  };

  const submitRequest = async (payload) => {
    try {
      await myAxios.post("/api/student/academic-requests", payload);
    } catch (error) {
      console.error("Failed to submit request:", error);
      throw error;
    }
  };

  const processRequest = async (id, payload) => {
    try {
      await myAxios.patch(`/api/professor/academic-requests/${id}/status`, payload);
    } catch (error) {
      console.error("Failed to process request:", error);
      throw error;
    }
  };

  return {
    myRequests,
    pendingRequests,
    fetchMyRequests,
    fetchPendingRequests,
    submitRequest,
    processRequest,
  };
});
