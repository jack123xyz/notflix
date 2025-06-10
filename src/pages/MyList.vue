<template>
  <div class="min-h-screen bg-netflix-bg-gray text-white pt-20 pb-10">
    <Navbar />

    <div class="container mx-auto px-4 mt-8 mb-6">
      <h1 class="text-3xl font-bold">My List</h1>
    </div>

    <div class="container mx-auto px-4">
      <div v-if="isLoading" class="flex flex-col items-center py-12">
        <div
          class="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin mb-4"
        ></div>
        <p class="text-netflix-gray-25">Loading your list...</p>
      </div>

      <div
        v-else-if="
          !userStore.currentMyList || userStore.currentMyList.length === 0
        "
        class="py-16 text-center"
      >
        <h2 class="text-2xl font-semibold mb-6">Your list is empty</h2>
        <p class="text-netflix-gray-25 mb-12">
          Add movies and TV shows to your list to watch them later.
        </p>
        <router-link
          to="/browse"
          class="bg-netflix-bg-gray text-white py-3 px-6 border-1 border-netflix-gray-50 rounded-md font-medium hover:bg-netflix-gray-50/10 transition"
        >
          Browse content
        </router-link>
      </div>

      <div v-else class="mx-auto relative mt-34 w-full max-w-[1920px]">
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 px-4"
        >
          <div
            v-for="item in formattedListItems"
            :key="item.id"
            class="relative rounded-lg cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-10 group w-full"
            @mouseenter="startHoverTimer(item.id)"
            @mouseleave="handleMouseLeave"
            @click="handleContentClick(item)"
          >
            <div
              class="transition-transform duration-300 cursor-pointer"
              :id="`mylist-item-${item.id}`"
            >
              <img
                :src="
                  isPortraitView
                    ? getContentImage(item.poster_path, 'w780')
                    : getContentImage(item.backdrop_path, 'w1280')
                "
                :alt="item.title || item.name"
                class="w-full rounded-lg object-cover"
                :class="isPortraitView ? 'aspect-[2/3]' : 'aspect-video'"
                onerror="this.src='/NotflixLogo.png'"
              />

              <div
                v-if="!isPortraitView"
                class="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 via-black/10 to-transparent rounded-lg pointer-events-none"
              >
                <img
                  v-if="contentLogos[item.id]"
                  :src="getContentImage(contentLogos[item.id])"
                  :alt="(item.title || item.name) + ' Logo'"
                  class="max-h-12 w-auto drop-shadow-lg"
                  draggable="false"
                />
                <span v-else class=""></span>
              </div>

              <div
                v-if="isPortraitView"
                class="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent"
              >
                <h3 class="text-sm font-bold text-white">
                  {{ item.title || item.name }}
                </h3>
              </div>
            </div>
          </div>
        </div>
        <teleport to="body">
          <ContentHoverCard
            v-if="hoveredItemId && mouseOver"
            :item="formattedListItems.find((item) => item.id === hoveredItemId)"
            :logo="contentLogos?.[hoveredItemId]"
            :position="cardPosition"
            :contentType="
              formattedListItems.find((item) => item.id === hoveredItemId)
                ?.media_type || 'movie'
            "
            @keep-hover="keepHoverOpen"
            @end-hover="stopHoverTimer"
            @openModal="handleOpenModalFromHoverCard"
          />
        </teleport>
      </div>
    </div>

    <Footer class="mt-200" />

    <ContentModal
      v-if="showContentModal && !isMobileView"
      :id="selectedContentId"
      :contentType="selectedContentType"
      @close="closeContentModal"
    />

    <MobileDetails
      v-if="showMobileDetails && isMobileView"
      :contentId="selectedContentId"
      :contentType="selectedContentType"
      @close="closeMobileDetails"
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
import { useUserStore } from "@/stores/user";
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
import ContentModal from "@/components/ContentModal/ContentModal.vue";
import MobileDetails from "@/components/Mobile/MobileDetails.vue";
import { fetchMovieLogos, fetchTVShowLogos } from "@/api/tmdb";
import ContentHoverCard from "@/components/ContentHoverCard/ContentHoverCard.vue";

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

const userStore = useUserStore();
const isLoading = ref(true);
const contentLogos = ref(props.logos || {});

const isPortraitView = ref(window.matchMedia("(max-width: 1023px)").matches);
const isMobileView = ref(window.matchMedia("(max-width: 768px)").matches);

const showContentModal = ref(false);
const showMobileDetails = ref(false);
const selectedContentId = ref(null);
const selectedContentType = ref(null);

const hoveredItemId = ref(null);
const mouseOver = ref(false);
let mouseTimer = null;
let leaveTimer = null;

const cardPosition = reactive({
  top: 0,
  left: 0,
  width: 0,
});

const formattedListItems = computed(() => {
  if (!userStore.currentMyList) return [];

  return userStore.currentMyList.map((item) => ({
    id: item.id,
    title: item.title || item.name,
    name: item.name || item.title,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    media_type: item.media_type || "movie",
    overview: item.overview,
    vote_average: item.vote_average,
    release_date: item.release_date || item.first_air_date,
    first_air_date: item.first_air_date,
    genre_ids: item.genre_ids || [],
    genres: item.genres || [],
    listItemId: item.id,
  }));
});

function handleContentClick(item) {
  if (item && item.id && item.media_type) {
    selectedContentId.value = item.id;
    selectedContentType.value = item.media_type;

    if (isMobileView.value) {
      showMobileDetails.value = true;
    } else {
      showContentModal.value = true;
    }

    document.body.style.overflow = "hidden";
  }
}

// Close content modal
function closeContentModal() {
  showContentModal.value = false;
  selectedContentId.value = null;
  selectedContentType.value = null;
  document.body.style.overflow = "";
}

// Close mobile details
function closeMobileDetails() {
  showMobileDetails.value = false;
  selectedContentId.value = null;
  selectedContentType.value = null;
  document.body.style.overflow = "";
}

function getContentImage(path, size = "w500") {
  if (!path) return "";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

async function fetchLogos() {
  try {
    if (!userStore.currentMyList?.length) return;

    const newLogos = {};

    await Promise.all(
      userStore.currentMyList.map(async (item) => {
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

function startHoverTimer(itemId) {
  hoveredItemId.value = itemId;

  clearTimeout(mouseTimer);
  clearTimeout(leaveTimer);

  setTimeout(() => {
    const element = document.getElementById(`mylist-item-${itemId}`);
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
  clearTimeout(leaveTimer);
  mouseOver.value = false;
  hoveredItemId.value = null;
}

function handleMouseLeave(event) {
  const selector = ".content-hover-card";
  if (event.relatedTarget && event.relatedTarget.closest(selector)) {
    return;
  }

  clearTimeout(leaveTimer);
  clearTimeout(mouseTimer);

  leaveTimer = setTimeout(() => {
    stopHoverTimer();
  }, 10);
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

function handleResize() {
  isPortraitView.value = window.matchMedia("(max-width: 1023px)").matches;
  isMobileView.value = window.matchMedia("(max-width: 768px)").matches;
}

onMounted(async () => {
  isLoading.value = true;

  window.addEventListener("resize", handleResize);

  try {
    if (!userStore.currentProfile) {
      console.warn(
        "No current profile selected, redirecting to profile selection"
      );
      return;
    }

    if (typeof userStore.fetchMyList === "function") {
      await userStore.fetchMyList(userStore.currentProfile.id);
    } else if (typeof userStore.loadUserData === "function") {
      await userStore.loadUserData();
    } else {
      console.log("Using existing MyList data from store");
    }

    await fetchLogos();
  } catch (error) {
    console.error("Error loading My List data:", error);
  } finally {
    isLoading.value = false;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

watch(
  () => userStore.currentProfile,
  async (newProfile) => {
    if (newProfile) {
      isLoading.value = true;
      try {
        if (typeof userStore.fetchMyList === "function") {
          await userStore.fetchMyList(newProfile.id);
        } else if (typeof userStore.loadUserData === "function") {
          await userStore.loadUserData();
        }

        await fetchLogos();
      } catch (error) {
        console.error(
          "Error reloading My List data after profile change:",
          error
        );
      } finally {
        isLoading.value = false;
      }
    }
  }
);
</script>
