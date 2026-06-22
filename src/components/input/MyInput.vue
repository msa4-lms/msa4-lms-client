<script setup>
const props = defineProps({
  modelValue: [String, Number],
  type: {
    type: String,
    default: "text",
  },
  placeholder: String,
  modelModifiers: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:modelValue", "keyup-enter"]);

const updateValue = (event) => {
  const value = props.modelModifiers.trim
    ? event.target.value.trim()
    : event.target.value;

  emit("update:modelValue", value);
};
</script>

<template>
  <input
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    @input="updateValue"
    @keyup.enter="emit('keyup-enter')"
  />
</template>

<style scoped>
input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>
