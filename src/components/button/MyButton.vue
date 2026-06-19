<script setup>
// 부모에게 저 이름으로 key가 올 것임
const props = defineProps({
  btnType: {
    type: String,
    default: "button",
  }, // 'button', 'submit', 'reset'
  size: String, // 'big', 'middle', 'small'
  color: String, // 'deep-blue', 'white', 'gray'
  content: String,
  disabled: Boolean,
});

const emit = defineEmits(["click"]);
</script>

<template>
  <button
    :type="props.btnType"
    :class="[props.color, props.size]"
    :disabled="props.disabled"
    @click="emit('click')"
  >
    {{ props.content }}
  </button>
</template>

<style scoped>
button {
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;

  transition: all 0.2s ease;
}

button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.big {
  width: 180px;
  height: 40px;
  font-size: 16px;
  font-weight: 500;
}

.middle {
  width: 120px;
  height: 38px;
  font-size: 15px;
  font-weight: 500;
}

.small {
  width: 62px;
  height: 38px;
  font-size: 14px;
  font-weight: 500;
}

.deep-blue {
  background-color: var(--primary-color);
  color: var(--personal-color-white);
}

.black {
  background-color: var(--personal-color-black);
  color: var(--personal-color-white);
}

.gray {
  background-color: var(--personal-color-gray);
  color: var(--personal-color-white);
}

.white {
  background-color: var(--personal-color-white);
  color: var(--personal-color-black);
}

.red {
  background-color: var(--personal-color-red);
  color: var(--personal-color-white);
}

.green {
  background-color: var(--personal-color-green);
  color: var(--personal-color-white);
}
</style>
