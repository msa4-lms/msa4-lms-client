import { defineStore } from "pinia";
import { ref } from "vue";
import myAxios from "../../api/myAxios";

export const useProfileStore = defineStore("profile", () => {
  const profile = ref(null);
  const fetchStudentProfile = async () => {
    console.log("프로필 조회 시작");

    try {
      const res = await myAxios.get("/api/student/profile");
      console.log("프로필 응답:", res.data);

      if (res.data.code === "00") {
        profile.value = res.data.data;
        console.log("저장된 profile:", profile.value);
      }
    } catch (error) {
      console.error("프로필 조회 실패", error);
    }
  };
  return {
    profile,
    fetchStudentProfile,
  };
});
