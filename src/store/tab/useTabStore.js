import { defineStore } from "pinia";
import { ref } from "vue";
import router from "../../routes/router";
import { useAuthStore } from "../auth/useAuthStore";
export const useTabStore = defineStore("tab", () => {
  const tabs = ref([]);
  const activeTab = ref("");

  const addTab = (route) => {
    if (route.path === "/") return; // 로그인 페이지는 탭에 추가하지 않음

    const title = getTitleByPath(route.path, route.name);
    const existingTab = tabs.value.find((tab) => tab.path === route.path);

    if (existingTab) {
      activeTab.value = route.path;
    } else {
      if (tabs.value.length >= 10) {
        alert("탭은 최대 10개까지만 열 수 있습니다.");
        // 최대 개수 제한(10개) 초과 시 가장 오래된 탭을 제거
        tabs.value.shift();
      }
      tabs.value.push({
        title,
        path: route.path,
        name: route.name, // keep-alive를 위한 컴포넌트 이름
      });
      activeTab.value = route.path;
    }
  };

  const removeTab = (path) => {
    const index = tabs.value.findIndex((tab) => tab.path === path);
    if (index !== -1) {
      tabs.value.splice(index, 1);
      
      // 현재 활성화된 탭을 닫은 경우 다른 탭으로 이동
      if (activeTab.value === path) {
        if (tabs.value.length > 0) {
          const nextTab = tabs.value[tabs.value.length - 1];
          activeTab.value = nextTab.path;
          router.push(nextTab.path);
        } else {
          // 남은 탭이 없으면 메인으로 이동
          activeTab.value = "/main";
          router.push("/main");
        }
      }
    }
  };

  const clearTabs = () => {
    tabs.value = [];
    activeTab.value = "";
  };

  // 경로(path)나 이름(name)을 기반으로 사용자에게 보여줄 탭 제목 추출
  const getTitleByPath = (path, name) => {
    const authStore = useAuthStore();
    const role = authStore.userInfo?.role;
    
    switch (path) {
      case "/main": return "메인 화면";
      case "/profile": 
        if (role === 'STUDENT') return "학적조회";
        if (role === 'PROFESSOR') return "교적 조회";
        return "내 정보";
      case "/enrollments": return "시간표 조회";
      case "/registration": return "수강 신청";
      case "/grade": return "성적 조회";
      case "/attendance": return "출결 조회";
      case "/excuses": return "공결 신청";
      case "/professor/lectures/create": return "강의 개설 (수강 계획서)";
      case "/lectures": return "강의 조회 (시간표, 특강)";
      case "/professor/grades/input": return "성적 입력";
      case "/professor/grades/correct": return "성적 정정";
      case "/students": return "사용자 관리";
      case "/leave-return": return "휴/복학 신청";
      case "/professor/leave-return": return "휴/복학 결재";
      default: return name || "알 수 없음";
    }
  };

  return {
    tabs,
    activeTab,
    addTab,
    removeTab,
    clearTabs,
  };
});
