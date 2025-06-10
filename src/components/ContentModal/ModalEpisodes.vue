<template>
  <div v-if="seasons && seasons.length > 0" class="mt-10">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-semibold">Episodes</h2>
      <div v-if="seasons.length > 1" class="relative">
        <select
          v-model="selectedSeason"
          class="bg-gray-800 border border-gray-600 text-white p-2 rounded"
        >
          <option
            v-for="season in seasons"
            :key="season.id"
            :value="season.season_number"
          >
            {{ season.name }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="isLoadingEpisodes" class="text-center p-4">
      Loading episodes...
    </div>

    <div v-else class="space-y-4 max-h-96 overflow-y-auto pr-2">
      <div
        v-for="episode in episodes"
        :key="episode.id"
        class="flex items-center gap-4 p-2 rounded hover:bg-white/10"
      >
        <span class="text-xl font-bold text-gray-400">{{
          episode.episode_number
        }}</span>
        <img
          :src="`https://image.tmdb.org/t/p/w300${episode.still_path}`"
          class="w-40 h-24 object-cover rounded flex-shrink-0"
        />
        <div class="flex-1">
          <h3 class="font-bold">{{ episode.name }}</h3>
          <p class="text-sm text-gray-300 line-clamp-2">
            {{ episode.overview }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { fetchTVShowSeasonDetails } from "@/api/tmdb";

const props = defineProps({
  tvId: { type: Number, required: true },
  seasons: { type: Array, default: () => [] },
});

const isLoadingEpisodes = ref(false);

const firstRealSeason = props.seasons?.find((s) => s.season_number > 0);
const selectedSeason = ref(firstRealSeason?.season_number || 1);
const episodes = ref([]);

const fetchEpisodes = async (seasonNumber) => {
  if (!props.tvId || !seasonNumber) return;
  isLoadingEpisodes.value = true;
  try {
    const seasonDetails = await fetchTVShowSeasonDetails(
      props.tvId,
      seasonNumber
    );
    episodes.value = seasonDetails.episodes || [];
  } catch (error) {
    console.error(`Error fetching episodes for season ${seasonNumber}:`, error);
    episodes.value = [];
  } finally {
    isLoadingEpisodes.value = false;
  }
};
watch(selectedSeason, (newSeason) => {
  fetchEpisodes(newSeason);
});

onMounted(() => {
  fetchEpisodes(selectedSeason.value);
});
</script>
