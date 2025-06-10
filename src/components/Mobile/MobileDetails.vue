<template>
  <div
    class="mobile-details fixed inset-0 bg-netflix-bg-gray text-white overflow-y-auto z-[9999]"
  >
    <div
      class="flex items-center justify-between p-4 bg-black fixed top-0 left-0 right-0 z-50"
    >
      <button
        @click="backButtonClick"
        class="relative z-50 ml-1"
        aria-label="Back or close details"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="w-6 h-6"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M11.7071 4.29289C12.0976 4.68342 12.0976 5.31658 11.7071 5.70711L6.41421 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H6.41421L11.7071 18.2929C12.0976 18.6834 12.0976 19.3166 11.7071 19.7071C11.3166 20.0976 10.6834 20.0976 10.2929 19.7071L3.29289 12.7071C3.10536 12.5196 3 12.2652 3 12C3 11.7348 3.10536 11.4804 3.29289 11.2929L10.2929 4.29289C10.6834 3.90237 11.3166 3.90237 11.7071 4.29289Z"
            fill="#ffffff"
          ></path>
        </svg>
      </button>
      <button class="relative z-50 mr-5" aria-label="Search">
        <svg class="w-5 h-5" fill="#ffffff" viewBox="0 0 20 20">
          <path
            d="M12.9 14.32a8 8 0 111.41-1.41l5.39 5.38-1.42 1.42-5.38-5.39zM8 14a6 6 0 100-12 6 6 0 000 12z"
          />
        </svg>
      </button>
    </div>

    <div v-if="!isLoading && content.id">
      <MobileDetailsHeader
        :trailer-key="trailerKey"
        :backdrop-path="content.backdrop_path"
        :poster-path="content.poster_path"
        :logo-path="logoPath"
        :title="title"
      />

      <div class="px-4 py-4 relative">
        <MobileDetailsInfo
          :content="content"
          :cast="cast"
          :content-type="contentType"
        />

        <MobileDetailsActions />

        <MobileDetailsTabs
          v-if="contentType === 'tv' && content.seasons"
          :show-id="content.id"
          :seasons="content.seasons"
          :similar-content="similarContent"
          @navigate-to-similar="openSimilarContent"
        />

        <SimilarContentGrid
          v-if="contentType === 'movie'"
          title="More Like This"
          :items="similarContent"
          @item-click="openSimilarContent"
        />
      </div>
    </div>

    <div v-else class="pt-20 text-center">Loading...</div>

    <MobileDetailsFooter :content-id="contentId" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import MobileDetailsHeader from "./MobileDetailsHeader.vue";
import MobileDetailsInfo from "./MobileDetailsInfo.vue";
import MobileDetailsActions from "./MobileDetailsActions.vue";
import MobileDetailsTabs from "./MobileDetailsTabs.vue";
import SimilarContentGrid from "./SimilarContentGrid.vue";
import MobileDetailsFooter from "./MobileDetailsFooter.vue";
import {
  fetchMovieDetails,
  fetchTVShowDetails,
  fetchMovieTrailers,
  fetchTVShowTrailers,
  fetchMovieCast,
  fetchTVShowCast,
  fetchSimilarMovies,
  fetchSimilarTVShows,
  fetchMovieLogos,
  fetchTVShowLogos,
} from "@/api/tmdb";

const props = defineProps({
  contentId: { type: Number, required: true },
  contentType: {
    type: String,
    default: "movie",
    validator: (value) => ["movie", "tv"].includes(value),
  },
});

const emit = defineEmits(["close"]);

const content = ref({});
const cast = ref([]);
const similarContent = ref([]);
const isLoading = ref(true);
const trailerKey = ref(null);
const logoPath = ref(null);
const history = ref([]);

const title = computed(() =>
  props.contentType === "movie" ? content.value.title : content.value.name
);

async function loadContent(id, type) {
  isLoading.value = true;
  content.value = {};
  cast.value = [];
  similarContent.value = [];
  trailerKey.value = null;
  logoPath.value = null;

  try {
    if (type === "movie") {
      const [movieData, trailers, castData, similar, logo] = await Promise.all([
        fetchMovieDetails(id),
        fetchMovieTrailers(id),
        fetchMovieCast(id),
        fetchSimilarMovies(id),
        fetchMovieLogos(id),
      ]);
      content.value = movieData;
      if (trailers.length > 0) trailerKey.value = trailers[0].key;
      cast.value = castData.slice(0, 10);
      similarContent.value = similar;
      logoPath.value = logo;
    } else {
      const [tvData, trailers, castData, similar, logo] = await Promise.all([
        fetchTVShowDetails(id),
        fetchTVShowTrailers(id),
        fetchTVShowCast(id),
        fetchSimilarTVShows(id),
        fetchTVShowLogos(id),
      ]);
      content.value = tvData;
      if (trailers.length > 0) trailerKey.value = trailers[0].key;
      cast.value = castData.slice(0, 10);
      similarContent.value = similar;
      logoPath.value = logo;
    }
  } catch (error) {
    console.error(`Error loading ${type} content:`, error);
  } finally {
    isLoading.value = false;
  }
}

function openSimilarContent(item) {
  if (content.value.id) {
    history.value.push({ id: content.value.id, type: props.contentType });
  }
  const newContentType = item.title !== undefined ? "movie" : "tv";
  window.scrollTo({ top: 0, behavior: "smooth" });
  loadContent(item.id, newContentType);
}

function backButtonClick() {
  if (history.value.length > 0) {
    const previousContent = history.value.pop();
    loadContent(previousContent.id, previousContent.type);
  } else {
    emit("close");
  }
}

watch(
  () => [props.contentId, props.contentType],
  ([newId, newType]) => {
    if (newId) loadContent(newId, newType);
  },
  { immediate: true }
);

onMounted(() => {
  document.body.style.overflow = "hidden";
});
onBeforeUnmount(() => {
  document.body.style.overflow = "";
});
</script>

<style scoped>
.mobile-details {
  overscroll-behavior: contain;
}
</style>
