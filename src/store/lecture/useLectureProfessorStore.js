import { defineStore } from "pinia";
import { ref } from "vue";
import myAxios from "../../api/myAxios";

export const useLectureProfessorStore = defineStore("lectureProfessor", () => {
  const lectures = ref([]);
  const pastLectures = ref([]);
  const availableCourses = ref([]);

  // 교수의 담당 강의 목록 조회
  const fetchProfessorLectures = async () => {
    lectures.value = [];
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

  // 과거 개설 강의 목록 조회
  const fetchPastLectures = async () => {
    pastLectures.value = [];
    try {
      const res = await myAxios.get("/api/professor/lectures/past");
      pastLectures.value = res.data.data;
    } catch (error) {
      console.error("과거 개설 강의 조회 실패:", error);
      throw error;
    }
  };

  // 개설 가능 과목 목록 조회
  const fetchAvailableCourses = async () => {
    availableCourses.value = [];
    try {
      const res = await myAxios.get("/api/professor/lectures/courses");
      availableCourses.value = res.data.data;
    } catch (error) {
      console.error("과목 조회 실패:", error);
      throw error;
    }
  };

  return {
    lectures,
    pastLectures,
    availableCourses,
    fetchProfessorLectures,
    fetchPastLectures,
    fetchAvailableCourses,
    createLecture,
  };
});
