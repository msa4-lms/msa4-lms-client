import { defineStore } from "pinia";
import { ref } from "vue";
import myAxios from "../../api/myAxios";

export const useGradeProfessorStore = defineStore("gradeProfessor", () => {
  const grades = ref([]);
  const lectures = ref([]);

  // 특정 강좌의 수강생 성적 조회
  const fetchGrades = async (lectureId) => {
    try {
      const res = await myAxios.get(
        `/api/professor/grades/lectures/${lectureId}`
      );
      grades.value = res.data.data;
    } catch (error) {
      console.error("수강생 성적 조회 실패:", error);
      throw error;
    }
  };

  // 성적 임시 저장
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

  // 기존 점수 또는 최종 등급 정정
  const correctGrades = async (lectureId, gradeList) => {
    try {
      await myAxios.put(`/api/professor/grades/lectures/${lectureId}`, {
        gradeList,
      });
    } catch (error) {
      console.error("성적 정정 실패:", error);
      throw error;
    }
  };

  // 성적 상태 변경 (DRAFT -> SUBMITTED, SUBMITTED -> OPENED 등)
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

  // 이의신청 답변 처리 (승인/반려)
  const replyObjection = async (gradeId, { approve, reply, newScores }) => {
    try {
      const url = `/api/professor/grades/${gradeId}/objection?approve=${approve}&reply=${encodeURIComponent(
        reply
      )}`;
      await myAxios.patch(url, newScores || {});
    } catch (error) {
      console.error("이의신청 답변 처리 실패:", error);
      throw error;
    }
  };

  // 교수 현재 강의 조회
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
    fetchGrades,
    saveGrades,
    correctGrades,
    updateGradesStatus,
    replyObjection,
    getLectures,
  };
});
