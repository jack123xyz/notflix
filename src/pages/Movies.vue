<template>
  <div
    class="min-h-screen bg-netflix-bg-gray text-white z-[1] relative lg:pt-0 pt-13"
  >
    <div
      v-if="isMobileView"
      class="absolute top-0 left-0 right-0 h-[200vh] z-[-1] bg-netflix-bg-gray"
      :style="backgroundGradientStyle"
    ></div>

    <Navbar />

    <div class="relative w-full">
      <div
        v-if="isMobileView"
        class="flex justify-center items-center gap-2 mt-4 mb-4"
      >
        <button
          class="bg-transparent border-1 border-white/60 text-white/60 px-4 py-1.5 rounded-full cursor-pointer"
          @click="router.push({ name: 'TV' })"
        >
          TV Shows
        </button>
        <button
          class="bg-transparent border-1 border-white text-white px-4 py-1.5 rounded-full cursor-pointer"
          @click="router.push({ name: 'Movies' })"
        >
          Movies
        </button>
        <button
          class="bg-transparent border-1 border-white/60 text-white/60 px-4 py-1.5 rounded-full cursor-pointer"
        >
          My List
        </button>
      </div>

      <div
        class="relative w-full h-[150vw] lg:h-[60vh] xl:h-[70vh] 2xl:h-[80vh] min-h-[300px] max-h-[1000px] overflow-visible"
      >
        <MobileFeaturedPoster
          v-if="featuredMovie && isMobileView"
          :title="featuredMovie.title"
          :overview="featuredMovie.overview"
          :poster-path="featuredMovie.poster_path"
          :movie-id="featuredMovie.id"
          :movie="featuredMovie"
          :genres="featuredMovie.genres"
          :logo-path="featuredLogo"
          class="w-full h-full"
          content-type="movie"
          @colors-extracted="updateBackgroundColors"
          @showMoreInfo="openModalWithContent"
        />
        <FeaturedTrailer
          v-if="featuredMovie && !isMobileView"
          :title="featuredMovie.title"
          :overview="featuredMovie.overview"
          :backdrop-path="featuredMovie.backdrop_path"
          :trailer-key="featuredTrailerKey"
          :logo-path="featuredLogo"
          :movie-id="featuredMovie.id"
          :genres="featuredMovie.genres"
          content-type="movie"
          class="hidden lg:block"
          @showMoreInfo="openModalWithContent"
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
          @content-click="openContentModal"
        />
      </div>
    </div>

    <ContentModal
      v-if="isModalVisible"
      :id="modalContentId"
      :contentType="modalContentType"
      @close="closeModal"
    />
    <Footer />
  </div>
</template>

<script setup>
import {
  onMounted,
  ref,
  computed,
  reactive,
  onBeforeMount,
  onBeforeUnmount,
} from "vue";
import { useRouter } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import FeaturedTrailer from "@/components/FeaturedTrailer/FeaturedTrailer.vue";
import MobileFeaturedPoster from "@/components/Mobile/MobileFeaturedPoster.vue";
import ContentCarousel from "@/components/Grids/ContentGrid/ContentCarousel.vue";
import TopTenContentGrid from "@/components/Grids/TopTenContentGrid.vue";
import Footer from "@/components/Footer.vue";
import ContentModal from "@/components/ContentModal/ContentModal.vue";
import {
  fetchTrendingMovies,
  fetchMoviesByGenre,
  fetchMovieTrailers,
  fetchTopTenMovies,
  MOVIE_GENRES,
  fetchMovieLogos,
} from "@/api/tmdb";

const router = useRouter();
const isMobileView = ref(false);
const isLoading = ref(true);

const featuredMovie = ref(null);
const featuredTrailerKey = ref(null);
const featuredLogo = ref(null);

const dominantColors = reactive({ primary: null, secondary: null });
const isModalVisible = ref(false);
const modalContentId = ref(null);
const modalContentType = ref("");

const gridConfig = [
  {
    id: "trending",
    title: "Trending Now",
    component: ContentCarousel,
    contentType: "movie",
    fetcher: fetchTrendingMovies,
  },
  {
    id: "action",
    title: "Action Movies",
    component: ContentCarousel,
    contentType: "movie",
    fetcher: () => fetchMoviesByGenre(MOVIE_GENRES.ACTION),
  },
  {
    id: "horror",
    title: "Horror Movies",
    component: ContentCarousel,
    contentType: "movie",
    fetcher: () => fetchMoviesByGenre(MOVIE_GENRES.HORROR),
  },
  {
    id: "topTen",
    title: "Top 10 Movies in USA Today",
    component: TopTenContentGrid,
    contentType: "movie",
    fetcher: fetchTopTenMovies,
    process: (items) =>
      items
        .slice(0, 10)
        .map((item, index) => ({ ...item, ranking: index + 1 })),
  },
  {
    id: "romance",
    title: "Romance Movies",
    component: ContentCarousel,
    contentType: "movie",
    fetcher: () => fetchMoviesByGenre(MOVIE_GENRES.ROMANCE),
  },
  {
    id: "comedy",
    title: "Comedies",
    component: ContentCarousel,
    contentType: "movie",
    fetcher: () => fetchMoviesByGenre(MOVIE_GENRES.COMEDY),
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
  };
});

function updateBackgroundColors(colors) {
  if (colors?.primary) {
    dominantColors.primary = enhanceColor(colors.primary);
    dominantColors.secondary = colors.secondary;
  }
}

function enhanceColor(color) {
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
}

function checkMobileView() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  isMobileView.value = width < 1024 || (width === 1024 && width / height < 1.5);
}

function openModalWithContent(contentData) {
  if (contentData?.id && contentData?.contentType) {
    modalContentId.value = contentData.id;
    modalContentType.value = contentData.contentType;
    isModalVisible.value = true;
  }
}

function openContentModal(contentFromGrid) {
  if (contentFromGrid?.id) {
    modalContentId.value = contentFromGrid.id;
    modalContentType.value = contentFromGrid.media_type || "movie";
    isModalVisible.value = true;
  }
}

function closeModal() {
  isModalVisible.value = false;
  modalContentId.value = null;
  modalContentType.value = "";
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
      grid.items.forEach((item) => {
        logoPromises.push(
          fetchMovieLogos(item.id).then((logo) => ({
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

    const trendingMovies = contentGrids.value.find(
      (g) => g.id === "trending"
    ).items;
    const moviesWithBackdrop = trendingMovies.filter((m) => m.backdrop_path);
    if (moviesWithBackdrop.length > 0) {
      const randomMovie =
        moviesWithBackdrop[
          Math.floor(Math.random() * moviesWithBackdrop.length)
        ];
      featuredMovie.value = randomMovie;

      [featuredLogo.value, featuredTrailerKey.value] = await Promise.all([
        fetchMovieLogos(randomMovie.id),
        fetchMovieTrailers(randomMovie.id).then(
          (trailers) => trailers[0]?.key || null
        ),
      ]);
    }
  } catch (err) {
    console.error("Error fetching movies:", err);
  } finally {
    isLoading.value = false;
  }
}

onBeforeMount(() => {
  checkMobileView();
  window.addEventListener("resize", checkMobileView);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkMobileView);
});

onMounted(fetchAllContent);
</script>

<style scoped>
.absolute {
  transition: background 0.5s ease-out;
}

.netflix-gradient-fallback {
  background: linear-gradient(
    to bottom,
    rgba(229, 9, 20, 0.85) 0%,
    rgba(229, 9, 20, 0.6) 10%,
    rgba(40, 40, 40, 0.7) 30%,
    rgba(20, 20, 20, 0.95) 50%,
    rgba(20, 20, 20, 1) 70%
  );
}
</style>
