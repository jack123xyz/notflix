<template>
  <div v-if="mounted">
    <slot />
  </div>
  <div v-else class="animate-pulse bg-gray-800 rounded-lg" :style="placeholder">
    <!-- Loading placeholder -->
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  placeholder: {
    type: Object,
    default: () => ({ height: "200px" }),
  },
});

const mounted = ref(false);

onMounted(() => {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      mounted.value = true;
    });
  } else {
    setTimeout(() => {
      mounted.value = true;
    }, 100);
  }
});
</script>
