<template>
  <div class="relative w-full h-full">
    <img
      v-if="backdrop"
      :src="backdrop"
      alt="Backdrop"
      class="absolute inset-0 w-full h-full object-cover z-10"
      draggable="false"
    />

    <TrailerVideoPlayer
      v-if="trailerKey && !trailerEnded && !hideOnMobile"
      ref="videoPlayer"
      class="z-20"
      :trailer-key="trailerKey"
      v-model:is-muted="isMuted"
      @trailer-ended="trailerKill"
      @player-ready="trailerStart"
    />

    <div
      class="absolute left-0 right-0 z-30 pointer-events-none"
      :class="[
        trailerKey && !trailerEnded && !hideOnMobile
          ? '-bottom-48 2xl:-bottom-58 3xl:-bottom-78'
          : '-bottom-1',
        hideOnMobile
          ? 'h-48 sm:h-56'
          : 'h-40 lg:h-48 xl:h-64 2xl:h-72 3xl:h-80',
      ]"
    >
      <div
        class="absolute inset-0 h-1/3 bottom-2/3"
        :style="{
          background:
            'linear-gradient(to bottom, rgba(20, 20, 20, 0) 0%, rgba(20, 20, 20, 0.3) 100%)',
        }"
      ></div>
      <div
        class="absolute inset-0 h-1/3 top-1/3 bottom-1/3"
        :style="{
          background:
            'linear-gradient(to bottom, rgba(20, 20, 20, 0.3) 0%, rgba(20, 20, 20, 0.6) 100%)',
          backdropFilter: 'blur(1px)',
          WebkitBackdropFilter: 'blur(1px)',
        }"
      ></div>
      <div
        class="absolute inset-0 h-1/3 top-2/3"
        :style="{
          background:
            'linear-gradient(to bottom, rgba(20, 20, 20, 0.6) 0%, rgba(20, 20, 20, 0.9) 70%, rgba(20, 20, 20, 1) 100%)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }"
      ></div>
    </div>

    <div
      class="absolute inset-0 z-40 flex flex-col justify-end lg:justify-center"
    >
      <div class="relative w-full h-full">
        <TrailerInfoOverlay
          :title="title"
          :overview="overview"
          :logo-path="logoPath"
          :movie-id="movieId"
          :content-type="contentType"
          :genres="genres"
          :show-description="showDescription"
          :logo-large="logoLarge"
        >
          <slot />
        </TrailerInfoOverlay>

        <TrailerControls
          v-if="!hideOnMobile"
          :trailer-key="trailerKey"
          :trailer-ended="trailerEnded"
          :is-muted="isMuted"
          :content-rating="contentRating"
          @toggle-mute="isMuted = !isMuted"
          @replay="replayTrailer"
          @show-more-info="moreInfoClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";
import { fetchMovieRatings, fetchTVShowRatings } from "@/api/tmdb";
import TrailerVideoPlayer from "./TrailerVideoPlayer.vue";
import TrailerInfoOverlay from "./TrailerInfoOverlay.vue";
import TrailerControls from "./TrailerControls.vue";

const props = defineProps({
  title: String,
  overview: String,
  backdropPath: String,
  trailerKey: String,
  logoPath: String,
  movieId: Number,
  genres: { type: Array, default: () => [] },
  contentType: {
    type: String,
    default: "movie",
    validator: (value) => ["movie", "tv"].includes(value),
  },
});

const emit = defineEmits(["showMoreInfo"]);

const videoPlayer = ref(null);
const isMuted = ref(true);
const trailerEnded = ref(false);
const showDescription = ref(true);
const logoLarge = ref(true);
const contentRating = ref(null);

const backdrop = computed(() =>
  props.backdropPath
    ? `https://image.tmdb.org/t/p/original${props.backdropPath}`
    : null
);

const hideOnMobile = computed(() => {
  if (typeof window === "undefined") return true;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspectRatio = width / height;
  return width < 1024 || (width === 1024 && aspectRatio < 1.5);
});

function trailerStart() {
  setTimeout(() => {
    logoLarge.value = false;
    showDescription.value = false;
  }, 7000);
}

function trailerKill() {
  trailerEnded.value = true;
  logoLarge.value = true;
  showDescription.value = true;
}

function replayTrailer() {
  trailerEnded.value = false;
  if (videoPlayer.value) {
    videoPlayer.value.replay();
  }
}

function moreInfoClick() {
  emit("showMoreInfo", { id: props.movieId, contentType: props.contentType });
}

function fetchContentRating() {
  if (!props.movieId) return;
  const fetchFn =
    props.contentType === "tv" ? fetchTVShowRatings : fetchMovieRatings;
  fetchFn(props.movieId)
    .then((rating) => {
      contentRating.value = rating;
    })
    .catch((err) => {
      console.error("Rating fetch failed:", err);
      contentRating.value = null;
    });
}

onMounted(fetchContentRating);
watch(() => [props.movieId, props.contentType], fetchContentRating);
watch(
  () => props.trailerKey,
  () => {
    trailerEnded.value = false;
    isMuted.value = true;
    logoLarge.value = true;
    showDescription.value = true;
  }
);
</script>
