// 성적 평가 비율 기본값. 강의에 개별 비율이 지정돼 있지 않을 때 사용.
export const DEFAULT_GRADE_RATIOS = {
  midterm: 30,
  final: 30,
  assignment: 30,
  attendance: 10,
};

// 학기 값을 한글 라벨로 변환. 엔드포인트에 따라 문자열 enum(FIRST/SECOND) 또는
// 숫자/문자열 숫자(1, "1")로 올 수 있어 모두 허용한다.
export const termLabel = (term) => {
  if (term === "FIRST" || term === 1 || term === "1") return "1학기";
  if (term === "SECOND" || term === 2 || term === "2") return "2학기";
  return term || "";
};
