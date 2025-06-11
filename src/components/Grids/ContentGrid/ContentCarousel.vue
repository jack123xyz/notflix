<template>
  <div class="mb-8 mt-4 lg:mt-0">
    <div class="flex items-center justify-between mb-4 mx-8">
      <h2
        class="text-md xl:text-lg 2xl:text-xl 3xl:text-4xl font-bold ml-2 xl:ml-6"
      >
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
        v-show="!isHoverCardActive && !isLoading && canGoBack && !isMobileView"
        class="absolute left-0 top-0 lg:h-[calc(100%)] xl:h-[calc(86%)] 2xl:h-[calc(77.5%)] 3xl:h-[calc(82%)] rounded lg:w-9.5 xl:w-9 2xl:w-12 3xl:w-13 px-1 bg-black/50 transition-opacity z-10 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-80"
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
        :space-between="4"
        :slides-offset-before="activeBreakpoint.offsetBefore"
        :slides-offset-after="activeBreakpoint.offsetAfter"
        :speed="800"
        class="group 2xl:pb-12 xl:pb-7 touch-swiper"
        @slidechange="slideChanged"
        touch-events-target="container"
        :allow-touch-move="true"
        :loop-additional-slides="
          Math.max(8, Math.ceil(activeBreakpoint.slidesPerView))
        "
        observer="true"
        observer-parents="true"
      >
        <template v-if="!isLoading">
          <CarouselItem
            v-for="(item, i) in displayItems"
            :key="`item-${item.id}-${i}${
              item._uniqueKey ? '-' + item._uniqueKey : ''
            }`"
            :item="item"
            :logo="logos?.[item.id]"
            :carID="carID"
            :isPortraitView="isPortraitView"
            :isMobileView="isMobileView"
            :contentType="contentType"
            @item-click="handleContentClick"
            @open-modal="handleOpenModalFromHoverCard"
            @hover-active="onHoverActive"
            @hover-inactive="onHoverInactive"
          />
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
        v-show="!isHoverCardActive && !isLoading && !isMobileView"
        class="absolute right-0 top-0 lg:h-[calc(100%)] xl:h-[calc(86%)] 2xl:h-[calc(77.5%)] 3xl:h-[calc(83%)] rounded lg:w-10 xl:w-15 2xl:w-12 3xl:w-15 px-1 bg-black/50 transition-opacity z-10 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-80"
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
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import { register } from "swiper/element/bundle";
import CarouselItem from "./CarouselItem.vue";
import MobileDetails from "@/components/Mobile/MobileDetails.vue";
register();

const props = defineProps({
  contentType: {
    type: String,
    default: "movie",
    validator: (value) => ["movie", "tv"].includes(value),
  },
  title: String,
  items: Array,
  movies: Array,
  shows: Array,
  isLoading: Boolean,
  logos: Object,
});

const contentItems = computed(() => {
  if (props.items && props.items.length) return props.items;
  return props.contentType === "movie" ? props.movies || [] : props.shows || [];
});

const swiper = ref(null);
const isMobileView = ref(window.innerWidth < 1024);
const showMobileDetails = ref(false);
const selectedContentId = ref(null);
const isHoverCardActive = ref(false);

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

const carID = computed(() => {
  const prefix = props.contentType === "movie" ? "movie" : "tv";
  return `${prefix}-${
    props.title?.replace(/[^a-z0-9]/gi, "-").toLowerCase() ||
    Math.floor(Math.random() * 10000)
  }`;
});

let page = ref(0);
let maxPages = ref(1);
const canGoBack = ref(false);

const breakpoints = {
  mobile: {
    slidesPerView: 3.2,
    offsetBefore: 16,
    offsetAfter: 16,
    maxWidth: 30,
  },
  mobileLarge: {
    slidesPerView: 4.2,
    offsetBefore: 16,
    offsetAfter: 16,
    minWidth: 30,
    maxWidth: 48,
  },
  medium: {
    slidesPerView: 4.3,
    offsetBefore: 32,
    offsetAfter: 24,
    minWidth: 48,
    maxWidth: 64,
  },
  default: {
    slidesPerView: 4.35,
    offsetBefore: 40,
    offsetAfter: 30,
  },
  twoXL: {
    slidesPerView: 6.35,
    offsetBefore: 50,
    offsetAfter: 50,
    minWidth: 100,
  },
  threeXL: {
    slidesPerView: 6.3,
    offsetBefore: 60,
    offsetAfter: 50,
    minWidth: 156,
  },
};

const activeBreakpoint = ref(breakpoints.default);
const isPortraitView = ref(window.matchMedia("(max-width: 1023px)").matches);
const layoutKey = ref(0);

function setActiveBreakpoint() {
  const viewportWidth = window.innerWidth;
  const viewportRem = viewportWidth / 16;
  isPortraitView.value = viewportWidth < 1024;
  if (viewportRem <= breakpoints.mobile.maxWidth) {
    activeBreakpoint.value = breakpoints.mobile;
    isMobileView.value = true;
  } else if (viewportRem < breakpoints.medium.maxWidth) {
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
  if (sw && displayItems.value?.length) {
    try {
      setActiveBreakpoint();
      const isMobile = window.innerWidth < 1024;
      isMobileView.value = isMobile;
      let adjustedSlidesPerView = activeBreakpoint.value.slidesPerView;
      if (contentItems.value.length < adjustedSlidesPerView * 1.5) {
        adjustedSlidesPerView = Math.max(1, contentItems.value.length / 2);
      }
      let currentSlidesPerGroup;
      if (isMobileView.value) {
        currentSlidesPerGroup = 1;
      } else {
        currentSlidesPerGroup = Math.min(
          2,
          Math.max(1, Math.floor(adjustedSlidesPerView / 3))
        );
      }
      const viewportRem = window.innerWidth / 16;
      const targetDotsDesktop =
        viewportRem >= breakpoints.threeXL.minWidth
          ? 5
          : viewportRem >= breakpoints.twoXL.minWidth
          ? 4
          : 3;
      if (
        currentSlidesPerGroup > 0 &&
        contentItems.value &&
        contentItems.value.length > 0
      ) {
        const totalSlides = Math.min(30, contentItems.value.length);
        maxPages.value = Math.ceil(totalSlides / currentSlidesPerGroup);
        if (!isMobileView.value) {
          if (maxPages.value < 3 && totalSlides >= currentSlidesPerGroup * 3) {
            maxPages.value = 3;
          }
          maxPages.value = Math.min(targetDotsDesktop, maxPages.value);
        }
        maxPages.value = Math.max(1, maxPages.value);
      } else {
        maxPages.value = 1;
      }
      sw.params = {
        ...sw.params,
        slidesPerView: adjustedSlidesPerView,
        slidesOffsetBefore: activeBreakpoint.value.offsetBefore,
        slidesOffsetAfter: activeBreakpoint.value.offsetAfter,
        slidesPerGroup: currentSlidesPerGroup,
        speed: 800,
        loop: true,
        rewind: false,
        loopFillGroupWithBlank: false,
        loopAdditionalSlides: Math.max(8, Math.ceil(adjustedSlidesPerView) * 2),
        loopPreventsSlide: false,
        loopedSlides: Math.max(
          displayItems.value.length,
          adjustedSlidesPerView * 3
        ),
        virtualTranslate: false,
        allowTouchMove: true,
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
      sw.update();
      sw.slideToLoop(0, 0, false);
      page.value = 0;
      sw.updateSlides();
      sw.updateSize();
      sw.updateProgress();
      sw.updateSlidesClasses();
      canGoBack.value = sw.realIndex > 0;
      sw.slideToLoop(0, 0, false);
      page.value = 0;
      sw.updateSlides();
      sw.updateSize();
      sw.updateProgress();
      sw.updateSlidesClasses();
      updateDots();
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
    if (wasPortrait !== isPortraitView.value) {
      layoutKey.value++;
    }
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
  swiper.value.swiper.slideToLoop(
    idx * swiper.value.swiper.params.slidesPerGroup
  );
}

function goNext() {
  if (!swiper.value?.swiper) return;
  let sw = swiper.value.swiper;
  if (!canGoBack.value) {
    canGoBack.value = true;
  }
  sw.slideNext(800);
  if (sw.realIndex !== undefined) {
    page.value =
      Math.floor(sw.realIndex / sw.params.slidesPerGroup) % maxPages.value;
  } else {
    page.value = (page.value + 1) % maxPages.value;
  }
  updateDots();
}

function goPrevious() {
  if (!swiper.value?.swiper) return;
  let sw = swiper.value.swiper;
  sw.slidePrev(800);
  if (sw.realIndex !== undefined) {
    const newPage = Math.floor(sw.realIndex / sw.params.slidesPerGroup);
    page.value = newPage % maxPages.value;
  } else {
    page.value = (page.value - 1 + maxPages.value) % maxPages.value;
  }
  updateDots();
}

function slideChanged() {
  if (!swiper.value?.swiper) return;
  let sw = swiper.value.swiper;
  if (
    sw.params.slidesPerGroup > 0 &&
    contentItems.value &&
    contentItems.value.length > 0
  ) {
    const currentMaxPages = Math.max(1, maxPages.value);
    if (sw.realIndex >= 0) {
      page.value =
        Math.floor(sw.realIndex / sw.params.slidesPerGroup) % currentMaxPages;
    } else {
      page.value = 0;
    }
  } else {
    page.value = 0;
  }
  updateDots();
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
  isHoverCardActive.value = false;
}

function onHoverActive() {
  isHoverCardActive.value = true;
}

function onHoverInactive() {
  isHoverCardActive.value = false;
}

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
  if (swiper.value?.swiper) {
    try {
      if (swiper.value.swiper.params) {
        swiper.value.swiper.params.loop = false;
      }
      swiper.value.swiper.update();
    } catch (e) {
      console.error("Error disabling swiper loop:", e);
    }
  }
  window.removeEventListener("resize", handleResize);
  clearTimeout(resizeTimer);
});

watch(
  () => contentItems.value,
  (newVal) => {
    if (newVal && newVal.length) {
      setTimeout(() => initSwiper(), 200);
    }
  },
  { deep: true }
);

const displayItems = computed(() => {
  if (!contentItems.value || contentItems.value.length === 0) return [];
  const minRequired = Math.ceil(activeBreakpoint.value?.slidesPerView || 6) * 4;
  if (contentItems.value.length < minRequired) {
    const repetitions = Math.ceil(minRequired / contentItems.value.length);
    const duplicated = [];
    for (let i = 0; i < repetitions; i++) {
      contentItems.value.forEach((item, index) => {
        duplicated.push({
          ...item,
          _uniqueKey: `${i}-${index}`,
        });
      });
    }
    return duplicated;
  }
  return contentItems.value;
});
</script>

<style>
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

/* Add these styles to ensure touch events work */
.touch-swiper {
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
}

swiper-slide {
  touch-action: pan-y;
  user-select: none;
}
</style>
