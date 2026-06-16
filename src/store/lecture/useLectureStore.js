import { defineStore } from 'pinia';
import { ref } from 'vue';
import myAxios from '../../api/myAxios';

export const useLectureStore = defineStore('lecture', () => {
    const lectures = ref([]);
    const totalCount = ref(0);
    const loading = ref(false);

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

    return {
        lectures,
        totalCount,
        loading,
        fetchLectures,
    };
});
