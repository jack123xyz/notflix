<template>
  <div class="relative w-full h-full flex flex-col justify-end overflow-hidden">
    <div
      v-if="isLoading"
      class="absolute inset-0 flex justify-center items-center bg-black/80 z-20"
    >
      <div class="animate-pulse flex flex-col items-center">
        <div
          class="w-12 h-12 border-4 border-t-red-600 border-r-red-600 border-b-transparent border-l-transparent rounded-full animate-spin"
        ></div>
        <span class="mt-3 text-white">Loading...</span>
      </div>
    </div>

    <div
      v-if="loadError"
      class="absolute inset-0 flex justify-center items-center bg-black/80 z-20"
    >
      <div class="flex flex-col items-center text-center px-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-12 w-12 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p class="mt-3 text-white">Failed to load poster</p>
        <button
          @click="retryLoading"
          class="mt-3 bg-red-600 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    </div>

    <div class="absolute inset-0 flex justify-center">
      <div class="relative h-full w-auto max-w-[90%]">
        <img
          v-if="posterUrl"
          ref="posterImageRef"
          :src="posterUrl"
          :alt="title"
          class="h-full w-auto object-cover rounded border-2 border-white/100"
          @load="onImageLoadSuccess"
          @error="onImageLoadError"
          crossorigin="anonymous"
        />

        <div
          v-else
          class="h-full w-full bg-gray-700 rounded border-2 border-white/100 flex items-center justify-center"
        ></div>

        <div
          v-if="posterUrl && imageSuccessfullyLoaded"
          class="absolute inset-0 bg-black opacity-50 rounded"
        ></div>
      </div>
    </div>

    <div
      v-if="logoUrl"
      class="absolute bottom-27 left-0 w-full flex justify-center z-10"
    >
      <img
        :src="logoUrl"
        :alt="`${title} logo`"
        class="w-4/5 max-h-32 object-contain"
      />
    </div>

    <div class="relative z-10 px-4 py-6 text-white mt-auto">
      <div
        v-if="contentGenres && contentGenres.length > 0"
        class="flex flex-wrap gap-1 mb-4 text-center justify-center"
      >
        <span v-for="(genre, i) in contentGenres" :key="genre">
          {{ genre }}{{ i < contentGenres.length - 1 ? " • " : "" }}
        </span>
      </div>

      <div class="flex gap-3 justify-center">
        <button
          class="bg-white text-black flex px-8 sm:px-12 py-1 rounded font-semibold items-center justify-center cursor-pointer"
        >
          <svg
            fill="#000000"
            version="1.1"
            class="w-5 h-5 pl-1 mr-1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 512 512"
            xml:space="preserve"
          >
            <path
              d="M500.203,236.907L30.869,2.24c-6.613-3.285-14.443-2.944-20.736,0.939C3.84,7.083,0,13.931,0,21.333v469.333 c0,7.403,3.84,14.251,10.133,18.155c3.413,2.112,7.296,3.179,11.2,3.179c3.264,0,6.528-0.747,9.536-2.24l469.333-234.667 C507.435,271.467,512,264.085,512,256S507.435,240.533,500.203,236.907z"
            ></path>
          </svg>
          Play
        </button>
        <button
          class="bg-gray-600/80 text-white py-2 px-8 rounded font-semibold flex items-center justify-center cursor-pointer"
          @click.stop="toggleMyList"
        >
          <svg
            v-if="isInMyList"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 mr-2 mt-0.5"
          >
            <path
              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
              fill="#ffffff"
            />
          </svg>
          <svg
            v-else
            viewBox="-0.5 0 21 21"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            fill="#000000"
            class="w-4 h-4 mr-2 mt-0.5"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <title>plus [#1512]</title>
              <defs></defs>
              <g
                id="Page-1"
                stroke="none"
                stroke-width="1"
                fill="none"
                fill-rule="evenodd"
              >
                <g
                  id="Dribbble-Light-Preview"
                  transform="translate(-379.000000, -240.000000)"
                  fill="#ffffff"
                >
                  <g id="icons" transform="translate(56.000000, 160.000000)">
                    <polygon
                      id="plus-[#1512]"
                      points="344 89 344 91 334.55 91 334.55 100 332.45 100 332.45 91 323 91 323 89 332.45 89 332.45 80 334.55 80 334.55 89"
                    ></polygon>
                  </g>
                </g>
              </g>
            </g>
          </svg>
          {{ isInMyList ? "Remove" : "My List" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useMovieStore } from "@/stores/movieStore";
import { useUserStore } from "@/stores/user";
import {
  extractColorsFromImage,
  getFallbackColors,
} from "@/utils/colorExtraction";

const emit = defineEmits(["colorsExtracted"]);
const userStore = useUserStore();

const props = defineProps({
  title: String,
  overview: String,
  posterPath: String,
  movieId: Number,
  movie: Object,
  logoPath: String,
  genres: {
    type: Array,
    default: () => [],
  },
  contentType: {
    type: String,
    default: "movie",
    validator: (value) => ["movie", "tv"].includes(value),
  },
});

const router = useRouter();
const movieStore = useMovieStore();
const posterImageRef = ref(null);

const dominantColors = reactive({
  primary: null,
  secondary: null,
  tertiary: null,
});

const isLoading = ref(true);
const loadError = ref(false);
const imageSuccessfullyLoaded = ref(false);

const posterUrl = computed(() => {
  if (!props.posterPath) return "";
  return `https://image.tmdb.org/t/p/w500${props.posterPath}`;
});

const logoUrl = computed(() => {
  if (!props.logoPath) return "";
  return `https://image.tmdb.org/t/p/w500${props.logoPath}`;
});

const contentGenres = computed(() => {
  if (props.genres && props.genres.length > 0) {
    return props.genres.slice(0, 3);
  }
  if (props.movie?.genre_ids && movieStore.genres) {
    return props.movie.genre_ids
      .slice(0, 3)
      .map((id) => movieStore.genres[id])
      .filter(Boolean);
  }
  return [];
});

function emitDominantColors(colors) {
  if (colors.length >= 3) {
    dominantColors.primary = colors[0];
    dominantColors.secondary = colors[1];
    dominantColors.tertiary = colors[2];
    emit("colorsExtracted", {
      primary: colors[0],
      secondary: colors[1],
      tertiary: colors[2],
    });
  } else {
    emitFallbackColors();
  }
}

function emitFallbackColors() {
  const fallbackPalette = getFallbackColors();
  dominantColors.primary = fallbackPalette[0];
  dominantColors.secondary = fallbackPalette[1];
  dominantColors.tertiary = fallbackPalette[2];
  emit("colorsExtracted", {
    primary: fallbackPalette[0],
    secondary: fallbackPalette[1],
    tertiary: fallbackPalette[2],
  });
}

async function attemptColorExtraction() {
  if (
    posterImageRef.value &&
    posterImageRef.value.complete &&
    posterImageRef.value.naturalWidth > 0
  ) {
    try {
      const colors = await extractColorsFromImage(posterImageRef.value);
      emitDominantColors(colors);
    } catch (error) {
      console.error("Color extraction failed:", error);
      emitFallbackColors();
    }
  } else {
    console.warn("Image not ready for color extraction, using fallback.");
    emitFallbackColors();
  }
}

function onImageLoadSuccess() {
  isLoading.value = false;
  loadError.value = false;
  imageSuccessfullyLoaded.value = true;
  nextTick(() => {
    attemptColorExtraction();
  });
}

function onImageLoadError() {
  console.error(`Failed to load poster image: ${posterUrl.value}`);
  isLoading.value = false;
  loadError.value = true;
  imageSuccessfullyLoaded.value = false;
  emitFallbackColors();
}

function retryLoading() {
  if (props.posterPath) {
    isLoading.value = true;
    loadError.value = false;
    imageSuccessfullyLoaded.value = false;
  }
}

const isInMyList = computed(() => {
  if (!userStore.currentMyList || !props.movie?.id) return false;
  return userStore.currentMyList.some((item) => item.id === props.movie.id);
});

async function toggleMyList(event) {
  event.stopPropagation();
  if (!props.movie?.id) return;

  try {
    if (isInMyList.value) {
      const myListItem = userStore.currentMyList.find(
        (item) => item.id === props.movie.id
      );
      if (myListItem && myListItem.docId) {
        await userStore.removeFromMyList(myListItem.docId);
      } else {
        console.error("Could not find document ID for item in My List");
      }
    } else {
      const contentToAdd = {
        id: props.movie.id,
        title: props.movie.title || props.movie.name || "Unknown Title",
        name: props.movie.name || props.movie.title || "Unknown Name",
        poster_path: props.movie.poster_path || null,
        backdrop_path: props.movie.backdrop_path || null,
        media_type: props.contentType || "movie",
        overview: props.movie.overview || "",
        vote_average: props.movie.vote_average || 0,
        release_date: props.movie.release_date,
        first_air_date: props.movie.first_air_date,
      };
      await userStore.addToMyList(contentToAdd);
    }
  } catch (error) {
    console.error("Error toggling My List:", error);
  }
}

onMounted(async () => {
  if (!movieStore.genres) {
    await movieStore.fetchGenres();
  }
});

watch(
  () => props.posterPath,
  (newPath) => {
    if (newPath) {
      isLoading.value = true;
      loadError.value = false;
      imageSuccessfullyLoaded.value = false;
    } else {
      isLoading.value = false;
      loadError.value = false;
      imageSuccessfullyLoaded.value = false;
      emitFallbackColors();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.absolute.bottom-27 {
  bottom: 6.75rem;
}

.absolute.inset-0.bg-black {
  transition: opacity 0.3s ease-in-out;
}
</style>
