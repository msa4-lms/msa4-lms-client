import { defineStore } from "pinia";
import { ref } from "vue";
import myAxios from "../../api/myAxios";
import { notify, confirmDialog } from "../../composables/useDialog";

export const useEnrollmentStore = defineStore("enrollment", () => {
  const myEnrollments = ref([]); // 수강 신청 과목 리스트
  const totalCredits = ref(0); // 이번 학기 총 신청 학점 합계
  const loading = ref(false);
  const currentViewYear = ref(new Date().getFullYear());
  const currentViewSemester = ref(
    new Date().getMonth() + 1 >= 1 && new Date().getMonth() + 1 <= 6 ? 1 : 2
  );

  const toTerm = (semester) => {
    if (semester === "FIRST" || semester === "SECOND") return semester;
    return Number(semester) === 2 ? "SECOND" : "FIRST";
  };

  const toSemesterNumber = (term) => (term === "SECOND" ? 2 : 1);

  const normalizeEnrollment = (item) => ({
    ...item,
    id: item.enrollmentId,
    lectureId: item.classId,
    year: item.academicYear,
    semester: toSemesterNumber(item.term),
    schedule: item.schedule || "",
  });

  const createIdempotencyKey = () => {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const fetchMyEnrollments = async (year, semester) => {
    // 파라미터가 있으면 저장, 없으면 현재 저장된 값 사용
    if (year) currentViewYear.value = year;
    if (semester) currentViewSemester.value = semester;

    loading.value = true;
    try {
      const res = await myAxios.get(`/api/academic/enrollments`, {
        params: {
          academicYear: currentViewYear.value,
          term: toTerm(currentViewSemester.value),
        },
      });

      const enrollments = Array.isArray(res.data.data) ? res.data.data : [];
      myEnrollments.value = enrollments.map(normalizeEnrollment);
      totalCredits.value = myEnrollments.value.reduce(
        (sum, item) => sum + Number(item.credits || 0),
        0
      );
    } catch (error) {
      console.error("수강 내역을 불러오는 중 오류가 발생했습니다:", error);
    } finally {
      loading.value = false;
    }
  };

  const applyEnrollment = async (lectureId) => {
    try {
      const res = await myAxios.post(
        "/api/academic/enrollments",
        { classId: lectureId },
        { headers: { "Idempotency-Key": createIdempotencyKey() } }
      );
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

  const cancelEnrollment = async (enrollmentId) => {
    if (!(await confirmDialog("정말 수강을 취소하시겠습니까?"))) return;

    try {
      const res = await myAxios.delete(`/api/academic/enrollments/${enrollmentId}`);
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
    loading,
    currentViewYear,
    currentViewSemester,
    fetchMyEnrollments,
    applyEnrollment,
    cancelEnrollment,
  };
});
