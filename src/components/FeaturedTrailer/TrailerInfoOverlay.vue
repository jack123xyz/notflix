<template>
  <div
    class="absolute left-0 w-full h-[50vh] min-h-[350px] max-h-[650px] top-1/2 -translate-y-1/2 flex flex-col"
  >
    <div
      class="text-white z-30 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-sm xl:max-w-3xl 2xl:max-w-3xl 3xl:max-w-5xl"
      :class="[
        showDescription
          ? 'mt-10 lg:mt-12 xl:mt-16 2xl:mt-20 3xl:mt-1'
          : 'mt-16 lg:mt-20 xl:mt-24 2xl:mt-28 3xl:mt-40',
      ]"
      :style="{
        marginLeft: leftMargin,
        transformOrigin: 'left center',
        transform: logoLarge
          ? 'translate3d(0, 0, 0) scale(1)'
          : 'translate3d(0, 0, 0) scale(0.8)',
        transition: 'transform 1000ms cubic-bezier(0.2, 0, 0.2, 1)',
      }"
    >
      <img
        v-if="logoPath"
        :src="`https://image.tmdb.org/t/p/original${logoPath}`"
        alt="Movie Logo"
        :class="logoStyle"
        draggable="false"
      />
      <h1
        v-else
        class="font-bold drop-shadow-lg mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
      >
        {{ title }}
      </h1>

      <transition name="fade">
        <div v-if="showDescription">
          <p
            class="text-base sm:text-lg md:text-xl lg:text-sm xl:text-lg 2xl:text-xl 3xl:text-2xl font-semibold text-white/90 text-shadow-sm mt-4 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-md xl:max-w-xl 2xl:max-w-2xl"
          >
            {{ overview }}
          </p>
        </div>
      </transition>

      <slot />
    </div>

    <div
      class="transition-all duration-1000"
      :style="{
        marginLeft: leftMargin,
        marginTop: logoLarge ? (showDescription ? '2rem' : '2rem') : '3rem',
        transform: logoLarge ? 'translateY(0)' : 'translateY(-1rem)',
      }"
    ></div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  title: String,
  overview: String,
  logoPath: String,
  movieId: Number,
  contentType: String,
  genres: Array,
  showDescription: Boolean,
  logoLarge: Boolean,
  hideTrailerOnSmallScreen: Boolean,
});

const logoStyle = computed(() => {
  let styles = "w-auto drop-shadow-lg ";
  if (props.logoLarge) {
    styles +=
      "max-h-32 sm:max-h-40 md:max-h-48 lg:max-h-45 lg:max-w-[75%] xl:max-h-20 2xl:max-h-34 2xl:max-w-[80%] 3xl:max-h-72";
  } else {
    styles +=
      "max-h-24 sm:max-h-28 md:max-h-32 lg:max-h-25 xl:max-h-35 2xl:max-h-44 3xl:max-h-48 opacity-90";
  }
  return styles;
});

const windowWidth = ref(window.innerWidth);

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => window.addEventListener("resize", handleResize));
onUnmounted(() => window.removeEventListener("resize", handleResize));

const leftMargin = computed(() => {
  const w = windowWidth.value;
  if (w < 640) return "1.5rem";
  if (w < 1024) return "3rem";
  if (w < 1536) return "2rem";
  if (w < 1940) return "5rem";
  return "6rem";
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
