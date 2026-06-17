import { defineStore } from 'pinia'; // [1]
import { ref } from 'vue'; 
import myAxios from '../../api/myAxios'; // [3]

export const useEnrollmentStore = defineStore('enrollment', () => { // [4]
  
  // [5] 상태(State): 화면에서 사용할 데이터들
  const myEnrollments = ref([]); // 수강 신청 과목 리스트
  const totalCredits = ref(0);   // 이번 학기 총 신청 학점 합계

  /**
   * [6] 액션(Action): 백엔드 API를 호출하여 데이터를 가져옵니다.
   * @param {number} studentId - 학생 식별 번호
   */
  const fetchMyEnrollments = async (studentId) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const semester = month >= 1 && month <= 6 ? 1 : 2;

    try {
      // 백엔드 컨트롤러(@GetMapping("/my"))에 요청을 보냅니다.
      const res = await myAxios.get(`/api/enrollments/my`, {
        params: { 
          studentId,
          year,
          semester
        } 
      });

      // [7] 백엔드에서 받은 GlobalRes의 data 필드에서 정보를 꺼내 저장합니다.
      myEnrollments.value = res.data.data.enrollments;
      totalCredits.value = res.data.data.totalCredits;
      
      console.log('수강 내역 로드 완료:', myEnrollments.value);
    } catch (error) {
      console.error('수강 내역을 불러오는 중 오류가 발생했습니다:', error);
    }
  };

  /**
   * 수강 신청
   */
  const applyEnrollment = async (studentId, lectureId) => {
    try {
      const res = await myAxios.post('/api/enrollments', {
        studentId,
        lectureId
      });
      if (res.data.code === '00') {
        alert('수강 신청이 완료되었습니다.');
        await fetchMyEnrollments(studentId);
      }
    } catch (error) {
      console.error('수강 신청 실패:', error);
      // GlobalErrorHandler에서 이미 처리하거나, 
      // 여기서만 띄우려면 Axios 인터셉터 설정을 확인해야 합니다.
      // 현재 두 번 뜨는 이유는 에러 처리기가 겹치기 때문입니다.
    }
  };

  /**
   * 수강 취소
   */
  const cancelEnrollment = async (studentId, lectureId) => {
    if (!confirm('정말 수강을 취소하시겠습니까?')) return;
    
    try {
      const res = await myAxios.delete('/api/enrollments', {
        params: { studentId, lectureId }
      });
      if (res.data.code === '00') {
        alert('수강 취소가 완료되었습니다.');
        await fetchMyEnrollments(studentId);
      }
    } catch (error) {
      console.error('수강 취소 실패:', error);
      alert('수강 취소에 실패했습니다.');
    }
  };

  // [8] 컴포넌트에서 사용할 수 있도록 외부로 공개합니다.
  return { 
    myEnrollments, 
    totalCredits, 
    fetchMyEnrollments,
    applyEnrollment,
    cancelEnrollment
  };
});
