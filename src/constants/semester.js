// 현재 날짜 기준 학기 계산 규칙: 1~6월은 1학기, 7~12월은 2학기.
// 여러 페이지/스토어에 흩어져 있던 동일 계산을 한곳으로 모은다.

export function getCurrentSemester(date = new Date()) {
  return date.getMonth() + 1 <= 6 ? 1 : 2;
}

export function getCurrentSemesterLabel(date = new Date()) {
  return getCurrentSemester(date) === 1 ? "1학기" : "2학기";
}
