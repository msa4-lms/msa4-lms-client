import { defineStore } from "pinia";
import { ref } from "vue";
import myAxios from "../../api/myAxios";

export const useGradeStore = defineStore("grade", () => {
  const gradeSummary = ref({
    totalGpa: 0.0,
    totalCredits: 0,
    semesterGrades: [],
  });

  // 성적 조회 (연도 및 학기 필터링 추가)
  const fetchGrades = async (params = {}) => {
    try {
      const res = await myAxios.get(`/api/student/grades`, {
        params,
      });
      if (res.data.code === "00") {
        gradeSummary.value = res.data.data;
      }
    } catch (error) {
      console.error("성적 조회 실패:", error);
    }
  };

  return {
    gradeSummary,
    fetchGrades,
  };
});
