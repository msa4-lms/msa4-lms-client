<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useEnrollmentStore } from "../../store/enrollment/useEnrollmentStore";
import MyButton from "../../components/button/MyButton.vue";
import MyPageContainer from "../../components/layout/MyPageContainer.vue";
import MySearchFilter from "../../components/search/MySearchFilter.vue";
import MyTable from "../../components/table/MyTable.vue";
import myAxios from "../../api/myAxios";
import { notify, confirmDialog } from "../../composables/useDialog";

const route = useRoute();
const enrollmentStore = useEnrollmentStore();
const submitting = ref(false);

const now = new Date();
const selectedYear = ref(now.getFullYear());
const selectedSemester = ref(now.getMonth() + 1 >= 1 && now.getMonth() + 1 <= 6 ? 1 : 2);
const selectedEnrollmentId = ref("");

const questions = [
  { key: "CONTENT_QUALITY", label: "강의 내용은 학습 목표에 맞게 구성되었나요?" },
  { key: "DELIVERY_CLARITY", label: "교수자의 설명은 이해하기 쉬웠나요?" },
  { key: "FAIR_GRADING", label: "평가 기준과 성적 산정 방식은 공정했나요?" },
  { key: "LEARNING_SUPPORT", label: "질문과 학습 지원이 충분했나요?" },
  { key: "OVERALL_SATISFACTION", label: "강의 전반에 만족하나요?" },
];

const form = reactive({
  ratings: questions.reduce((acc, question) => {
    acc[question.key] = 5;
    return acc;
  }, {}),
  comment: "",
});

const selectedEnrollment = computed(() =>
  enrollmentStore.myEnrollments.find(
    (enrollment) => String(enrollment.enrollmentId) === String(selectedEnrollmentId.value)
  )
);

const evaluationColumns = [
  { key: "question", label: "평가 문항" },
  { key: "score", label: "점수" },
];

const loadEnrollments = async () => {
  await enrollmentStore.fetchMyEnrollments(selectedYear.value, selectedSemester.value);
  const queryEnrollmentId = route.query.enrollmentId;
  if (
    queryEnrollmentId &&
    enrollmentStore.myEnrollments.some(
      (enrollment) => String(enrollment.enrollmentId) === String(queryEnrollmentId)
    )
  ) {
    selectedEnrollmentId.value = String(queryEnrollmentId);
    return;
  }
  selectedEnrollmentId.value = enrollmentStore.myEnrollments[0]?.enrollmentId
    ? String(enrollmentStore.myEnrollments[0].enrollmentId)
    : "";
};

const submitEvaluation = async () => {
  if (!selectedEnrollmentId.value) {
    await notify("평가할 강의를 선택해주세요.");
    return;
  }

  if (!(await confirmDialog("강의평가를 제출하시겠습니까? 제출 후 수정할 수 없습니다."))) {
    return;
  }

  submitting.value = true;
  try {
    await myAxios.post("/api/academic/evaluations", {
      enrollmentId: Number(selectedEnrollmentId.value),
      ratings: { ...form.ratings },
      comment: form.comment.trim() || null,
    });
    await notify("강의평가가 제출되었습니다.");
  } catch (error) {
    console.error("강의평가 제출 실패:", error);
  } finally {
    submitting.value = false;
  }
};

watch([selectedYear, selectedSemester], loadEnrollments);

onMounted(loadEnrollments);
</script>

<template>
  <MyPageContainer
    title="강의 평가"
    subtitle="성적 공개 전에 수강 강의 평가를 제출합니다."
  >
    <MySearchFilter @search="loadEnrollments">
      <div class="search-group compact">
        <label>조회 연도</label>
        <input v-model="selectedYear" type="number" min="1900" max="9999" />
      </div>
      <div class="search-group compact">
        <label>학기</label>
        <select v-model="selectedSemester">
          <option :value="1">1학기</option>
          <option :value="2">2학기</option>
        </select>
      </div>
      <div class="search-group wide">
        <label>강의</label>
        <select v-model="selectedEnrollmentId">
          <option value="">강의를 선택하세요</option>
          <option
            v-for="enrollment in enrollmentStore.myEnrollments"
            :key="enrollment.enrollmentId"
            :value="String(enrollment.enrollmentId)"
          >
            {{ enrollment.courseName }} / {{ enrollment.professorName }}
          </option>
        </select>
      </div>
    </MySearchFilter>

    <section v-if="selectedEnrollment" class="lecture-summary">
      <div>
        <span>과목코드</span>
        <strong>{{ selectedEnrollment.courseCode }}</strong>
      </div>
      <div>
        <span>강의명</span>
        <strong>{{ selectedEnrollment.courseName }}</strong>
      </div>
      <div>
        <span>담당교수</span>
        <strong>{{ selectedEnrollment.professorName }}</strong>
      </div>
      <div>
        <span>학점</span>
        <strong>{{ selectedEnrollment.credits }}학점</strong>
      </div>
    </section>

    <section class="evaluation-card">
      <div class="common-section-header">
        <h3>평가 문항</h3>
      </div>

      <MyTable
        :columns="evaluationColumns"
        :loading="enrollmentStore.loading"
        :empty="!selectedEnrollment"
        emptyMessage="평가할 수강 강의가 없습니다."
      >
        <tr v-for="question in questions" :key="question.key">
          <td class="question-cell">{{ question.label }}</td>
          <td>
            <select v-model.number="form.ratings[question.key]" class="score-select">
              <option v-for="score in [5, 4, 3, 2, 1]" :key="score" :value="score">
                {{ score }}점
              </option>
            </select>
          </td>
        </tr>
      </MyTable>

      <div class="comment-field">
        <label for="evaluationComment">서술 의견</label>
        <textarea
          id="evaluationComment"
          v-model="form.comment"
          maxlength="2000"
          rows="5"
          placeholder="강의에 대한 의견을 입력하세요."
        ></textarea>
      </div>

      <div class="actions">
        <MyButton
          btnType="button"
          color="deep-blue"
          size="middle"
          :disabled="submitting || !selectedEnrollment"
          :content="submitting ? '제출 중' : '평가 제출'"
          @click="submitEvaluation"
        />
      </div>
    </section>
  </MyPageContainer>
</template>

<style scoped>
.compact {
  flex: 0 0 130px;
}

.wide {
  flex: 0 0 320px;
}

.lecture-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}

.lecture-summary div {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px;
  background: #fff;
  border: 1px solid #edf2f7;
  border-radius: 8px;
}

.lecture-summary span,
.comment-field label {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
}

.lecture-summary strong {
  color: #172033;
  font-size: 1rem;
}

.evaluation-card {
  background: #fff;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  padding: 18px;
}

.question-cell {
  text-align: left !important;
}

.score-select {
  width: 92px;
  height: 36px;
  border: 1px solid #d9e2ec;
  border-radius: 4px;
  padding: 0 10px;
  background: #fff;
}

.comment-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 22px;
}

.comment-field textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid #d9e2ec;
  border-radius: 6px;
  padding: 12px;
  color: #172033;
  line-height: 1.5;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

@media (max-width: 900px) {
  .lecture-summary {
    grid-template-columns: 1fr;
  }
}
</style>
