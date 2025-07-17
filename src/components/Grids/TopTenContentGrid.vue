<template>
  <div class="-mt-2 -mb-3 lg:mb-1">
    <div class="flex items-center justify-between mb-6 mx-8">
      <h2
        class="text-md sm:text-md xl:text-4xl font-bold -ml-8 sm:ml-4 xl:ml-6"
      >
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
        class="absolute left-0 top-0 h-[calc(100%)] xl:h-[calc(88%)] 2xl:h-[calc(88%)] 3xl:h-[calc(88%)] rounded w-2 lg:w-9 px-1 bg-black/50 transition-opacity z-10 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-80"
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
            v-for="(item, i) in contentItems"
            :key="`item-${item.id}-${i}`"
            class="rounded-lg transition-transform duration-200 group/slide relative"
          >
            <div
              class="relative flex z-10"
              :class="{ 'tenth-item-container': item.ranking === 10 }"
            >
              <span
                class="ranking-number"
                :class="{
                  'number-10': item.ranking === 10,
                }"
                >{{ item.ranking }}</span
              >

              <div
                class="poster-container"
                :class="{ 'tenth-poster': item.ranking === 10 }"
                :id="`item-${carID}-${item.id}`"
                @mouseenter="startHoverTimer(item.id)"
                @mouseleave="handleMouseLeave"
                @click="handleContentClick(item)"
              >
                <img
                  :src="`https://image.tmdb.org/t/p/w500${item.poster_path}`"
                  :alt="item.title || item.name"
                  class="poster-image"
                  loading="lazy"
                />
              </div>
            </div>

            <teleport to="body">
              <ContentHoverCard
                v-if="hoveredItemId === item.id && mouseOver"
                :item="item"
                :logo="logos?.[item.id]"
                :position="cardPosition"
                :contentType="contentType"
                :overrideScaleFactor="cardPosition.overrideScaleFactor"
                :overrideVerticalOffset="cardPosition.overrideVerticalOffset"
                @keep-hover="keepHoverOpen"
                @end-hover="stopHoverTimer"
                @openModal="handleOpenModalFromHoverCard"
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
        class="absolute right-0 top-0 h-[calc(100%)] xl:h-[calc(88%)] 2xl:h-[calc(88%)] 3xl:h-[calc(88%)] rounded w-6 lg:w-9 px-1 bg-black/50 transition-opacity z-10 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-80"
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
      :contentType="contentType"
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

import ContentHoverCard from "@/components/ContentHoverCard/ContentHoverCard.vue";
import MobileDetails from "@/components/Mobile/MobileDetails.vue";
register();

const props = defineProps({
  contentType: {
    type: String,
    default: "movie",
    validator: (value) => ["movie", "tv"].includes(value),
  },
  title: {
    type: String,
    default: null,
  },
  items: Array,
  movies: Array,
  shows: Array,
  isLoading: Boolean,
  logos: Object,
});

const defaultTitle = computed(() => {
  return props.contentType === "movie"
    ? "Top 10 Movies in USA Today"
    : "Top 10 TV Shows in USA Today";
});

const computedTitle = computed(() => {
  return props.title || defaultTitle.value;
});

const contentItems = computed(() => {
  if (props.items && props.items.length) return props.items;
  return props.contentType === "movie" ? props.movies || [] : props.shows || [];
});

const swiper = ref(null);
const carID = computed(() => {
  const prefix = props.contentType === "movie" ? "top10" : "top10tv";
  return `${prefix}-${
    computedTitle.value?.replace(/[^a-z0-9]/gi, "-").toLowerCase() ||
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
const hoveredItemId = ref(null);
const showMobileDetails = ref(false);
const selectedContentId = ref(null);

const cardPosition = reactive({
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  scrollX: 0,
  scrollY: 0,
  isRightEdge: false,
  overrideScaleFactor: null,
  overrideVerticalOffset: null,
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
    console.log(
      `Opening mobile details for ${props.contentType} ID:`,
      content.id
    );
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
    isMobileView.value = true;
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
  if (!sw || !contentItems.value?.length) return;

  try {
    setActiveBreakpoint();
    const viewportWidthInRem = window.innerWidth / 16;

    sw.allowTouchMove = isMobileView.value;
    sw.params.touchRatio = 1;
    sw.params.touchStartPreventDefault = false;
    sw.params.touchEventsTarget = "container";
    sw.params.passiveListeners = true;

    let perGroup;

    if (viewportWidthInRem < 48) {
      perGroup = 2;
    } else if (viewportWidthInRem <= 64) {
      perGroup = 3;
    } else if (viewportWidthInRem <= 80) {
      perGroup = 3;
    } else {
      perGroup = 4;
    }

    if (contentItems.value.length >= 10) {
      let minSlidesPerView;

      if (viewportWidthInRem >= 100) {
        // +
        minSlidesPerView = 8;
      } else if (viewportWidthInRem >= 80) {
        // 1280px+
        minSlidesPerView = 6.5;
      } else if (viewportWidthInRem >= 64) {
        // 1024px+
        minSlidesPerView = 5.5;
      } else {
        minSlidesPerView = activeBreakpoint.value.slidesPerView;
      }

      sw.params.slidesPerView = Math.max(
        minSlidesPerView,
        sw.params.slidesPerView
      );
    }

    if (viewportWidthInRem >= 156) {
      maxPages.value = Math.min(
        2,
        Math.ceil(contentItems.value.length / perGroup)
      );
    } else if (viewportWidthInRem >= 64 && viewportWidthInRem < 80) {
      maxPages.value = Math.min(
        3,
        Math.ceil(contentItems.value.length / perGroup)
      );
    } else {
      maxPages.value = Math.ceil(contentItems.value.length / perGroup);
    }

    sw.params = {
      ...sw.params,
      slidesPerView: isMobileView.value
        ? Math.min(4, activeBreakpoint.value.slidesPerView)
        : Math.max(
            activeBreakpoint.value.slidesPerView,
            viewportWidthInRem >= 64 && viewportWidthInRem < 80
              ? 5.5
              : viewportWidthInRem >= 80 && viewportWidthInRem < 100
              ? 7
              : activeBreakpoint.value.slidesPerView
          ),
      slidesOffsetBefore: activeBreakpoint.value.offsetBefore,
      slidesOffsetAfter: activeBreakpoint.value.offsetAfter,
      spaceBetween: activeBreakpoint.value.spaceBetween,
      slidesPerGroup: perGroup,
      speed: 800,
      loop: true,
      loopAdditionalSlides: 5,
      watchSlidesProgress: true,
      allowTouchMove: isMobileView.value,
    };

    sw.allowTouchMove = isMobileView.value;

    sw.slideTo(0, 0, false);
    page.value = 0;
    sw.update();
    updateDots();

    console.log(
      `TopTenContentGrid (${props.contentType}): Touch enabled:`,
      isMobileView.value
    );
  } catch (error) {
    console.error("Error updating swiper:", error);
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

function startHoverTimer(itemId) {
  if (isMobileView.value) return;

  hoveredItemId.value = itemId;

  clearTimeout(mouseTimer);
  clearTimeout(leaveTimer);

  setTimeout(() => {
    const element = document.getElementById(`item-${carID.value}-${itemId}`);

    if (element) {
      const rect = element.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportWidthInRem = viewportWidth / 16;

      cardPosition.top = rect.top;
      cardPosition.left = rect.left;
      cardPosition.width = rect.width;
      cardPosition.height = rect.height;
      cardPosition.scrollX = window.scrollX;
      cardPosition.scrollY = window.scrollY;

      cardPosition.overrideScaleFactor = 2.8;
      cardPosition.overrideVerticalOffset = viewportWidthInRem >= 80 ? -70 : 20;

      cardPosition.isRightEdge = viewportWidth - (rect.left + rect.width) < 150;
    }
  }, 10);

  mouseTimer = setTimeout(() => {
    mouseOver.value = true;
  }, 500);
}

function stopHoverTimer() {
  clearTimeout(mouseTimer);
  mouseOver.value = false;
  hoveredItemId.value = null;
}

function handleMouseLeave(event) {
  const selector =
    props.contentType === "movie" ? ".movie-hover-card" : ".tv-hover-card";
  if (event.relatedTarget && event.relatedTarget.closest(selector)) {
    return;
  }

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

const emit = defineEmits(["content-click"]);

function handleContentClick(item) {
  if (isMobileView.value) {
    openMobileDetails(item);
  } else {
    emit("content-click", {
      id: item.id,
      media_type: props.contentType,
    });
  }
}

function handleOpenModalFromHoverCard(payload) {
  if (!isMobileView.value) {
    emit("content-click", {
      id: payload.id,
      media_type: payload.contentType,
    });
  }
  stopHoverTimer();
}

watch(
  () => contentItems.value,
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

.tenth-item-container {
  display: flex;
  align-items: center;
  position: relative;
  margin-left: -1rem;
  width: auto;
  padding-left: 1.5rem;
  padding-right: 2rem;
  min-width: max-content;
}

.number-10 {
  letter-spacing: -0.3em;
  font-size: 13rem;
  margin-right: -1.8rem;
  margin-left: -1rem;
  transform: translateY(-3%);
  display: inline-block;
}

.poster-container {
  position: relative;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  width: auto;
  min-width: min-content;
}

.poster-container:hover {
  transform: scale(1.05);
  z-index: 20;
}

.tenth-poster {
  position: relative;
  z-index: 15;
  margin-left: 1.2rem;
  min-width: 10rem;
  width: auto !important;
  flex-shrink: 0;
}

.poster-image {
  width: 10rem;
  height: 15rem;
  border-radius: 0.25rem;
  object-fit: cover;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.tenth-poster .poster-image {
  width: 10rem !important;
  height: 15rem;
  min-width: 10rem;
  flex-shrink: 0;
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

  .number-10 {
    letter-spacing: -0.15em;
    margin-right: -2.5rem;
    margin-left: -0.5rem;
    transform: translateY(-13%);
  }

  .tenth-item-container {
    margin-left: -0.5rem;
    padding-left: 0.5rem;
    padding-right: 2rem;
    min-width: max-content;
  }

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

@media (min-width: 1024px) and (max-width: 1279px) {
  .poster-image {
    width: 9rem !important;
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

  :deep(.swiper-slide) {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
}

@media (min-width: 1280px) and (max-width: 1599px) {
  .poster-image {
    width: 10rem !important;
    height: 15rem;
    min-width: 10rem !important;
  }

  .tenth-poster .poster-image {
    width: 10rem !important;
    height: 15rem;
    min-width: 10rem !important;
  }

  :deep(.swiper-slide) {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
}

:deep(.swiper-container) {
  overflow: visible !important;
  padding: 0 1rem;
}

:deep(.swiper-slide) {
  transition: transform 0.3s ease;
  padding-left: 1rem;
  min-width: min-content !important;
}

:deep(.swiper-slide:hover) {
  transform: scale(1.02);
}

:deep(.swiper-slide:nth-child(10n)) {
  padding-right: 3rem !important;
  min-width: max-content !important;
}

:deep(.swiper-slide:nth-child(1)) {
  padding-left: 2rem;
}

:deep(.swiper-pagination-bullet) {
  margin: 0 4px;
  background-color: rgba(255, 255, 255, 0.4);
}

:deep(.swiper-pagination-bullet-active) {
  background-color: white;
}

@media (max-width: 1279px) {
  :deep(.swiper-container) {
    padding: 0 1.5rem !important;
  }

  :deep(.swiper-slide) {
    padding-left: 1.5rem !important;
  }

  :deep(.swiper-slide:last-child) {
    padding-right: 3rem !important;
    min-width: max-content !important;
  }
}

@media (min-width: 1280px) {
  :deep(.swiper-container) {
    min-width: 0;
    width: 100%;
  }

  .ranking-number {
    font-size: 15rem;
  }

  :deep(.swiper-slide:nth-child(10)) {
    margin-right: 2rem !important;
  }
}

:deep(.swiper-wrapper) {
  justify-content: flex-start !important;
}

.tenth-poster .poster-image,
.poster-container:last-child .poster-image {
  margin-right: 1rem;
}

@media (min-width: 1024px) and (max-width: 1279px) {
  :deep(.swiper-container) {
    padding: 0 1.5rem;
  }

  :deep(.swiper-slide) {
    padding-left: 0.8rem !important;
    padding-right: 0.8rem !important;
    transform: scale(0.95);
  }

  :deep(.swiper-slide:nth-child(10n)) {
    padding-right: 2.5rem !important;
  }

  .ranking-number {
    margin-right: -2.8rem;
  }

  .tenth-item-container {
    margin-left: -0.8rem;
    padding-right: 2rem;
  }

  .tenth-poster {
    margin-left: 1rem;
  }

  .number-10 {
    letter-spacing: -0.22em;
    margin-right: -2rem;
  }
}

@media (min-width: 1280px) and (max-width: 1599px) {
  :deep(.swiper-container) {
    padding: 0 1.5rem;
  }

  :deep(.swiper-slide) {
    padding-left: 0.8rem !important;
    padding-right: 0.8rem !important;
    transform: scale(0.98);
  }

  :deep(.swiper-slide:nth-child(10n)) {
    padding-right: 2.5rem !important;
  }

  .ranking-number {
    margin-right: -2.8rem;
  }
}

@media (min-width: 1600px) {
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

  :deep(.swiper-slide:nth-child(9n)) {
    padding-right: 1rem !important;
  }
}

.tenth-poster {
  display: flex;
  justify-content: center;
}

.tenth-poster .poster-image {
  object-fit: cover;
  flex-shrink: 0;
}

:deep(.swiper-wrapper) {
  justify-content: flex-start !important;
  align-items: center;
  display: flex !important;
}

:deep(.swiper-pagination-bullet) {
  margin: 0 4px;
  background-color: rgba(255, 255, 255, 0.4);
}

:deep(.swiper-pagination-bullet-active) {
  background-color: white;
}

:deep(.swiper-slide-active) {
  transform: scale(1.02);
}

@media (max-width: 640px) {
  .poster-image {
    width: 8rem !important;
    height: 12rem !important;
    min-width: 0 !important;
  }

  .tenth-poster .poster-image {
    width: 8rem !important;
    height: 12rem !important;
    min-width: 0 !important;
  }

  .ranking-number {
    font-size: 6.5rem;
    margin-right: -1.2rem;
    margin-top: 4.5rem;
    opacity: 0.7;
  }

  .number-10 {
    font-size: 6.5rem;
    letter-spacing: -0.2em;
    margin-right: -0.8rem;
    margin-left: -0.8rem;
    margin-top: 4.5rem;
  }

  .tenth-item-container {
    margin-left: -0.2rem;
    padding-right: 1rem;
    padding-left: 0.5rem;
  }

  .tenth-poster {
    margin-left: 0.5rem;
  }

  :deep(.swiper-container) {
    padding: 0 1rem !important;
  }

  :deep(.swiper-slide:nth-child(10n)) {
    padding-right: 2rem !important;
  }

  :deep(.swiper-slide) {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
}

@media (max-width: 360px) {
  .poster-image,
  .tenth-poster .poster-image {
    width: 7rem !important;
    height: 10.5rem !important;
  }

  .ranking-number,
  .number-10 {
    font-size: 5.5rem;
  }

  :deep(.swiper-container) {
    padding: 0 0.5rem !important;
  }
}
</style>
