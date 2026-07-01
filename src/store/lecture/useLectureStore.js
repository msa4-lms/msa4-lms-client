import { defineStore } from 'pinia';
import { ref } from 'vue';
import myAxios from '../../api/myAxios';

export const useLectureStore = defineStore('lecture', () => {
    const lectures = ref([]);
    const totalCount = ref(0);
    const loading = ref(false);
    const colleges = ref([]);

    const fetchLectures = async (searchParams) => {
        loading.value = true;
        try {
            const response = await myAxios.get('/api/lectures', { params: searchParams });
            if (response.data.code === '00') {
                lectures.value = response.data.data.lectures;
                totalCount.value = response.data.data.totalCount;
            }
        } catch (error) {
            console.error('강의 조회 실패:', error);
        } finally {
            loading.value = false;
        }
    };

    const fetchMyLectures = async (searchParams) => {
        loading.value = true;
        try {
            const response = await myAxios.get('/api/professor/lectures', { params: searchParams });
            if (response.data.code === '00') {
                lectures.value = response.data.data;
                totalCount.value = response.data.data.length;
            }
        } catch (error) {
            console.error('나의 강의 조회 실패:', error);
        } finally {
            loading.value = false;
        }
    };

    const fetchColleges = async () => {
        try {
            const response = await myAxios.get('/api/lectures/colleges');
            if (response.data.code === '00') {
                colleges.value = response.data.data;
            }
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
