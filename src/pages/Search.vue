<template>
  <div class="min-h-screen bg-netflix-bg-gray text-white pt-20 pb-10">
    <Navbar />

    <div class="container mx-auto px-4 mt-8 mb-6">
      <h1 class="text-3xl font-bold">
        {{ searchResults.length > 0 ? "Search Results" : "Search" }}
      </h1>
      <p v-if="searchQuery" class="text-netflix-gray-25 mt-2">
        {{
          searchResults.length > 0
            ? `Found ${searchResults.length} results for "${searchQuery}"`
            : `No results found for "${searchQuery}"`
        }}
      </p>
    </div>

    <div class="container mx-auto px-4">
      <div v-if="isLoading" class="flex flex-col items-center py-12">
        <div
          class="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin mb-4"
        ></div>
        <p class="text-netflix-gray-25">Searching...</p>
      </div>

      <div v-else-if="!searchQuery" class="py-16 text-center">
        <div class="text-4xl mb-4">🔍</div>
        <h2 class="text-2xl font-semibold mb-2">
          Search for movies and TV shows
        </h2>
        <p class="text-netflix-gray-25 mb-6">
          Type in the search box above to find your favorite content
        </p>
      </div>

      <div
        v-else-if="searchResults.length === 0 && !isLoading"
        class="py-16 text-center"
      >
        <div class="text-4xl mb-4">🎬</div>
        <h2 class="text-2xl font-semibold mb-2">No results found</h2>
        <p class="text-netflix-gray-25 mb-6">
          Try different keywords or check the spelling
        </p>
      </div>

      <div v-else class="mx-auto relative mt-4 w-full max-w-[1920px]">
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4"
        >
          <div
            v-for="item in searchResults"
            :key="item.id"
            class="relative rounded-lg cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-10 group w-full"
            @mouseenter="startHoverTimer(item.id)"
            @mouseleave="handleMouseLeave"
            @click="handleContentClick(item)"
          >
            <div
              class="transition-transform duration-300 cursor-pointer"
              :id="`search-item-${item.id}`"
            >
              <template v-if="item.poster_path || item.backdrop_path">
                <img
                  :src="
                    isPortraitView
                      ? getContentImage(item.poster_path, 'w500')
                      : getContentImage(item.backdrop_path, 'w780')
                  "
                  :alt="item.title || item.name"
                  class="w-full rounded-lg object-cover"
                  :class="isPortraitView ? 'aspect-[2/3]' : 'aspect-video'"
                  @error="handleImageError"
                />
              </template>
              <div
                v-else
                class="w-full rounded-lg bg-gray-900 border border-gray-800"
                :class="isPortraitView ? 'aspect-[2/3]' : 'aspect-video'"
              ></div>

              <div
                v-if="!isPortraitView && contentLogos[item.id]"
                class="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 via-black/10 to-transparent rounded-lg pointer-events-none"
              >
                <img
                  :src="getContentImage(contentLogos[item.id])"
                  :alt="(item.title || item.name) + ' Logo'"
                  class="max-h-12 w-auto drop-shadow-lg"
                  draggable="false"
                />
              </div>

              <div
                class="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent"
              >
                <h3 class="text-sm font-bold text-white">
                  {{ item.title || item.name }}
                </h3>
                <div class="text-xs text-gray-300">
                  {{ item.media_type === "tv" ? "TV Show" : "Movie" }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <teleport to="body">
          <ContentHoverCard
            v-if="hoveredItemId && mouseOver"
            :item="searchResults.find((item) => item.id === hoveredItemId)"
            :logo="contentLogos?.[hoveredItemId]"
            :position="cardPosition"
            :contentType="
              searchResults.find((item) => item.id === hoveredItemId)
                ?.media_type || 'movie'
            "
            @keep-hover="keepHoverOpen"
            @end-hover="stopHoverTimer"
            @openModal="handleOpenModalFromHoverCard"
          />
        </teleport>
      </div>
    </div>

    <Footer class="mt-20" />

    <ContentModal
      v-if="showContentModal"
      :id="selectedContentId"
      :contentType="selectedContentType"
      @close="closeContentModal"
    />
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  watch,
  onBeforeUnmount,
  reactive,
} from "vue";
import { useRoute } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
import ContentModal from "@/components/ContentModal/ContentModal.vue";
import ContentHoverCard from "@/components/ContentHoverCard/ContentHoverCard.vue";
import { searchMulti } from "@/api/tmdb";
import { fetchMovieLogos, fetchTVShowLogos } from "@/api/tmdb";

const route = useRoute();
const searchQuery = ref("");
const searchResults = ref([]);
const isLoading = ref(false);
const contentLogos = ref({});

const isPortraitView = ref(window.matchMedia("(max-width: 1023px)").matches);

const showContentModal = ref(false);
const selectedContentId = ref(null);
const selectedContentType = ref(null);

const hoveredItemId = ref(null);
const mouseOver = ref(false);
let mouseTimer = null;
let leaveTimer = null;
const debounceDelay = 100; // milliseconds

const cardPosition = reactive({
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  scrollX: 0,
  scrollY: 0,
  isRightEdge: false,
});

watch(
  () => route.query.q,
  (newQuery) => {
    if (newQuery) {
      searchQuery.value = newQuery;
      performSearch(newQuery);
    } else {
      searchResults.value = [];
      searchQuery.value = "";
    }
  },
  { immediate: true }
);

function handleResize() {
  isPortraitView.value = window.matchMedia("(max-width: 1023px)").matches;
}

async function performSearch(query) {
  if (!query || query.length < 2) {
    searchResults.value = [];
    return;
  }

  isLoading.value = true;

  try {
    const results = await searchMulti(query);
    searchResults.value = results.filter(
      (item) => item.poster_path || item.backdrop_path
    );

    await fetchLogos();
  } catch (error) {
    console.error("Search error:", error);
    searchResults.value = [];
  } finally {
    isLoading.value = false;
  }
}

async function fetchLogos() {
  try {
    const newLogos = {};

    await Promise.all(
      searchResults.value.map(async (item) => {
        const mediaType = item.media_type || "movie";
        const logoFetch =
          mediaType === "tv" ? fetchTVShowLogos : fetchMovieLogos;

        try {
          const logo = await logoFetch(item.id);
          if (logo) newLogos[item.id] = logo;
        } catch (error) {
          console.error(
            `Error fetching logo for ${mediaType} ID ${item.id}:`,
            error
          );
        }
      })
    );

    contentLogos.value = newLogos;
  } catch (error) {
    console.error("Error fetching logos:", error);
  }
}

function handleContentClick(item) {
  if (item && item.id) {
    selectedContentId.value = item.id;
    selectedContentType.value = item.media_type || "movie";
    showContentModal.value = true;
    document.body.style.overflow = "hidden";
  }
}

function closeContentModal() {
  showContentModal.value = false;
  selectedContentId.value = null;
  selectedContentType.value = null;
  document.body.style.overflow = "";
}

function getContentImage(path, size = "w500") {
  if (!path) return "";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

function handleImageError(event) {
  event.target.src = "/NotflixLogo.png";
}

function startHoverTimer(itemId) {
  hoveredItemId.value = itemId;
  clearTimeout(mouseTimer);
  clearTimeout(leaveTimer);

  setTimeout(() => {
    const element = document.getElementById(`search-item-${itemId}`);
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
  const selector = ".content-hover-card";
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

function handleOpenModalFromHoverCard(payload) {
  selectedContentId.value = payload.id;
  selectedContentType.value = payload.contentType;
  showContentModal.value = true;
  document.body.style.overflow = "hidden";
  stopHoverTimer();
}

onMounted(() => {
  window.addEventListener("resize", handleResize);

  if (route.query.q) {
    searchQuery.value = route.query.q;
    performSearch(searchQuery.value);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  clearTimeout(mouseTimer);
  clearTimeout(leaveTimer);
});
</script>
