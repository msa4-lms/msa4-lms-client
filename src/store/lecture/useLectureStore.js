import { defineStore } from 'pinia';
import { ref } from 'vue';
import myAxios from '../../api/myAxios';

export const useLectureStore = defineStore('lecture', () => {
    const lectures = ref([]);
    const totalCount = ref(0);
    const loading = ref(false);
    const colleges = ref([]);

    const toTerm = (semester) => {
        if (semester === 'FIRST' || semester === 'SECOND') return semester;
        return Number(semester) === 2 ? 'SECOND' : 'FIRST';
    };

    const formatSchedule = (schedules = []) => {
        const dayLabels = {
            MON: '월요일',
            TUE: '화요일',
            WED: '수요일',
            THU: '목요일',
            FRI: '금요일',
        };
        return schedules
            .map((schedule) => {
                const start = String(Number(schedule.startPeriod || 1) + 8).padStart(2, '0');
                const end = String(Number(schedule.endPeriod || schedule.startPeriod || 1) + 8).padStart(2, '0');
                return `${dayLabels[schedule.dayOfWeek] || schedule.dayOfWeek} ${start}:00 ~ ${end}:50`;
            })
            .join(', ');
    };

    const normalizeLecture = (lecture) => ({
        ...lecture,
        id: lecture.classId ?? lecture.id,
        lectureId: lecture.classId ?? lecture.lectureId ?? lecture.id,
        currentEnrollment: lecture.currentEnrollmentCount ?? lecture.currentEnrollment ?? 0,
        schedule: lecture.schedule || formatSchedule(lecture.schedules),
    });

    const fetchLectures = async (searchParams) => {
        loading.value = true;
        try {
            lectures.value = [];
            totalCount.value = 0;
        } catch (error) {
            console.error('강의 조회 실패:', error);
        } finally {
            loading.value = false;
        }
    };

    const fetchMyLectures = async (searchParams) => {
        loading.value = true;
        try {
            const response = await myAxios.get('/api/academic/classes', {
                params: {
                    page: searchParams?.page || 1,
                    size: searchParams?.size || 20,
                    academicYear: searchParams?.year || searchParams?.academicYear,
                    term: searchParams?.semester || searchParams?.term
                        ? toTerm(searchParams?.semester || searchParams?.term)
                        : undefined,
                },
            });
            if (response.data.code === '00') {
                const data = response.data.data || {};
                const items = Array.isArray(data.items) ? data.items : [];
                lectures.value = items.map(normalizeLecture);
                totalCount.value = data.totalCount ?? lectures.value.length;
            }
        } catch (error) {
            console.error('나의 강의 조회 실패:', error);
        } finally {
            loading.value = false;
        }
    };

    const fetchColleges = async () => {
        try {
            colleges.value = [];
        } catch (error) {
            console.error('단과대 및 학과 조회 실패:', error);
        }
    };

    return {
        lectures,
        totalCount,
        loading,
        colleges,
        fetchLectures,
        fetchMyLectures,
        fetchColleges,
    };
});
