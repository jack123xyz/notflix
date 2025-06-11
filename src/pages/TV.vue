<template>
  <div
    class="min-h-screen bg-netflix-bg-gray text-white relative lg:pt-0 pt-13"
  >
    <div
      v-if="isMobileView"
      class="absolute top-0 left-0 right-0 h-[200vh] z-[-1]"
      :style="backgroundGradientStyle"
    ></div>

    <Navbar />

    <div class="relative w-full">
      <div
        v-if="isMobileView"
        class="flex justify-center items-center gap-2 mt-4 mb-4"
      >
        <button
          class="bg-transparent border border-white text-white px-4 py-1.5 rounded-full"
          @click="router.push({ name: 'TV' })"
        >
          TV Shows
        </button>
        <button
          class="bg-transparent border border-white/60 text-white/60 px-4 py-1.5 rounded-full"
          @click="router.push({ name: 'Movies' })"
        >
          Movies
        </button>
        <button
          class="bg-transparent border border-white/60 text-white/60 px-4 py-1.5 rounded-full"
          @click="router.push('/my-list')"
        >
          My List
        </button>
      </div>

      <div
        class="relative w-full h-[150vw] lg:h-[60vh] xl:h-[70vh] 2xl:h-[80vh] min-h-[300px] max-h-[1000px]"
      >
        <MobileFeaturedPoster
          v-if="featuredTVShow && isMobileView"
          :movie="featuredTVShow"
          :poster-path="featuredTVShow.poster_path"
          :title="featuredTVShow.name"
          :overview="featuredTVShow.overview"
          :movie-id="featuredTVShow.id"
          :logo-path="featuredLogo"
          content-type="tv"
          @colors-extracted="updateBackgroundColors"
        />
        <FeaturedTrailer
          v-if="featuredTVShow && !isMobileView"
          :title="featuredTVShow.name"
          :overview="featuredTVShow.overview"
          :backdrop-path="featuredTVShow.backdrop_path"
          :trailer-key="featuredTrailerKey"
          :logo-path="featuredLogo"
          :movie-id="featuredTVShow.id"
          :genres="featuredTVShow.genres"
          content-type="tv"
          class="hidden lg:block"
          @showMoreInfo="openModal"
        />
      </div>
    </div>

    <div class="relative z-30 pointer-events-auto space-y-4">
      <div v-for="grid in contentGrids" :key="grid.id">
        <component
          :is="grid.component"
          :title="grid.title"
          :items="grid.items"
          :logos="grid.logos"
          :content-type="grid.contentType"
          :is-loading="isLoading"
          @content-click="openModalFromGrid"
        />
      </div>
    </div>

    <ContentModal
      v-if="modalContent.id"
      :id="modalContent.id"
      :content-type="modalContent.contentType"
      @close="closeModal"
    />
    <Footer />
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import {
  fetchTrendingTVShows,
  fetchTVShowsByGenre,
  fetchTopTenTVShows,
  TV_GENRES,
  fetchTVShowLogos,
  fetchTVShowTrailers,
  fetchTVShowDetails,
} from "@/api/tmdb";
import Navbar from "@/components/Navbar.vue";
import FeaturedTrailer from "@/components/FeaturedTrailer/FeaturedTrailer.vue";
import MobileFeaturedPoster from "@/components/Mobile/MobileFeaturedPoster.vue";
import ContentCarousel from "@/components/Grids/ContentGrid/ContentCarousel.vue";
import TopTenContentGrid from "@/components/Grids/TopTenContentGrid.vue";
import Footer from "@/components/Footer.vue";
import ContentModal from "@/components/ContentModal/ContentModal.vue";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const isLoading = ref(true);
const isMobileView = ref(window.innerWidth < 1024);

const featuredTVShow = ref(null);
const featuredTrailerKey = ref(null);
const featuredLogo = ref(null);

const modalContent = reactive({ id: null, contentType: null });
const dominantColors = reactive({ primary: null, secondary: null });

const gridConfig = [
  {
    id: "trendingTV",
    title: "Trending Now",
    component: ContentCarousel,
    contentType: "tv",
    fetcher: fetchTrendingTVShows,
  },
  {
    id: "topTenTV",
    title: "Top 10 TV Shows in The U.S. Today",
    component: TopTenContentGrid,
    contentType: "tv",
    fetcher: fetchTopTenTVShows,
  },
  {
    id: "actionTV",
    title: "Action & Adventure",
    component: ContentCarousel,
    contentType: "tv",
    fetcher: () => fetchTVShowsByGenre(TV_GENRES.ACTION_ADVENTURE),
  },
  {
    id: "dramaTV",
    title: "TV Dramas",
    component: ContentCarousel,
    contentType: "tv",
    fetcher: () => fetchTVShowsByGenre(TV_GENRES.DRAMA),
  },
  {
    id: "crimeTV",
    title: "Crime TV Shows",
    component: ContentCarousel,
    contentType: "tv",
    fetcher: () => fetchTVShowsByGenre(TV_GENRES.CRIME),
  },
  {
    id: "realityTV",
    title: "Reality TV",
    component: ContentCarousel,
    contentType: "tv",
    fetcher: () => fetchTVShowsByGenre(TV_GENRES.REALITY),
  },
  {
    id: "documentaryTV",
    title: "Documentaries",
    component: ContentCarousel,
    contentType: "tv",
    fetcher: () => fetchTVShowsByGenre(TV_GENRES.DOCUMENTARY),
  },
];

const contentGrids = ref(
  gridConfig.map((config) => ({ ...config, items: [], logos: {} }))
);

const backgroundGradientStyle = computed(() => {
  const primary = dominantColors.primary
    ? `rgba(${dominantColors.primary.join(",")}, 0.85)`
    : "rgba(229, 9, 20, 0.85)";
  const secondary = dominantColors.secondary
    ? `rgba(${dominantColors.secondary.join(",")}, 0.6)`
    : "rgba(40, 40, 40, 0.6)";
  return {
    background: `linear-gradient(to bottom, ${primary} 0%, ${primary} 10%, ${secondary} 30%, rgba(20, 20, 20, 0.95) 50%, rgba(20, 20, 20, 1) 70%)`,
    transition: "background 0.5s ease-out",
  };
});

const checkMobileView = () => (isMobileView.value = window.innerWidth < 1024);

const enhanceColor = (color) => {
  const [r, g, b] = color;
  const max = Math.max(r, g, b);
  if (max === Math.min(r, g, b)) return color;
  const boostedColor = [...color];
  const dominantChannel = r === max ? 0 : g === max ? 1 : 2;
  boostedColor[dominantChannel] = Math.min(
    255,
    Math.round(boostedColor[dominantChannel] * 1.15)
  );
  return boostedColor;
};

const updateBackgroundColors = (colors) => {
  if (colors?.primary) {
    dominantColors.primary = enhanceColor(colors.primary);
    dominantColors.secondary = colors.secondary;
  }
};

const openModal = (content) => {
  modalContent.id = content.id;
  modalContent.contentType =
    content.contentType || (content.first_air_date ? "tv" : "movie");
  document.body.style.overflow = "hidden";
};

const openModalFromGrid = (payload) => {
  openModal({ id: payload.id, contentType: payload.media_type });
};

const closeModal = () => {
  modalContent.id = null;
  modalContent.contentType = null;
  document.body.style.overflow = "";
};

const initializeUserProfile = () => {
  if (!userStore.profilesLoaded || userStore.profiles.length === 0) {
    if (!userStore.currentProfile) {
      console.warn(
        "initializeUserProfile: Profiles not loaded or empty, and no current profile. Skipping initialization."
      );
    }
    return;
  }

  const profileIdFromUrl = route.query.profile;
  const savedProfileId = localStorage.getItem(
    "netflix_clone_active_profile_id"
  );
  let targetProfileId = profileIdFromUrl || savedProfileId;
  let profileToSet = null;

  if (targetProfileId) {
    profileToSet = userStore.profiles.find((p) => p.id === targetProfileId);
  }

  if (
    !profileToSet &&
    userStore.profiles.length > 0 &&
    !userStore.currentProfile
  ) {
    profileToSet = userStore.profiles[0];
  } else if (
    !profileToSet &&
    userStore.currentProfile?.id === targetProfileId
  ) {
    return;
  }

  if (profileToSet) {
    userStore.setActiveProfile(profileToSet);
  } else if (
    !targetProfileId &&
    !userStore.currentProfile &&
    userStore.profiles.length > 0
  ) {
    userStore.setActiveProfile(userStore.profiles[0]);
  } else if (targetProfileId && !profileToSet) {
    console.warn(
      `initializeUserProfile: Profile with ID "${targetProfileId}" not found. Defaulting if possible.`
    );
    if (!userStore.currentProfile && userStore.profiles.length > 0) {
      userStore.setActiveProfile(userStore.profiles[0]);
    }
  }
};

const fetchAllContent = async () => {
  try {
    isLoading.value = true;
    const dataPromises = contentGrids.value.map((grid) => grid.fetcher());
    const allData = await Promise.all(dataPromises);

    const logoPromises = [];
    allData.forEach((items, index) => {
      const grid = contentGrids.value[index];
      grid.items = items;
      items.forEach((item) => {
        logoPromises.push(
          fetchTVShowLogos(item.id).then((logo) => ({
            gridId: grid.id,
            itemId: item.id,
            logo,
          }))
        );
      });
    });

    const allLogos = await Promise.all(logoPromises);
    allLogos.forEach(({ gridId, itemId, logo }) => {
      if (logo) {
        const grid = contentGrids.value.find((g) => g.id === gridId);
        if (grid) grid.logos[itemId] = logo;
      }
    });

    const showsWithBackdrop = contentGrids.value[0].items.filter(
      (s) => s.backdrop_path
    );
    if (showsWithBackdrop.length > 0) {
      featuredTVShow.value =
        showsWithBackdrop[Math.floor(Math.random() * showsWithBackdrop.length)];

      const showDetails = await fetchTVShowDetails(featuredTVShow.value.id);

      [featuredLogo.value, featuredTrailerKey.value] = await Promise.all([
        fetchTVShowLogos(featuredTVShow.value.id),
        fetchTVShowTrailers(featuredTVShow.value.id).then(
          (trailers) => trailers[0]?.key || null
        ),
      ]);
      featuredTVShow.value = { ...featuredTVShow.value, ...showDetails };
    }
  } catch (error) {
    console.error("Error fetching TV page content:", error);
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => userStore.currentProfile?.id,
  (newProfileId, oldProfileId) => {
    if (newProfileId && newProfileId !== oldProfileId) {
      fetchAllContent();
    } else if (!newProfileId && oldProfileId) {
      featuredTVShow.value = null;
      contentGrids.value.forEach((grid) => (grid.items = []));
      console.log("Profile became null, content cleared.");
    }
  },
  { immediate: true }
);

watch(
  () => userStore.profilesLoaded,
  (loaded) => {
    if (loaded) {
      initializeUserProfile();
    }
  },
  { immediate: true }
);

onMounted(() => {
  checkMobileView();
  window.addEventListener("resize", checkMobileView);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkMobileView);
});
</script>

<style scoped>
.absolute {
  transition: background 0.5s ease-out;
}
</style>
