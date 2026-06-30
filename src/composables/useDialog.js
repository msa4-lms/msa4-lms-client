import { reactive, readonly } from "vue";

// 네이티브 alert/confirm을 대체하는 전역 다이얼로그 싱글톤.
// 컴포넌트 밖(스토어, axios 인터셉터, 라우터 가드)에서도 import 해서 호출 가능.
const state = reactive({
  open: false,
  type: "alert", // "alert" | "confirm"
  title: "",
  message: "",
  confirmText: "확인",
  cancelText: "취소",
  _resolve: null,
});

const settle = (result) => {
  const resolve = state._resolve;
  state._resolve = null;
  state.open = false;
  if (resolve) resolve(result);
};

const present = (config) =>
  new Promise((resolve) => {
    // 이미 떠 있는 다이얼로그가 있으면 먼저 정리해 미해결 Promise가 남지 않게 함
    if (state._resolve) {
      const prev = state._resolve;
      state._resolve = null;
      prev(state.type === "confirm" ? false : true);
    }
    state.type = config.type;
    state.title = config.title || "";
    state.message = config.message != null ? String(config.message) : "";
    state.confirmText = config.confirmText || "확인";
    state.cancelText = config.cancelText || "취소";
    state._resolve = resolve;
    state.open = true;
  });

// alert 대체: 확인 버튼 1개. (await 가능하나 보통 그냥 호출)
export const notify = (message, options = {}) =>
  present({ type: "alert", message, ...options });

// confirm 대체: 확인/취소. Promise<boolean> 반환 (확인=true, 취소/닫기=false)
export const confirmDialog = (message, options = {}) =>
  present({ type: "confirm", message, ...options });

export function useDialog() {
  return {
    state: readonly(state),
    confirm: () => settle(true),
    cancel: () => settle(state.type === "confirm" ? false : true),
  };
}
