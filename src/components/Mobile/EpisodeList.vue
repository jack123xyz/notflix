<template>
  <div class="mb-14">
    <div class="flex justify-between items-center mb-4">
      <div class="relative w-full max-w-xs season-dropdown">
        <button
          @click="toggleSeasonDropdown"
          class="w-full bg-netflix-gray-200 text-white py-2 px-4 rounded flex justify-between items-center"
        >
          <span>{{ currentSeasonName }}</span>
          <svg
            class="w-4 h-4 ml-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <div
          v-if="isSeasonDropdownOpen"
          class="absolute mt-1 w-full rounded border border-netflix-gray-150 z-50 max-h-60 overflow-auto netflix-dropdown-menu"
        >
          <div class="py-2">
            <button
              v-for="season in seasons"
              :key="season.id"
              @click="selectSeason(season.season_number)"
              class="block w-full text-left px-4 py-2 text-white hover:bg-netflix-gray-150"
              :class="{
                'bg-netflix-gray-800': selectedSeason === season.season_number,
              }"
            >
              {{ season.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="episodes.length > 0" class="space-y-4">
      <div
        v-for="episode in episodes"
        :key="episode.id"
        class="flex bg-netflix-bg-gray rounded-md overflow-hidden"
      >
        <div class="w-1/3 relative">
          <img
            :src="
              episode.still_path
                ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
                : 'https://via.placeholder.com/300x169/000000/FFFFFF?text=No+Preview'
            "
            :alt="episode.name"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="bg-black/50 border border-white rounded-full p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="white"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
        <div class="w-2/3 p-3">
          <div class="flex justify-between">
            <h3 class="font-medium">
              {{ episode.episode_number }}. {{ episode.name }}
            </h3>
            <span class="text-sm text-white/70"
              >{{ episode.runtime || "30" }}m</span
            >
          </div>
          <p class="text-sm text-white/80 mt-1 line-clamp-2">
            {{ episode.overview || "No description available." }}
          </p>
        </div>
      </div>
    </div>
    <div v-else-if="isLoadingEpisodes" class="py-10 flex justify-center">
      <div class="animate-pulse">Loading episodes...</div>
    </div>
    <div v-else class="py-10 text-center text-white/70">
      No episodes available for this season
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  showId: Number,
  seasons: Array,
});

const selectedSeason = ref(null);
const episodes = ref([]);
const isLoadingEpisodes = ref(false);
const isSeasonDropdownOpen = ref(false);

const currentSeasonName = computed(() => {
  const season = props.seasons.find(
    (s) => s.season_number === selectedSeason.value
  );
  return season ? season.name : "Select a season";
});

async function fetchEpisodes() {
  if (selectedSeason.value === null || !props.showId) return;
  isLoadingEpisodes.value = true;
  episodes.value = [];
  try {
    const url = `https://api.themoviedb.org/3/tv/${props.showId}/season/${
      selectedSeason.value
    }?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`;
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch episodes: ${response.status}`);
    const data = await response.json();
    if (data.episodes?.length) episodes.value = data.episodes;
  } catch (error) {
    console.error("Error fetching episodes:", error);
  } finally {
    isLoadingEpisodes.value = false;
  }
}

function toggleSeasonDropdown() {
  isSeasonDropdownOpen.value = !isSeasonDropdownOpen.value;
}
function selectSeason(seasonNumber) {
  selectedSeason.value = seasonNumber;
  isSeasonDropdownOpen.value = false;
}

const handleClickOutside = (e) => {
  const dropdown = document.querySelector(".season-dropdown");
  if (dropdown && !dropdown.contains(e.target)) {
    isSeasonDropdownOpen.value = false;
  }
};

onMounted(() => {
  if (props.seasons && props.seasons.length > 0) {
    selectedSeason.value = props.seasons[0].season_number;
  }
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

watch(selectedSeason, fetchEpisodes, { immediate: true });
</script>

<style scoped>
.netflix-dropdown-menu {
  background-color: #1a1a1a;
}
</style>
