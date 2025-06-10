<template>
  <div class="-mt-2 -mb-3 lg:mb-1">
    <!-- Section title and pagination -->
    <div class="flex items-center justify-between mb-6 mx-8">
      <h2 class="text-md sm:text-xl xl:text-4xl font-bold -ml-8 xl:ml-6">
        {{ title }}
      </h2>
      <div
        :id="`pagination-${carID}`"
        class="pagination-container items-center hidden md:flex"
      ></div>
    </div>

    <div class="relative group">
      <!-- Left navigation button -->
      <button
        v-show="!mouseOver && !isLoading && canGoBack && !isMobileView"
        class="absolute left-0 top-0 h-[calc(100%)] rounded w-2 lg:w-9 px-1 bg-black/50 transition-opacity z-10 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-80"
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

      <!-- Swiper container -->
      <swiper-container
        ref="swiper"
        loop="true"
        :slides-per-view="activeBreakpoint.slidesPerView"
        :space-between="activeBreakpoint.spaceBetween"
        navigation="hidden"
        :slides-offset-before="activeBreakpoint.offsetBefore"
        :slides-offset-after="activeBreakpoint.offsetAfter"
        :speed="800"
        class="group pb-10 mb-9"
        @slidechange="slideChanged"
        :allow-touch-move="isMobileView"
        touch-events-target="container"
        :passive-listeners="true"
      >
        <template v-if="!isLoading">
          <swiper-slide
            v-for="(show, i) in shows"
            :key="`show-${show.id}-${i}`"
            class="rounded-lg transition-transform duration-200 group/slide relative"
          >
            <!-- Ranking Number and Poster Container -->
            <div
              class="relative flex z-10"
              :class="{ 'tenth-item-container': show.ranking === 10 }"
            >
              <!-- Ranking Number with simplified classes -->
              <span
                class="ranking-number"
                :class="{
                  'number-10': show.ranking === 10,
                }"
                >{{ show.ranking }}</span
              >

              <!-- Show poster with simplified sizing -->
              <div
                class="poster-container"
                :class="{ 'tenth-poster': show.ranking === 10 }"
                ref="showRefs"
                :id="`show-${carID}-${show.id}`"
                @mouseenter="startHoverTimer(show.id)"
                @mouseleave="handleMouseLeave"
                @click="isMobileView ? openMobileDetails(show) : null"
              >
                <img
                  :src="`https://image.tmdb.org/t/p/w500${show.poster_path}`"
                  :alt="show.name"
                  class="poster-image"
                  loading="lazy"
                />
              </div>
            </div>

            <!-- Show hover card (teleported to body) -->
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

        <!-- Skeleton loading state -->
        <template v-else>
          <swiper-slide
            v-for="n in 6"
            :key="'skeleton-' + n"
            class="flex-shrink-0 rounded overflow-hidden relative bg-neutral-800 animate-pulse h-[270px]"
          />
        </template>
      </swiper-container>

      <!-- Right navigation button -->
      <button
        v-show="!mouseOver && !isLoading && !isMobileView"
        class="absolute right-0 top-0 h-[calc(100%)] rounded w-6 lg:w-9 px-1 bg-black/50 transition-opacity z-10 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-80"
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
  title: {
    type: String,
    default: "Top 10 TV Shows in USA Today",
  },
  shows: Array,
  isLoading: Boolean,
  logos: Object,
});

const swiper = ref(null);
const carID = computed(() => {
  return `top10tv-${
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
const debounceDelay = 100;
const hoveredShowId = ref(null);
const showMobileDetails = ref(false);
const selectedContentId = ref(null);

const showRefs = ref({});
const cardPosition = reactive({
  top: 0,
  left: 0,
  width: 0,
});

const breakpoints = {
  default: {
    slidesPerView: 2,
    offsetBefore: 30,
    offsetAfter: 30,
    spaceBetween: 10,
    slidesPerGroup: 2,
  },
  sm: {
    slidesPerView: 3,
    offsetBefore: 30,
    offsetAfter: 30,
    minWidth: 40, // 640px
    spaceBetween: 10,
    slidesPerGroup: 3,
  },
  md: {
    slidesPerView: 2.3,
    offsetBefore: 40,
    offsetAfter: 40,
    minWidth: 48, // 768px
    spaceBetween: 10,
    slidesPerGroup: 4,
  },
  lg: {
    slidesPerView: 4.5,
    offsetBefore: 50,
    offsetAfter: 50,
    minWidth: 64, // 1024px
    spaceBetween: 15,
    slidesPerGroup: 4,
  },
  xl: {
    slidesPerView: 4.3,
    offsetBefore: 50,
    offsetAfter: 50,
    minWidth: 80, // 1280px
    spaceBetween: 20,
    slidesPerGroup: 4,
  },
  twoXL: {
    slidesPerView: 4.7,
    offsetBefore: 70,
    offsetAfter: 70,
    minWidth: 100, // 1600px
    spaceBetween: 20,
    slidesPerGroup: 5,
  },
  threeXL: {
    slidesPerView: 8,
    offsetBefore: 80,
    offsetAfter: 80,
    minWidth: 156, // 2496px
    spaceBetween: 20,
    slidesPerGroup: 6,
  },
};

function openMobileDetails(content) {
  if (isMobileView.value) {
    selectedContentId.value = content.id;
    showMobileDetails.value = true;
    console.log("TopTenTVGrid: Opening mobile details for ID:", content.id);
  }
}

function closeMobileDetails() {
  showMobileDetails.value = false;
  selectedContentId.value = null;
}

const activeBreakpoint = ref(breakpoints.default);

const isMobileView = ref(false);

function setActiveBreakpoint() {
  const viewportWidthInRem = window.innerWidth / 16;

  if (viewportWidthInRem >= breakpoints.threeXL.minWidth) {
    activeBreakpoint.value = breakpoints.threeXL;
    isMobileView.value = false;
  } else if (viewportWidthInRem >= breakpoints.twoXL.minWidth) {
    activeBreakpoint.value = breakpoints.twoXL;
    isMobileView.value = false;
  } else if (viewportWidthInRem >= breakpoints.xl.minWidth) {
    activeBreakpoint.value = breakpoints.xl;
    isMobileView.value = false;
  } else if (viewportWidthInRem >= breakpoints.lg.minWidth) {
    activeBreakpoint.value = breakpoints.lg;
    isMobileView.value = false;
  } else if (viewportWidthInRem >= breakpoints.md.minWidth) {
    activeBreakpoint.value = breakpoints.md;
    isMobileView.value = true; // Changed to true for md breakpoint
  } else if (viewportWidthInRem >= breakpoints.sm.minWidth) {
    activeBreakpoint.value = breakpoints.sm;
    isMobileView.value = true;
  } else {
    activeBreakpoint.value = breakpoints.default;
    isMobileView.value = true;
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
  if (sw && props.shows?.length) {
    try {
      setActiveBreakpoint();

      // Calculate items per group based on screen size
      let perGroup;
      const viewportWidthInRem = window.innerWidth / 16;

      sw.allowTouchMove = isMobileView.value;
      sw.params.touchRatio = 1;
      sw.params.touchStartPreventDefault = false;
      sw.params.touchEventsTarget = "container";
      sw.params.passiveListeners = true;

      // Force more items on medium-to-large screens
      if (viewportWidthInRem < 48) {
        // Mobile view
        perGroup = 2;
      } else if (viewportWidthInRem <= 64) {
        // Tablet view
        perGroup = 3;
      } else if (viewportWidthInRem <= 80) {
        // Small desktop view (1024px to 1280px)
        perGroup = 3; // Reduced to show more items per page
      } else {
        // Desktop view
        perGroup = 4;
      }

      // Ensure we always show all 10 shows if possible
      if (props.shows.length >= 10) {
        // Set minimum slides per view based on screen size
        let minSlidesPerView;

        if (viewportWidthInRem >= 100) {
          // 1600px+
          minSlidesPerView = 8; // Show all 10 with room to spare
        } else if (viewportWidthInRem >= 80) {
          // 1280px+
          minSlidesPerView = 6.5; // Force showing all 10
        } else if (viewportWidthInRem >= 64) {
          // 1024px+
          minSlidesPerView = 5.5; // Force showing more than 5
        } else {
          minSlidesPerView = activeBreakpoint.value.slidesPerView;
        }

        sw.params.slidesPerView = Math.max(
          minSlidesPerView,
          sw.params.slidesPerView
        );
      }

      // Add this to ensure lg breakpoint has exactly 3 pages
      if (viewportWidthInRem >= 64 && viewportWidthInRem < 80) {
        maxPages.value = Math.min(3, Math.ceil(props.shows.length / perGroup));
      } else {
        maxPages.value = Math.ceil(props.shows.length / perGroup);
      }

      // Update swiper parameters with correct touch settings
      sw.params = {
        ...sw.params,
        slidesPerView: isMobileView.value
          ? Math.min(4, activeBreakpoint.value.slidesPerView) // <-- Match TopTenMovieGrid
          : Math.max(
              activeBreakpoint.value.slidesPerView,
              viewportWidthInRem >= 64 && viewportWidthInRem < 80
                ? 5.5 // 1024px
                : viewportWidthInRem >= 80 && viewportWidthInRem < 100
                ? 7 // 1280px
                : activeBreakpoint.value.slidesPerView
            ),
        slidesOffsetBefore: activeBreakpoint.value.offsetBefore,
        slidesOffsetAfter: activeBreakpoint.value.offsetAfter,
        spaceBetween: activeBreakpoint.value.spaceBetween,
        slidesPerGroup: perGroup,
        speed: 800,
        loop: true,
        loopAdditionalSlides: 5,
        watchSlidesProgress: true, // Enable watching slides progress
        allowTouchMove: isMobileView.value,
      };

      // Reinforce the touch settings after params update
      sw.allowTouchMove = isMobileView.value;

      sw.slideTo(0, 0, false);
      page.value = 0;
      sw.update();
      updateDots();

      console.log("TopTenTVGrid: Touch enabled:", isMobileView.value);
    } catch (error) {
      console.error("Error updating swiper:", error);
    }
  }
}

let resizeTimer;
function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    setActiveBreakpoint();
    initSwiper();
  }, 200);
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
      const viewportWidthInRem = viewportWidth / 16;

      // Find the show's ranking
      const show = props.shows.find((s) => s.id === showId);
      const isTenthShow = show?.ranking === 10;

      // Calculate card position for hover
      let topPosition =
        viewportWidthInRem >= 80 ? rect.top - 40 : rect.top + 20;
      let leftPosition = rect.left - 105;

      // Adjust for 10th show if needed
      if (isTenthShow) {
        leftPosition -= viewportWidthInRem >= 100 ? 80 : 20;
      }

      cardPosition.top = topPosition;
      cardPosition.left = leftPosition;
      cardPosition.width = rect.width * 1.6;
      cardPosition.height = rect.height;
      cardPosition.scrollX = window.scrollX;
      cardPosition.scrollY = window.scrollY;
    }
  }, 10);

  mouseTimer = setTimeout(() => {
    mouseOver.value = true;
  }, 500);
}

function stopHoverTimer() {
  clearTimeout(mouseTimer);
  mouseOver.value = false;
  hoveredShowId.value = null;
}

function handleMouseLeave(event) {
  // Check if we're moving to the hover card
  if (event.relatedTarget && event.relatedTarget.closest(".tv-hover-card")) {
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
  clearTimeout(leaveTimer);
  mouseOver.value = true;
}

// Watch for show data changes
watch(
  () => props.shows,
  (newVal) => {
    if (newVal && newVal.length) {
      setTimeout(() => initSwiper(), 200);
    }
  },
  { deep: true }
);

onMounted(() => {
  page.value = 0;
  canGoBack.value = false;

  setTimeout(() => {
    setActiveBreakpoint();
    initSwiper();
    window.addEventListener("resize", handleResize);
  }, 300);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  clearTimeout(mouseTimer);
  clearTimeout(leaveTimer);
  clearTimeout(resizeTimer);
});
</script>

<style scoped>
/* Base ranking number styling */
.ranking-number {
  font-size: 13rem;
  font-weight: 700;
  line-height: 1;
  color: #000000;
  text-shadow: -1px -1px 0 rgba(255, 255, 255, 0.5),
    1px -1px 0 rgba(255, 255, 255, 0.5), -1px 1px 0 rgba(255, 255, 255, 0.5),
    1px 1px 0 rgba(255, 255, 255, 0.5);
  margin-right: -2.5rem;
  position: relative;
  z-index: 5;
  opacity: 0.8;
  transform: translateY(5%);
  margin-left: -0.5rem;
}

/* Special styles for the 10th item */
.tenth-item-container {
  display: flex;
  align-items: center;
  position: relative;
  margin-left: -1rem;
  width: auto; /* Allow natural width */
  padding-left: 1.5rem;
  padding-right: 2rem; /* Add right padding to prevent overlap with next item */
  /* Ensure container is wide enough for both elements */
  min-width: max-content;
}

/* Number 10 specific styling */
.number-10 {
  letter-spacing: -0.3em;
  font-size: 13rem;
  margin-right: -1.8rem;
  margin-left: -1rem;
  transform: translateY(-3%); /* Add vertical alignment correction */
  display: inline-block; /* Ensure transform works consistently */
}

/* Poster container */
.poster-container {
  position: relative;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  width: auto;
  min-width: min-content;
}

/* Poster hover effect from Conflix */
.poster-container:hover {
  transform: scale(1.05);
  z-index: 20;
}

/* Tenth poster specific styling */
.tenth-poster {
  position: relative;
  z-index: 15;
  margin-left: 1.2rem;
  min-width: 10rem; /* Ensure minimum width matches poster width */
  width: auto !important; /* Force width to be determined by content */
  flex-shrink: 0; /* Prevent shrinking */
}

/* Poster image styling from Conflix */
.poster-image {
  width: 10rem;
  height: 15rem;
  border-radius: 0.25rem;
  object-fit: cover;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

/* Force the 10th poster to match others */
.tenth-poster .poster-image {
  width: 10rem !important; /* Force width to be identical to other posters */
  height: 15rem;
  min-width: 10rem; /* Add minimum width constraint */
  flex-shrink: 0; /* Prevent shrinking */
}

@media (max-width: 640px) {
  .ranking-number {
    font-size: 8rem;
    margin-right: -1.5rem;
    margin-left: -0.25rem;
  }

  .poster-image {
    width: 7rem;
    height: 10.5rem;
  }

  .number-10 {
    letter-spacing: -0.15em;
    margin-right: -1.2rem;
    margin-left: -0.5rem;
  }

  .tenth-item-container {
    margin-left: -0.5rem;
    padding-left: 1rem;
    padding-right: 1.5rem;
    min-width: max-content;
  }

  .tenth-poster {
    margin-left: 0.8rem;
    min-width: 7rem;
  }

  .tenth-poster .poster-image {
    width: 7rem !important;
    height: 10.5rem;
    min-width: 7rem;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .ranking-number {
    font-size: 10rem;
    margin-right: -2rem;
    margin-left: -0.25rem;
  }

  .poster-image {
    width: 8rem;
    height: 12rem;
  }

  .number-10 {
    letter-spacing: -0.18em;
    margin-right: -1.5rem;
    margin-left: -0.8rem;
  }

  .tenth-item-container {
    margin-left: -0.8rem;
    padding-left: 1.2rem;
    padding-right: 1.8rem;
    min-width: max-content;
  }

  .tenth-poster {
    margin-left: 1rem;
    min-width: 8rem;
  }

  .tenth-poster .poster-image {
    width: 8rem !important;
    height: 12rem;
    min-width: 8rem;
  }
}

/* Fix for 768px breakpoint - Adjust existing section */
@media (min-width: 768px) {
  .ranking-number {
    font-size: 12rem;
    margin-right: -2rem;
    margin-left: -0.25rem;
  }

  .poster-image {
    width: 12rem;
    height: 18rem;
  }

  /* Fix number 10 positioning */
  .number-10 {
    letter-spacing: -0.15em;
    margin-right: -2.5rem;
    margin-left: -0.5rem;
    transform: translateY(-13%);
  }

  /* Fix tenth item container */
  .tenth-item-container {
    margin-left: -0.5rem;
    padding-left: 0.5rem;
    padding-right: 2rem;
    min-width: max-content;
  }

  /* Fix tenth poster positioning */
  .tenth-poster {
    margin-left: 0.5rem;
    min-width: 12rem;
  }

  .tenth-poster .poster-image {
    width: 12rem !important;
    height: 18rem;
    min-width: 12rem;
  }
}

@media (min-width: 1280px) {
  .ranking-number {
    font-size: 15rem;
    margin-right: -3rem;
    margin-left: -1rem;
  }

  .poster-image {
    width: 12rem;
    height: 18rem;
  }

  .number-10 {
    letter-spacing: -0.15em;
    margin-right: -2rem;
    margin-left: -1.5rem;
  }

  .tenth-item-container {
    margin-left: -1.5rem;
    padding-left: 1.8rem;
    padding-right: 2.5rem;
    min-width: max-content;
  }

  .tenth-poster {
    margin-left: 1.5rem;
    min-width: 12rem;
  }

  .tenth-poster .poster-image {
    width: 12rem !important;
    height: 18rem;
    min-width: 12rem;
  }
}

/* Fix for 1024px breakpoint - Add this section */
@media (min-width: 1024px) and (max-width: 1279px) {
  .poster-image {
    width: 9rem !important; /* Wider than current 8rem */
    height: 13.5rem;
    min-width: 9rem !important;
  }

  .tenth-poster .poster-image {
    width: 9rem !important;
    height: 13.5rem;
    min-width: 9rem !important;
  }

  .ranking-number {
    font-size: 12rem;
    margin-right: -2.2rem;
  }

  .number-10 {
    letter-spacing: -0.18em;
    margin-right: -1.8rem;
  }

  /* Reduce some spacing to fit more items */
  :deep(.swiper-slide) {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
}

/* Fix for 1280px breakpoint - Adjust existing section */
@media (min-width: 1280px) and (max-width: 1599px) {
  .poster-image {
    width: 10rem !important; /* Adjust from 12rem to be more balanced */
    height: 15rem;
    min-width: 10rem !important;
  }

  .tenth-poster .poster-image {
    width: 10rem !important;
    height: 15rem;
    min-width: 10rem !important;
  }

  /* Reduce some spacing to fit more items */
  :deep(.swiper-slide) {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
}

/* Add the swiper breakpoints to match Conflix */
:deep(.swiper-container) {
  overflow: visible !important;
  padding: 0 1rem; /* Add padding to the container */
}

:deep(.swiper-slide) {
  transition: transform 0.3s ease;
  padding-left: 1rem; /* Add padding to each slide for better number visibility */
  min-width: min-content !important; /* Ensure slides don't get too cramped */
}

:deep(.swiper-slide:hover) {
  transform: scale(1.02);
}

/* Special class for the 10th slide to provide extra space */
:deep(.swiper-slide:nth-child(10n)) {
  padding-right: 3rem !important; /* Add extra padding after the 10th item */
  min-width: max-content !important;
}

/* Add space between the first item in a loop */
:deep(.swiper-slide:nth-child(1)) {
  padding-left: 2rem; /* Give more space for the first number in loop */
}

/* Adjust pagination bullets styling */
:deep(.swiper-pagination-bullet) {
  margin: 0 4px;
  background-color: rgba(255, 255, 255, 0.4);
}

:deep(.swiper-pagination-bullet-active) {
  background-color: white;
}

/* Add a special class for breakpoints where we need to adjust spacing */
@media (max-width: 1279px) {
  :deep(.swiper-container) {
    padding: 0 1.5rem !important; /* Add more padding on smaller screens */
  }

  :deep(.swiper-slide) {
    padding-left: 1.5rem !important; /* More space between items on smaller screens */
  }

  /* Ensure the last visible slide (may be 9th instead of 10th) has proper spacing */
  :deep(.swiper-slide:last-child) {
    padding-right: 3rem !important;
    min-width: max-content !important;
  }
}

/* Ensure that the swiper shows at least 10 slides on larger screens if available */
@media (min-width: 1280px) {
  :deep(.swiper-container) {
    min-width: 0;
    width: 100%;
  }

  .ranking-number {
    font-size: 15rem;
  }

  /* Adjust spacing for the 10th item directly */
  :deep(.swiper-slide:nth-child(10)) {
    margin-right: 2rem !important;
  }
}

/* Modify spacing behavior for loop state */
:deep(.swiper-wrapper) {
  /* Ensure slides don't get compressed when looping */
  justify-content: flex-start !important;
}

/* Add a bit more spacing to ensure the poster doesn't get cut off */
.tenth-poster .poster-image,
.poster-container:last-child .poster-image {
  margin-right: 1rem;
}

/* Adjustments for 10th poster across different breakpoints */

/* 1024px specific adjustments */
@media (min-width: 1024px) and (max-width: 1279px) {
  /* Increase slides per view and reduce spacing at 1024px */
  :deep(.swiper-container) {
    padding: 0 1.5rem;
  }

  :deep(.swiper-slide) {
    padding-left: 0.8rem !important;
    padding-right: 0.8rem !important;
    transform: scale(0.95);
  }

  /* Make 10th movie visible */
  :deep(.swiper-slide:nth-child(10n)) {
    padding-right: 2.5rem !important;
  }

  /* Reduce spacing between images */
  .ranking-number {
    margin-right: -2.8rem; /* Tighten up number overlap */
  }

  .tenth-item-container {
    margin-left: -0.8rem;
    padding-right: 2rem;
  }

  /* Make 10th item narrower */
  .tenth-poster {
    margin-left: 1rem;
  }

  .number-10 {
    letter-spacing: -0.22em; /* Tighten up number 10 */
    margin-right: -2rem;
  }
}

/* 1280px specific adjustments */
@media (min-width: 1280px) and (max-width: 1599px) {
  /* Increase slides per view and reduce spacing at 1280px */
  :deep(.swiper-container) {
    padding: 0 1.5rem;
  }

  :deep(.swiper-slide) {
    padding-left: 0.8rem !important;
    padding-right: 0.8rem !important;
    transform: scale(0.98);
  }

  /* Make 10th movie visible */
  :deep(.swiper-slide:nth-child(10n)) {
    padding-right: 2.5rem !important;
  }

  .ranking-number {
    margin-right: -2.8rem; /* Tighten up number overlap */
  }
}

/* 1600px specific adjustments - fix 10th poster positioning */
@media (min-width: 1600px) {
  /* Adjust positioning for 10th item */
  :deep(.swiper-slide:nth-child(10n)) {
    padding-right: 4rem !important;
  }

  .tenth-item-container {
    margin-left: -1rem;
    padding-right: 2.8rem !important;
  }

  .tenth-poster {
    margin-left: 1.2rem;
    margin-right: 1rem;
  }

  .number-10 {
    letter-spacing: -0.16em;
    margin-right: -2.2rem;
    margin-left: -1rem;
  }

  /* Adjust spacing for items before 10th */
  :deep(.swiper-slide:nth-child(9n)) {
    padding-right: 1rem !important;
  }
}

/* Fix 10th poster width at all breakpoints */
.tenth-poster {
  display: flex;
  justify-content: center;
}

.tenth-poster .poster-image {
  object-fit: cover;
  flex-shrink: 0;
}

/* Ensure swiper wrapper doesn't compress items */
:deep(.swiper-wrapper) {
  justify-content: flex-start !important;
  align-items: center;
  display: flex !important;
}

/* Add consistent spacing for all pagination controls */
:deep(.swiper-pagination-bullet) {
  margin: 0 4px;
  background-color: rgba(255, 255, 255, 0.4);
}

:deep(.swiper-pagination-bullet-active) {
  background-color: white;
}

/* Add slight scaling to active slide */
:deep(.swiper-slide-active) {
  transform: scale(1.02);
}

/* Enhanced small screen support (phones) */
@media (max-width: 640px) {
  /* Adjust poster sizes to be more visible */
  .poster-image {
    width: 8rem !important;
    height: 12rem !important;
    min-width: 0 !important; /* Allow shrinking when needed */
  }

  /* Make the tenth poster consistent with others */
  .tenth-poster .poster-image {
    width: 8rem !important;
    height: 12rem !important;
    min-width: 0 !important;
  }

  /* Reduce ranking number size to fit better */
  .ranking-number {
    font-size: 6.5rem;
    margin-right: -1.2rem;
    margin-top: 4.5rem;
    opacity: 0.7; /* Make numbers slightly more transparent */
  }

  /* Special adjustments for number 10 */
  .number-10 {
    font-size: 6.5rem;
    letter-spacing: -0.2em;
    margin-right: -0.8rem;
    margin-left: -0.8rem;
    margin-top: 4.5rem; /* Adjust vertical alignment */
  }

  /* Container adjustments */
  .tenth-item-container {
    margin-left: -0.2rem;
    padding-right: 1rem;
    padding-left: 0.5rem;
  }

  /* Fix the tenth poster positioning */
  .tenth-poster {
    margin-left: 0.5rem;
  }

  /* Add extra padding to swiper to prevent edge items from being cut off */
  :deep(.swiper-container) {
    padding: 0 1rem !important;
  }

  /* Ensure last item has proper spacing */
  :deep(.swiper-slide:nth-child(10n)) {
    padding-right: 2rem !important;
  }

  /* Adjust swiper params for very small screens */
  :deep(.swiper-slide) {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
}

/* Fix for very small phones */
@media (max-width: 360px) {
  /* Further adjustments for extra small screens */
  .poster-image,
  .tenth-poster .poster-image {
    width: 7rem !important;
    height: 10.5rem !important;
  }

  .ranking-number,
  .number-10 {
    font-size: 5.5rem;
  }

  /* Reduce padding to fit more content */
  :deep(.swiper-container) {
    padding: 0 0.5rem !important;
  }
}
</style>
