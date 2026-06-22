import { defineStore } from "pinia";
import { ref } from "vue";
import myAxios from "../../api/myAxios";

export const useProfileStore = defineStore("profile", () => {
  const profile = ref(null);

  const fetchStudentProfile = async () => {
    try {
      const res = await myAxios.get("/api/student/profile");

      if (res.data.code === "00") {
        profile.value = res.data.data;
      }
    } catch (error) {
      console.error("프로필 조회 실패", error);
    }
  };

  const fetchProfessorProfile = async () => {
    try {
      const res = await myAxios.get("/api/professor/profile");

      if (res.data.code === "00") {
        profile.value = res.data.data;
      }
    } catch (error) {
      console.error("프로필 조회 실패", error);
    }
  };
  return {
    profile,
    fetchStudentProfile,
    fetchProfessorProfile,
  };
});
