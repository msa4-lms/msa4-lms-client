import { defineStore } from 'pinia'; // [1]
import { ref } from 'vue'; 
import myAxios from '../../api/myAxios'; // [3]

/**
 * 수강 내역 및 학점 정보를 중앙 관리하는 Pinia 스토어입니다.
 */

// [1] defineStore
//    * 왜 쓰나요? Pinia에서 새로운 데이터 저장소(Store)를 정의할 때 쓰는 핵심 함수입니다.
//    * 얻는 것: 여러 화면(메인 페이지, 시간표 팝업 등)에서 똑같은 수강 내역 데이터를 공유해서 쓸 수 있습니다.

//   [3] myAxios
//    * 왜 쓰나요? 백엔드와 통신하기 위한 "전화기"입니다.
//    * 얻는 것: 공통 설정(Base URL, 헤더 등)이 적용되어 있어 백엔드 주소 전체를 다 쓰지 않아도 /api/... 만으로 간편하게 통신할 수 있습니다.

//   [4] defineStore('enrollment', ...)
//    * 설명: 이 저장소의 고유 ID를 'enrollment'로 정합니다.
//    * 얻는 것: 나중에 '수강신청' 데이터인지 '로그인' 데이터인지 명확히 구분할 수 있습니다.

//   [5] State (상태)
//    * 설명: 우리가 보관할 데이터들입니다. myEnrollments는 배열이고, totalCredits는 숫자입니다.

//   [6] Action (액션 - fetchMyEnrollments)
//    * 설명: 실제로 백엔드에 가서 데이터를 가져오라고 시키는 함수입니다.
//    * 특징: async/await를 사용하여 데이터가 올 때까지 기다렸다가 처리를 진행합니다.

//   [7] 데이터 할당 (.value)
//    * 설명: ref로 만든 데이터에 값을 넣을 때는 꼭 .value를 붙여야 합니다.
//    * 얻는 것: 백엔드에서 받은 복잡한 객체(res.data.data) 중 우리에게 필요한 실질적인 정보만 골라 담습니다.

//   [8] return { ... }
//    * 설명: 우리가 만든 데이터와 함수를 밖(화면)에서 쓸 수 있게 열어줍니다.

export const useEnrollmentStore = defineStore('enrollment', () => { // [4]
  
  // [5] 상태(State): 화면에서 사용할 데이터들
  const myEnrollments = ref([]); // 수강 신청 과목 리스트
  const totalCredits = ref(0);   // 이번 학기 총 신청 학점 합계

  /**
   * [6] 액션(Action): 백엔드 API를 호출하여 데이터를 가져옵니다.
   * @param {number} studentId - 학생 식별 번호
   */
  const fetchMyEnrollments = async (studentId) => {
    try {
      // 백엔드 컨트롤러(@GetMapping("/my"))에 요청을 보냅니다.
      const res = await myAxios.get(`/api/enrollments/my`, {
        params: { studentId } // URL 파라미터로 studentId를 전달합니다.
      });

      // [7] 백엔드에서 받은 GlobalRes의 data 필드에서 정보를 꺼내 저장합니다.
      myEnrollments.value = res.data.data.enrollments;
      totalCredits.value = res.data.data.totalCredits;
      
      console.log('수강 내역 로드 완료:', myEnrollments.value);
    } catch (error) {
      console.error('수강 내역을 불러오는 중 오류가 발생했습니다:', error);
    }
  };

  // [8] 컴포넌트에서 사용할 수 있도록 외부로 공개합니다.
  return { 
    myEnrollments, 
    totalCredits, 
    fetchMyEnrollments 
  };
});
