<template>
  <div class="mb-8">
    <h3 class="text-2xl text-white mb-4 tracking-wide">{{ title }}</h3>
    <div class="relative group">
      <div
        ref="scrollContainer"
        class="flex space-x-4 overflow-x-hidden scroll-smooth carousel-scroll"
        @scroll="updateScrollButtonVisibility"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @mousedown.prevent="isMobileView && handleMouseDown"
        @mousemove.prevent="isMobileView && isMouseDown && handleMouseMove"
        @mouseup="isMobileView && handleMouseUp"
        @mouseleave="isMobileView && handleMouseUp"
      >
        <img
          v-for="(avatar, index) in avatars"
          :key="index"
          :src="avatar"
          :class="[
            'w-30 h-30 flex-shrink-0 cursor-pointer transition-all border-4',
            currentAvatar === avatar
              ? 'border-white scale-105'
              : 'border-transparent hover:scale-105',
          ]"
          @click="$emit('select', avatar)"
        />
      </div>
      <!-- Scroll Buttons -->
      <button
        v-if="canScrollLeft"
        class="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-[calc(100%)] hidden md:block"
        @click.stop="scroll('left')"
      >
        <svg
          viewBox="0 0 1024 1024"
          class="w-6 h-6 pointer-events-none"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          fill="#FFFFFF"
        >
          <path
            d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z"
            class="pointer-events-none"
          ></path>
        </svg>
      </button>
      <button
        v-if="canScrollRight"
        class="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-[calc(100%)] hidden md:block"
        @click.stop="scroll('right')"
      >
        <svg
          viewBox="0 0 1024 1024"
          class="w-6 h-6 pointer-events-none"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          fill="#FFFFFF"
        >
          <path
            d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z"
            class="pointer-events-none"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";

defineProps({
  title: String,
  avatars: Array,
  currentAvatar: String,
});

defineEmits(["select"]);

const scrollContainer = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

const touchStartX = ref(0);
const currentTouchX = ref(0);
const isTouching = ref(false);
const isMouseDown = ref(false);
const mouseStartX = ref(0);

const isMobileView = ref(false);

function checkMobileView() {
  isMobileView.value = window.innerWidth < 768;
}

function scroll(direction) {
  if (!scrollContainer.value) return;

  const scrollAmountPerClick = scrollContainer.value.clientWidth * 0.75;

  const scrollValue =
    direction === "left" ? -scrollAmountPerClick : scrollAmountPerClick;
  scrollContainer.value.scrollBy({ left: scrollValue, behavior: "smooth" });
}

function updateScrollButtonVisibility() {
  if (!scrollContainer.value) return;
  const el = scrollContainer.value;

  const tolerance = 1;

  canScrollLeft.value = el.scrollLeft > tolerance;
  canScrollRight.value =
    el.scrollLeft < el.scrollWidth - el.clientWidth - tolerance;
}

function preventWheelScroll(event) {
  if (scrollContainer.value && scrollContainer.value.contains(event.target)) {
    event.preventDefault();
  }
}

// Touch event handlers
function handleTouchStart(event) {
  if (!isMobileView.value) return;

  touchStartX.value = event.touches[0].clientX;
  currentTouchX.value = touchStartX.value;
  isTouching.value = true;
}

function handleTouchMove(event) {
  if (!isTouching.value || !isMobileView.value) return;

  const touchX = event.touches[0].clientX;
  const deltaX = touchX - currentTouchX.value;

  currentTouchX.value = touchX;

  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft -= deltaX;
  }
}

function handleTouchEnd() {
  isTouching.value = false;
}

function handleMouseDown(event) {
  isMouseDown.value = true;
  mouseStartX.value = event.clientX;

  if (scrollContainer.value) {
    scrollContainer.value.style.cursor = "grabbing";
  }
}

function handleMouseMove(event) {
  if (!isMouseDown.value) return;

  const deltaX = event.clientX - mouseStartX.value;
  mouseStartX.value = event.clientX;

  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft -= deltaX;
  }
}

function handleMouseUp() {
  isMouseDown.value = false;

  if (scrollContainer.value) {
    scrollContainer.value.style.cursor = "";
  }
}

onMounted(async () => {
  await nextTick();
  updateScrollButtonVisibility();

  checkMobileView();

  window.addEventListener("resize", checkMobileView);

  if (scrollContainer.value) {
    scrollContainer.value.addEventListener("wheel", preventWheelScroll, {
      passive: false,
    });
  }
});

onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener("wheel", preventWheelScroll);
  }

  window.removeEventListener("resize", checkMobileView);
});
</script>

<style scoped>
.carousel-scroll::-webkit-scrollbar {
  display: none;
}

.carousel-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;
  touch-action: pan-y pinch-zoom;
}

@media (max-width: 768px) {
  .carousel-scroll {
    cursor: grab;
  }
}
</style>
