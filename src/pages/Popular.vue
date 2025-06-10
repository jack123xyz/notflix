<template>
  <div class="min-h-screen bg-netflix-bg-gray text-white pt-30 z-[1]">
    <Navbar />

    <div class="relative mx-auto px-4 py-4 space-y-4">
      <div v-for="grid in contentGrids" :key="grid.id">
        <component
          :is="grid.component"
          :title="grid.title"
          :items="grid.items"
          :logos="grid.logos"
          :content-type="grid.contentType"
          :is-loading="isLoading"
          @content-click="handleContentClick"
        />
      </div>
    </div>

    <Footer />

    <ContentModal
      v-if="showContentModal"
      :id="selectedModalContentId"
      :contentType="selectedModalContentType"
      @close="closeContentModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Navbar from "@/components/Navbar.vue";
import ContentCarousel from "@/components/Grids/ContentGrid/ContentCarousel.vue";
import TopTenContentGrid from "@/components/Grids/TopTenContentGrid.vue";
import Footer from "@/components/Footer.vue";
import ContentModal from "@/components/ContentModal/ContentModal.vue";
import {
  fetchNewReleases,
  fetchComingNextMonth,
  fetchComingSoon,
  fetchTopTenMovies,
  fetchTopTenTVShows,
  fetchMovieLogos,
  fetchTVShowLogos,
} from "@/api/tmdb";

const isLoading = ref(true);
const showContentModal = ref(false);
const selectedModalContentId = ref(null);
const selectedModalContentType = ref(null);

const gridConfig = [
  {
    id: "newThisMonth",
    title: "New This Month",
    component: ContentCarousel,
    contentType: "movie",
    fetcher: fetchNewReleases,
  },
  {
    id: "comingNextMonth",
    title: "Coming Next Month",
    component: ContentCarousel,
    contentType: "movie",
    fetcher: fetchComingNextMonth,
  },
  {
    id: "comingSoon",
    title: "Coming Soon",
    component: ContentCarousel,
    contentType: "movie",
    fetcher: fetchComingSoon,
  },
  {
    id: "topTenMovies",
    title: "Top 10 Movies in USA Today",
    component: TopTenContentGrid,
    contentType: "movie",
    fetcher: fetchTopTenMovies,
    process: (items) =>
      items.map((item, index) => ({ ...item, ranking: index + 1 })),
  },
  {
    id: "topTenTV",
    title: "Top 10 TV Shows in USA Today",
    component: TopTenContentGrid,
    contentType: "tv",
    fetcher: fetchTopTenTVShows,
    process: (items) =>
      items.map((item, index) => ({ ...item, ranking: index + 1 })),
  },
];

const contentGrids = ref(
  gridConfig.map((config) => ({ ...config, items: [], logos: {} }))
);

function handleContentClick(payload) {
  if (payload && payload.id && payload.media_type) {
    selectedModalContentId.value = payload.id;
    selectedModalContentType.value = payload.media_type;
    showContentModal.value = true;
    document.body.style.overflow = "hidden";
  }
}

function closeContentModal() {
  showContentModal.value = false;
  selectedModalContentId.value = null;
  selectedModalContentType.value = null;
  document.body.style.overflow = "";
}

async function fetchAllContent() {
  try {
    isLoading.value = true;
    const dataPromises = contentGrids.value.map((grid) => grid.fetcher());
    const allData = await Promise.all(dataPromises);

    const logoPromises = [];
    allData.forEach((items, index) => {
      const grid = contentGrids.value[index];
      grid.items = grid.process ? grid.process(items) : items;

      const logoFetcher =
        grid.contentType === "tv" ? fetchTVShowLogos : fetchMovieLogos;

      grid.items.forEach((item) => {
        logoPromises.push(
          logoFetcher(item.id).then((logo) => ({
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
  } catch (error) {
    console.error("Error fetching data for Popular page:", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchAllContent);
</script>

<style scoped>
.swiper-pagination-bullet {
  width: 12px;
  height: 2px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 0;
  margin: 0 4px;
  opacity: 0.5;
}

.swiper-pagination-bullet-active {
  background: #ffffff;
  opacity: 1;
}
</style>
