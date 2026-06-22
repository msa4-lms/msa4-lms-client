import { defineStore } from "pinia";
import { ref } from "vue";
import myAxios from "../../api/myAxios";

export const useLectureProfessorStore = defineStore("lectureProfessor", () => {
  const lectures = ref([]);

  // 교수의 담당 강의 목록 조회
  const fetchProfessorLectures = async () => {
    try {
      const res = await myAxios.get("/api/professor/lectures");
      lectures.value = res.data.data;
    } catch (error) {
      console.error("교수 담당 강의 조회 실패:", error);
      throw error;
    }
  };

  // 교수 강의 개설
  const createLecture = async (lectureData) => {
    try {
      await myAxios.post("/api/professor/lectures", lectureData);
    } catch (error) {
      console.error("강의 개설 실패:", error);
      throw error;
    }
  };

  return {
    lectures,
    fetchProfessorLectures,
    createLecture,
  };
});
