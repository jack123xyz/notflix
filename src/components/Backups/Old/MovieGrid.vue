<template>
  <div class="mb-8">
    <div class="flex items-center justify-between mb-4 mx-8">
      <h2 class="text-md md:text-lg xl:text-4xl font-bold -ml-4 xl:ml-6">
        {{ title }}
      </h2>
      <div
        :id="`pagination-${carID}`"
        class="pagination-container items-center hidden md:flex"
      ></div>
    </div>

    <div class="relative group">
      <!-- left button - hide on mobile -->
      <button
        v-show="!mouseOver && !isLoading && canGoBack && !isMobileView"
        class="absolute left-0 top-0 xl:h-[calc(82%)] 2xl:h-[calc(77.5%)] 3xl:h-[calc(82%)] rounded xl:w-8 2xl:w-12 3xl:w-13 px-1 bg-black/50 transition-opacity z-10 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-80"
        @click="goPrevious"
        aria-label="Previous"
      >
        <svg viewBox="0 0 1024 1024" class="w-6 h-6">
          <path
            d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z"
            fill="#ffffff"
          />
        </svg>
      </button>

      <swiper-container
        :key="layoutKey"
        ref="swiper"
        loop="true"
        :slides-per-view="activeBreakpoint.slidesPerView"
        :space-between="10"
        :slides-offset-before="activeBreakpoint.offsetBefore"
        :slides-offset-after="activeBreakpoint.offsetAfter"
        :speed="800"
        class="group 2xl:pb-12 xl:pb-7"
        @slidechange="slideChanged"
        touch-events-target="container"
        :allow-touch-move="isMobileView"
      >
        <template v-if="!isLoading">
          <swiper-slide
            v-for="(movie, i) in movies"
            :key="`movie-${movie.id}-${i}`"
            class="rounded-lg transition-transform duration-200 group/slide relative"
            @mouseenter="startHoverTimer(movie.id)"
            @mouseleave="handleMouseLeave"
            @click="isMobileView ? openMobileDetails(movie) : null"
          >
            <!-- Base movie tile -->
            <div
              class="transition-transform duration-300 cursor-pointer"
              ref="movieRefs"
              :id="`movie-${carID}-${movie.id}`"
            >
              <img
                :src="
                  isPortraitView
                    ? getMovieImage(movie.poster_path)
                    : getMovieImage(movie.backdrop_path)
                "
                :alt="movie.title"
                class="rounded-lg w-full"
                :class="
                  isPortraitView
                    ? 'aspect-[2/3] object-cover'
                    : 'aspect-video object-cover'
                "
                loading="lazy"
              />
              <div
                class="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 via-black/10 to-transparent rounded-lg pointer-events-none"
              >
                <img
                  v-if="logos?.[movie.id] && !isMobileView"
                  :src="getMovieImage(logos[movie.id])"
                  :alt="movie.title + ' Logo'"
                  class="max-h-12 w-auto drop-shadow-lg"
                  draggable="false"
                />
                <span v-else class=""></span>
              </div>
            </div>

            <!-- hover card -->
            <teleport to="body">
              <MovieHoverCard
                v-if="hoveredMovieId === movie.id && mouseOver"
                :movie="movie"
                :logo="logos?.[movie.id]"
                :position="cardPosition"
                @keep-hover="keepHoverOpen"
                @end-hover="stopHoverTimer"
              />
            </teleport>
          </swiper-slide>
        </template>

        <template v-else>
          <swiper-slide
            v-for="n in 6"
            :key="'skeleton-' + n"
            class="flex-shrink-0 rounded overflow-hidden relative bg-neutral-800 animate-pulse"
            :class="isPortraitView ? 'aspect-[2/3]' : 'aspect-video'"
          />
        </template>
      </swiper-container>

      <!-- right button - hide on mobile -->
      <button
        v-show="!mouseOver && !isLoading && !isMobileView"
        class="absolute right-0 top-0 xl:h-[calc(82%)] 2xl:h-[calc(77.5%)] 3xl:h-[calc(82%)] rounded xl:w-6 2xl:w-12 3xl:w-13 px-1 bg-black/50 transition-opacity z-10 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-80"
        @click="goNext"
        aria-label="Next"
      >
        <svg viewBox="0 0 1024 1024" class="w-6 h-6">
          <path
            d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z"
            fill="#ffffff"
          />
        </svg>
      </button>
    </div>
  </div>
  <teleport to="body">
    <MobileDetails
      v-if="showMobileDetails && selectedContentId"
      :contentId="selectedContentId"
      contentType="movie"
      @close="closeMobileDetails"
    />
  </teleport>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  watch,
  reactive,
  onBeforeUnmount,
} from "vue";
import { register } from "swiper/element/bundle";
import MovieHoverCard from "@/components/Grids/MovieHoverCard.vue";
import MobileDetails from "@/components/Mobile/MobileDetails.vue";
register();

const props = defineProps({
  title: String,
  movies: Array,
  isLoading: Boolean,
  logos: Object,
});

const swiper = ref(null);
const isMobileView = ref(false);

const showMobileDetails = ref(false);
const selectedContentId = ref(null);

function openMobileDetails(content) {
  console.log("openMobileDetails called", {
    isMobileView: isMobileView.value,
    content,
    contentId: content?.id,
  });

  if (isMobileView.value) {
    selectedContentId.value = content.id;
    showMobileDetails.value = true;
    console.log("Mobile details should be visible now", {
      selectedContentId: selectedContentId.value,
      showMobileDetails: showMobileDetails.value,
    });
  }
}

function closeMobileDetails() {
  showMobileDetails.value = false;
  selectedContentId.value = null;
}

const carID = computed(() => {
  return `car-${
    props.title?.replace(/[^a-z0-9]/gi, "-").toLowerCase() ||
    Math.floor(Math.random() * 10000)
  }`;
});

let page = ref(0);
let maxPages = ref(1);
const canGoBack = ref(false);
const mouseOver = ref(false);
let mouseTimer = null;
let leaveTimer = null;
const debounceDelay = 100; // milliseconds
const hoveredMovieId = ref(null);

const movieRefs = ref({});
const cardPosition = reactive({
  top: 0,
  left: 0,
  width: 0,
});

const breakpoints = {
  mobile: {
    slidesPerView: 3.2,
    offsetBefore: 16,
    offsetAfter: 16,
    maxWidth: 30, // 30rem = 480px (smaller phones)
  },
  mobileLarge: {
    slidesPerView: 4.2, // Show more tiles on larger mobile screens
    offsetBefore: 16,
    offsetAfter: 16,
    minWidth: 30, // Start at 480px
    maxWidth: 48, // 48rem = 768px (md breakpoint)
  },
  medium: {
    slidesPerView: 4.3, // Fewer slides = larger posters
    offsetBefore: 32,
    offsetAfter: 24,
    minWidth: 48, // Start at md breakpoint (768px)
    maxWidth: 64, // End at lg breakpoint (1024px)
  },
  default: {
    //xl?
    slidesPerView: 4.3,
    offsetBefore: 40,
    offsetAfter: 30,
  },
  twoXL: {
    slidesPerView: 6.35,
    offsetBefore: 50,
    offsetAfter: 50,
    minWidth: 100, // 100rem
  },
  threeXL: {
    slidesPerView: 6.3,
    offsetBefore: 60,
    offsetAfter: 50,
    minWidth: 156, // 156rem
  },
};

const activeBreakpoint = ref(breakpoints.default);
const isPortraitView = ref(window.matchMedia("(max-width: 1023px)").matches);

const layoutKey = ref(0);

function setActiveBreakpoint() {
  const viewportRem = window.innerWidth / 16;

  isPortraitView.value = window.matchMedia("(max-width: 1023px)").matches;

  if (viewportRem <= breakpoints.mobile.maxWidth) {
    activeBreakpoint.value = breakpoints.mobile;
    isMobileView.value = true;
  } else if (viewportRem <= breakpoints.medium.maxWidth) {
    activeBreakpoint.value = breakpoints.medium;
    isMobileView.value = true;
  } else if (viewportRem >= breakpoints.threeXL.minWidth) {
    activeBreakpoint.value = breakpoints.threeXL;
    isMobileView.value = false;
  } else if (viewportRem >= breakpoints.twoXL.minWidth) {
    activeBreakpoint.value = breakpoints.twoXL;
    isMobileView.value = false;
  } else {
    activeBreakpoint.value = breakpoints.default;
    isMobileView.value = false;
  }

  setTimeout(() => {
    if (swiper.value?.swiper) {
      swiper.value.swiper.params.slidesPerView =
        activeBreakpoint.value.slidesPerView;
      swiper.value.swiper.params.slidesOffsetBefore =
        activeBreakpoint.value.offsetBefore;
      swiper.value.swiper.params.slidesOffsetAfter =
        activeBreakpoint.value.offsetAfter;
      swiper.value.swiper.update();
    }
  }, 0);
}

function initSwiper() {
  let sw = swiper.value?.swiper;
  if (sw && props.movies?.length) {
    try {
      setActiveBreakpoint();

      const perGroup = Math.max(4, Math.ceil(props.movies.length / 3));
      maxPages.value = Math.min(3, Math.ceil(props.movies.length / perGroup));

      sw.params = {
        ...sw.params,
        slidesPerView: activeBreakpoint.value.slidesPerView,
        slidesOffsetBefore: activeBreakpoint.value.offsetBefore,
        slidesOffsetAfter: activeBreakpoint.value.offsetAfter,
        slidesPerGroup: perGroup,
        speed: 800,
        loop: true,

        allowTouchMove: isMobileView.value,
        touchEventsTarget: "container",
        touchRatio: 1,
        touchAngle: 45,
        touchStartPreventDefault: false,

        preventClicks: false,
        preventClicksPropagation: false,
        touchMoveStopPropagation: false,

        noSwiping: !isMobileView.value,
        noSwipingClass: "swiper-no-swiping",
      };

      if (!isMobileView.value) {
        sw.allowTouchMove = false;
      } else {
        sw.allowTouchMove = true;
      }

      sw.slideTo(0, 0, false);
      page.value = 0;
      sw.update();
      updateDots();

      console.log(
        "MovieGrid: Swiper initialized with touch:",
        isMobileView.value
      );
    } catch (error) {
      console.error("Error updating swiper:", error);
    }
  }
}

let resizeTimer;
function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const wasPortrait = isPortraitView.value;
    isPortraitView.value = window.matchMedia("(max-width: 1023px)").matches;

    // Force re-render if portrait mode changed
    if (wasPortrait !== isPortraitView.value) {
      layoutKey.value++; // Increment to force re-render
      console.log(
        "Layout changed to:",
        isPortraitView.value ? "portrait" : "landscape"
      );
    }

    setActiveBreakpoint();
    initSwiper();
  }, 200);
}

function getMovieImage(path) {
  if (!path) return "";
  return `https://image.tmdb.org/t/p/w500${path}`;
}

function updateDots() {
  const dotsBox = document.getElementById(`pagination-${carID.value}`);
  if (!dotsBox) return;
  dotsBox.innerHTML = "";
  for (let i = 0; i < maxPages.value; i++) {
    const d = document.createElement("span");
    if (i === page.value) {
      d.className = "swiper-pagination-bullet swiper-pagination-bullet-active";
    } else {
      d.className = "swiper-pagination-bullet";
    }
    d.onclick = () => jumpToPage(i);
    dotsBox.appendChild(d);
  }
}

function jumpToPage(idx) {
  if (!swiper.value?.swiper) return;
  page.value = idx;
  const slideGroup = swiper.value.swiper.params.slidesPerGroup;
  swiper.value.swiper.slideTo(idx * slideGroup);
}

function goNext() {
  if (!swiper.value?.swiper) return;
  let sw = swiper.value.swiper;
  page.value = (page.value + 1) % maxPages.value;
  if (!canGoBack.value) {
    canGoBack.value = true;
  }
  sw.slideTo(page.value * sw.params.slidesPerGroup);
  updateDots();
}

function goPrevious() {
  if (!swiper.value?.swiper || !canGoBack.value) return;
  let sw = swiper.value.swiper;
  page.value = (page.value - 1 + maxPages.value) % maxPages.value;
  sw.slideTo(page.value * sw.params.slidesPerGroup);
  updateDots();
}

function slideChanged() {
  if (!swiper.value?.swiper) return;
  let sw = swiper.value.swiper;
  let groupSize = sw.params.slidesPerGroup;
  page.value = Math.floor(sw.realIndex / groupSize) % maxPages.value;
  updateDots();
}

function startHoverTimer(movieId) {
  // Skip hover functionality on mobile devices
  if (isMobileView.value) return;

  hoveredMovieId.value = movieId;

  // Clear any existing timers to prevent conflicts
  clearTimeout(mouseTimer);
  clearTimeout(leaveTimer);

  // Calculate position of the hovered element
  setTimeout(() => {
    const element = document.getElementById(`movie-${carID.value}-${movieId}`);
    if (element) {
      const rect = element.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      // Store both viewport coordinates and scroll position
      cardPosition.top = rect.top;
      cardPosition.left = rect.left;
      cardPosition.width = rect.width;
      cardPosition.height = rect.height;

      // Add these two lines to capture scroll position
      cardPosition.scrollX = window.scrollX;
      cardPosition.scrollY = window.scrollY;

      // Dynamically determine if this is a right-edge tile by checking
      // how close it is to the right edge of the viewport
      cardPosition.isRightEdge = viewportWidth - (rect.left + rect.width) < 100;
    }
  }, 0);

  mouseTimer = setTimeout(() => {
    mouseOver.value = true;
  }, 500);
}

function stopHoverTimer() {
  clearTimeout(mouseTimer);
  mouseOver.value = false;
  hoveredMovieId.value = null;
}

function handleMouseLeave(event) {
  // Check if we're moving to the hover card
  // This prevents the flicker effect
  if (event.relatedTarget && event.relatedTarget.closest(".movie-hover-card")) {
    return;
  }

  // Otherwise, start a timer before actually closing
  clearTimeout(leaveTimer);
  leaveTimer = setTimeout(() => {
    stopHoverTimer();
  }, debounceDelay);
}

function keepHoverOpen() {
  clearTimeout(mouseTimer);
  clearTimeout(leaveTimer); // Also clear the leave timer
  mouseOver.value = true;
}

// Make sure to call setActiveBreakpoint during mounting
onMounted(() => {
  page.value = 0;
  canGoBack.value = false;

  setTimeout(() => {
    setActiveBreakpoint();
    initSwiper();
    window.addEventListener("resize", handleResize);
  }, 300);
});

// Add a cleanup method
function beforeUnmount() {
  // Clear any timers to prevent memory leaks
  clearTimeout(mouseTimer);
  clearTimeout(leaveTimer);

  // Reset hover states
  mouseOver.value = false;
  hoveredMovieId.value = null;
}

onBeforeUnmount(() => {
  beforeUnmount();
  window.removeEventListener("resize", handleResize);
  clearTimeout(resizeTimer);
});

watch(
  () => props.movies,
  (newVal) => {
    if (newVal && newVal.length) {
      setTimeout(() => initSwiper(), 200);
    }
  },
  { deep: true }
);
</script>

<style>
/* Add this to your existing styles to prevent interaction issues */
.swiper-no-swiping {
  pointer-events: none;
}

/* Your existing styles */
swiper-container::part(button-prev),
swiper-container::part(button-next) {
  display: none;
}

.swiper-pagination-bullet {
  width: 12px;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.5);
  margin-right: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0;
}

.swiper-pagination-bullet-active {
  background-color: rgba(255, 255, 255, 1);
}
</style>
