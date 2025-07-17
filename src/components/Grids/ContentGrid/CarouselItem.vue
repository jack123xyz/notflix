<template>
  <swiper-slide
    class="rounded-lg transition-transform duration-200 group/slide relative"
    @mouseenter="startHoverTimer"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <!-- Base content tile -->
    <div
      class="transition-transform duration-300 cursor-pointer"
      :id="`item-${carID}-${item.id}`"
    >
      <img
        :src="
          isPortraitView
            ? getContentImage(item.poster_path)
            : getContentImage(item.backdrop_path)
        "
        :alt="item.title || item.name"
        class="rounded-lg w-full"
        :class="
          isPortraitView
            ? 'aspect-[2/3] object-cover'
            : 'aspect-video object-cover'
        "
        loading="lazy"
        @error="handleImageError"
      />
      <div
        class="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 via-black/10 to-transparent rounded-lg pointer-events-none"
      >
        <img
          v-if="logo && !isMobileView"
          :src="getContentImage(logo)"
          :alt="(item.title || item.name) + ' Logo'"
          class="max-h-12 w-auto drop-shadow-lg"
          draggable="false"
        />
        <div v-else-if="!isMobileView" class="text-center px-4">
          <h3
            class="text-md sm:text-lg md:text-xl font-bold text-white drop-shadow-lg"
          >
            {{ item.title || item.name }}
          </h3>
          <p
            v-if="item.release_date || item.first_air_date"
            class="text-xs sm:text-sm text-gray-200 mt-1"
          >
            {{
              new Date(item.release_date || item.first_air_date).getFullYear()
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- hover card -->
    <teleport to="body">
      <ContentHoverCard
        v-if="isHovered"
        :item="item"
        :logo="logo"
        :position="cardPosition"
        :contentType="contentType"
        @keep-hover="keepHoverOpen"
        @end-hover="stopHover"
        @openModal="emitOpenModal"
      />
    </teleport>
  </swiper-slide>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import ContentHoverCard from "@/components/ContentHoverCard/ContentHoverCard.vue";

const props = defineProps({
  item: { type: Object, required: true },
  logo: String,
  contentType: String,
  carID: String,
  isPortraitView: Boolean,
  isMobileView: Boolean,
});

const emit = defineEmits([
  "item-click",
  "open-modal",
  "hover-active",
  "hover-inactive",
]);

const isHovered = ref(false);
let hoverTimer = null;
let leaveTimer = null;
const debounceDelay = 100;

const cardPosition = reactive({
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  scrollX: 0,
  scrollY: 0,
  isRightEdge: false,
});

watch(isHovered, (newValue) => {
  if (newValue) {
    emit("hover-active");
  } else {
    emit("hover-inactive");
  }
});

function getContentImage(path) {
  if (!path) return "";
  return `https://image.tmdb.org/t/p/w500${path}`;
}

function handleImageError(event) {
  event.target.src = "/NotflixLogo.png";
  event.target.classList.add("bg-gray-900");
  event.target.style.objectFit = "contain";
  event.target.style.padding = "1rem";
}

function startHoverTimer() {
  if (props.isMobileView) return;

  clearTimeout(leaveTimer);

  setTimeout(() => {
    const element = document.getElementById(
      `item-${props.carID}-${props.item.id}`
    );
    if (element) {
      const rect = element.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      cardPosition.top = rect.top;
      cardPosition.left = rect.left;
      cardPosition.width = rect.width;
      cardPosition.height = rect.height;
      cardPosition.scrollX = window.scrollX;
      cardPosition.scrollY = window.scrollY;
      cardPosition.isRightEdge = viewportWidth - (rect.left + rect.width) < 100;
    }
  }, 0);

  hoverTimer = setTimeout(() => {
    isHovered.value = true;
  }, 500);
}

function stopHover() {
  clearTimeout(hoverTimer);
  isHovered.value = false;
}

function handleMouseLeave(event) {
  const selector = ".content-hover-card";
  if (event.relatedTarget && event.relatedTarget.closest(selector)) {
    return;
  }
  clearTimeout(hoverTimer);
  leaveTimer = setTimeout(() => {
    stopHover();
  }, debounceDelay);
}

function keepHoverOpen() {
  clearTimeout(leaveTimer);
}

function handleClick() {
  emit("item-click", props.item);
}

function emitOpenModal() {
  emit("open-modal", { id: props.item.id, contentType: props.contentType });
  stopHover();
}
</script>
