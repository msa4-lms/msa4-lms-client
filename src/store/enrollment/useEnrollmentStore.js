import { defineStore } from "pinia";
import { ref } from "vue";
import myAxios from "../../api/myAxios";
import { notify, confirmDialog } from "../../composables/useDialog";

export const useEnrollmentStore = defineStore("enrollment", () => {
  const myEnrollments = ref([]); // 수강 신청 과목 리스트
  const totalCredits = ref(0); // 이번 학기 총 신청 학점 합계
  const currentViewYear = ref(new Date().getFullYear());
  const currentViewSemester = ref(
    new Date().getMonth() + 1 >= 1 && new Date().getMonth() + 1 <= 6 ? 1 : 2
  );

  const fetchMyEnrollments = async (year, semester) => {
    // 파라미터가 있으면 저장, 없으면 현재 저장된 값 사용
    if (year) currentViewYear.value = year;
    if (semester) currentViewSemester.value = semester;

    try {
      const res = await myAxios.get(`/api/student/enrollments/my`, {
        params: {
          year: currentViewYear.value,
          semester: currentViewSemester.value,
        },
      });

      myEnrollments.value = res.data.data.enrollments;
      totalCredits.value = res.data.data.totalCredits;

      console.log(
        `${currentViewYear.value}년 ${currentViewSemester.value}학기 수강 내역 로드 완료`
      );
    } catch (error) {
      console.error("수강 내역을 불러오는 중 오류가 발생했습니다:", error);
    }
  };

  const applyEnrollment = async (lectureId) => {
    try {
      const res = await myAxios.post("/api/student/enrollments", {
        lectureId,
      });
      if (res.data.code === "00") {
        notify("수강 신청이 완료되었습니다.");
        await fetchMyEnrollments(
          currentViewYear.value,
          currentViewSemester.value
        );
      }
    } catch (error) {
      console.error("수강 신청 실패:", error);
    }
  };

  const cancelEnrollment = async (lectureId) => {
    if (!(await confirmDialog("정말 수강을 취소하시겠습니까?"))) return;

    try {
      const res = await myAxios.delete("/api/student/enrollments", {
        params: { lectureId },
      });
      if (res.data.code === "00") {
        notify("수강 취소가 완료되었습니다.");
        await fetchMyEnrollments(
          currentViewYear.value,
          currentViewSemester.value
        );
      }
    } catch (error) {
      console.error("수강 취소 실패:", error);
    }
  };

  return {
    myEnrollments,
    totalCredits,
    currentViewYear,
    currentViewSemester,
    fetchMyEnrollments,
    applyEnrollment,
    cancelEnrollment,
  };
});
