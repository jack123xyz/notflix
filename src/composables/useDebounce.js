import { ref, watch } from "vue";

export function useDebounce(value, delay = 300) {
  const debouncedValue = ref(value.value);
  let timeout;

  watch(value, (newValue) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      debouncedValue.value = newValue;
    }, delay);
  });

  return debouncedValue;
}
