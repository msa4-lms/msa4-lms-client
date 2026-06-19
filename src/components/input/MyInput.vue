<script setup>
const props = defineProps({
  modelValue: String,
  type: {
    type: String,
    default: "text",
  },
  placeholder: String,
});

const emit = defineEmits(["update:modelValue", "keyup-enter"]);
</script>

<template>
  <input
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    @input="emit('update:modelValue', $event.target.value)"
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
