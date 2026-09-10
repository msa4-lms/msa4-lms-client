import { defineStore } from "pinia";
import { ref } from "vue";
import myAxios from "../../api/myAxios";

export const useGradeStore = defineStore("grade", () => {
  const gradeSummary = ref({
    totalGpa: 0.0,
    totalCredits: 0,
    queryGpa: 0.0,
    queryCredits: 0,
    semesterGrades: [],
  });
  const loading = ref(false);

  const toTerm = (semester) => {
    if (!semester) return "";
    if (semester === "FIRST" || semester === "SECOND") return semester;
    return Number(semester) === 2 ? "SECOND" : "FIRST";
  };

  const toSemesterNumber = (term) => (term === "SECOND" ? 2 : 1);

  // 성적 조회 (연도 및 학기 필터링 추가)
  const fetchGrades = async (params = {}) => {
    loading.value = true;
    try {
      const res = await myAxios.get(`/api/academic/grades/me`, {
        params: {
          academicYear: params.year || params.academicYear || undefined,
          term: toTerm(params.semester || params.term) || undefined,
          courseName: params.courseName || undefined,
        },
      });
      if (res.data.code === "00") {
        const data = res.data.data || {};
        const grades = Array.isArray(data.grades) ? data.grades : [];
        gradeSummary.value = {
          totalGpa: data.totalGpa ?? 0.0,
          totalCredits: data.totalCredits ?? 0,
          queryGpa: data.queryGpa ?? 0.0,
          queryCredits: data.queryCredits ?? 0,
          semesterGrades: grades.map((grade) => ({
            ...grade,
            year: grade.academicYear,
            semester: toSemesterNumber(grade.term),
            grade: grade.letterGrade,
            status: grade.letterGrade ? "OPENED" : null,
          })),
        };
      }
    } catch (error) {
      console.error("성적 조회 실패:", error);
    } finally {
      loading.value = false;
    }
  };

  return {
    gradeSummary,
    loading,
    fetchGrades,
  };
});
