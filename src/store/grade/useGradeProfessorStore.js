import { defineStore } from "pinia";
import { ref } from "vue";
import myAxios from "../../api/myAxios";

export const useGradeProfessorStore = defineStore("gradeProfessor", () => {
  const grades = ref([]);
  const lectures = ref([]);
  const gradeStatus = ref(null); // null | 'DRAFT' | 'OPENED' | 'FINAL'

  const fetchGrades = async (lectureId) => {
    try {
      const res = await myAxios.get(
        `/api/professor/grades/lectures/${lectureId}`
      );
      grades.value = res.data.data;
      gradeStatus.value = grades.value.length > 0 ? grades.value[0].status : null;
    } catch (error) {
      console.error("수강생 성적 조회 실패:", error);
      throw error;
    }
  };

  const clearGrades = () => {
    grades.value = [];
    gradeStatus.value = null;
  };

  const saveGrades = async (lectureId, gradeList) => {
    try {
      await myAxios.put(`/api/professor/grades/lectures/${lectureId}`, {
        gradeList,
      });
    } catch (error) {
      console.error("성적 임시 저장 실패:", error);
      throw error;
    }
  };

  const correctGrades = async (lectureId, correctionList) => {
    try {
      await myAxios.patch(`/api/professor/grades/lectures/${lectureId}/correction`, {
        correctionList,
      });
    } catch (error) {
      console.error("성적 정정 실패:", error);
      throw error;
    }
  };

  const updateGradesStatus = async (lectureId, status) => {
    try {
      await myAxios.patch(
        `/api/professor/grades/lectures/${lectureId}/status?status=${status}`
      );
    } catch (error) {
      console.error("성적 상태 변경 실패:", error);
      throw error;
    }
  };

  const getLectures = async () => {
    try {
      const url = "/api/professor/grades/lectures";
      const res = await myAxios.get(url);

      lectures.value = (res.data.data || []).map((lecture) => ({
        ...lecture,
        id: lecture.id ?? lecture.lectureId,
      }));
    } catch (error) {
      console.error("현재 학기 강의 조회 실패:", error);
      throw error;
    }
  };

  return {
    grades,
    lectures,
    gradeStatus,
    fetchGrades,
    clearGrades,
    saveGrades,
    correctGrades,
    updateGradesStatus,
    getLectures,
  };
});
