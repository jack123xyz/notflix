<template>
  <div class="mb-8">
    <!-- Add xl:mt-2 to reduce top margin at xl breakpoint -->
    <div class="flex items-center justify-between mb-6 mx-8">
      <h2 class="text-md md:text-lg xl:text-4xl font-bold -ml-4 xl:ml-6">
        {{ title }}
      </h2>
      <div
        :id="`pagination-${carID}`"
        class="pagination-container items-center hidden md:flex"
      ></div>
    </div>

    <div class="relative group">
      <!-- left button - adjusted height -->
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

      <!-- swiper container - add direct breakpoint settings -->
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
            v-for="(show, i) in shows"
            :key="`show-${show.id}-${i}`"
            class="rounded-lg transition-transform duration-200 group/slide relative"
            @mouseenter="startHoverTimer(show.id)"
            @mouseleave="handleMouseLeave"
            @click="isMobileView ? openMobileDetails(show) : null"
          >
            <!-- Base TV show tile -->
            <div
              class="transition-transform duration-300 cursor-pointer"
              ref="showRefs"
              :id="`show-${carID}-${show.id}`"
            >
              <img
                :src="
                  isPortraitView
                    ? getShowImage(show.poster_path)
                    : getShowImage(show.backdrop_path)
                "
                :alt="show.name"
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
                  v-if="logos?.[show.id] && !isMobileView"
                  :src="getShowImage(logos[show.id])"
                  :alt="show.name + ' Logo'"
                  class="max-h-12 w-auto drop-shadow-lg"
                  draggable="false"
                />
                <span v-else class=""></span>
              </div>
            </div>

            <!-- Use teleport for the hover card -->
            <teleport to="body">
              <TVHoverCard
                v-if="hoveredShowId === show.id && mouseOver"
                :show="show"
                :logo="logos?.[show.id]"
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

      <!-- right button -->
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
      contentType="tv"
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
import TVHoverCard from "@/components/Grids/TVHoverCard.vue";
import MobileDetails from "@/components/Mobile/MobileDetails.vue";
register();

const props = defineProps({
  title: String,
  shows: Array,
  isLoading: Boolean,
  logos: Object,
});

const swiper = ref(null);
const isMobileView = ref(false);

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
const hoveredShowId = ref(null);
const showMobileDetails = ref(false);
const selectedContentId = ref(null);

const showRefs = ref({}); // Changed from movieRefs
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
    maxWidth: 48, // 48rem = 768px (md breakpoint)
  },
  medium: {
    slidesPerView: 3.3, // Fewer slides = larger posters
    offsetBefore: 32,
    offsetAfter: 24,
    minWidth: 48, // Start at md breakpoint (768px)
    maxWidth: 64, // End at lg breakpoint (1024px)
  },
  default: {
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

// Reactive reference to the current breakpoint settings
const activeBreakpoint = ref(breakpoints.default);

const isPortraitView = ref(window.matchMedia("(max-width: 1023px)").matches);

// reactive reference to force re-render on layout changes
const layoutKey = ref(0);

function setActiveBreakpoint() {
  const viewportRem = window.innerWidth / 16;

  // Update portrait view when breakpoints change
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

  // Force swiper to update with new values
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

// Replace the initSwiper function with this updated version
function initSwiper() {
  let sw = swiper.value?.swiper;
  if (sw && props.shows?.length) {
    try {
      setActiveBreakpoint();

      const perGroup = Math.max(4, Math.ceil(props.shows.length / 3));
      maxPages.value = Math.min(3, Math.ceil(props.shows.length / perGroup));

      // Enhanced swiper parameters with safer touch handling
      sw.params = {
        ...sw.params,
        slidesPerView: activeBreakpoint.value.slidesPerView,
        slidesOffsetBefore: activeBreakpoint.value.offsetBefore,
        slidesOffsetAfter: activeBreakpoint.value.offsetAfter,
        slidesPerGroup: perGroup,
        speed: 800,
        loop: true,

        // Improved touch handling to avoid the matches() error
        allowTouchMove: isMobileView.value,
        touchEventsTarget: "container",
        touchRatio: 1,
        touchAngle: 45,
        touchStartPreventDefault: false,

        // Disable all extra processing of touch events
        preventClicks: false,
        preventClicksPropagation: false,
        touchMoveStopPropagation: false,

        // Make sure we don't try to use 'matches' on events
        noSwiping: !isMobileView.value,
        noSwipingClass: "swiper-no-swiping",
      };

      // Directly set touch behavior without using event delegation
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

// Updated resize handler
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

function getShowImage(path) {
  // Changed from getMovieImage
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

function startHoverTimer(showId) {
  // Skip hover functionality on mobile devices
  if (isMobileView.value) return;

  hoveredShowId.value = showId;

  // Clear any existing timers to prevent conflicts
  clearTimeout(mouseTimer);
  clearTimeout(leaveTimer);

  // Calculate position of the hovered element
  setTimeout(() => {
    const element = document.getElementById(`show-${carID.value}-${showId}`);
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

      console.log(
        "Element position:",
        rect.left,
        rect.width,
        "Viewport width:",
        viewportWidth
      );
      console.log("Is right edge?", cardPosition.isRightEdge);
    }
  }, 0);

  mouseTimer = setTimeout(() => {
    mouseOver.value = true;
  }, 500);
}

function stopHoverTimer() {
  clearTimeout(mouseTimer);
  mouseOver.value = false;
  hoveredShowId.value = null; // Changed from hoveredMovieId
}

function handleMouseLeave(event) {
  // Check if we're moving to the hover card
  // This prevents the flicker effect
  if (event.relatedTarget && event.relatedTarget.closest(".tv-hover-card")) {
    // Changed from .movie-hover-card
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
  hoveredShowId.value = null; // Changed from hoveredMovieId
}

onBeforeUnmount(() => {
  beforeUnmount();
  window.removeEventListener("resize", handleResize);
  clearTimeout(resizeTimer);
});

watch(
  () => props.shows,
  (newVal) => {
    if (newVal && newVal.length) {
      setTimeout(() => initSwiper(), 200);
    }
  },
  { deep: true }
);

function openMobileDetails(content) {
  if (isMobileView.value) {
    selectedContentId.value = content.id;
    showMobileDetails.value = true;
  }
}

function closeMobileDetails() {
  showMobileDetails.value = false;
  selectedContentId.value = null;
}
</script>

<style>
/* Add this to your existing styles to prevent interaction issues */
.swiper-no-swiping {
  pointer-events: none;
}

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
