<template>
  <div>
    <h1 class="text-2xl font-bold mb-3">{{ title }}</h1>

    <div class="flex items-center text-sm text-white/70 mb-4 ml-2">
      <span class="mx-2">{{ releaseYear }}</span>
      <span class="age-rating px-1 border border-white/40 mx-2">{{
        ageRating
      }}</span>
      <span>{{ duration }}</span>
      <span v-if="contentType === 'tv'" class="ml-2">{{ seasonInfo }}</span>
    </div>

    <p class="text-sm leading-relaxed mb-6">{{ content.overview }}</p>

    <div v-if="cast.length" class="mb-6">
      <h3 class="text-white/70 text-sm mb-1">Cast:</h3>
      <p class="text-sm">{{ castList }}</p>
    </div>

    <div v-if="genres.length" class="mb-6">
      <h3 class="text-white/70 text-sm mb-1">Genres:</h3>
      <p class="text-sm">{{ genreList }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  content: Object,
  cast: Array,
  contentType: String,
});

const title = computed(() =>
  props.contentType === "movie" ? props.content.title : props.content.name
);
const releaseYear = computed(() => {
  if (!props.content) return "";
  const dateString =
    props.contentType === "movie"
      ? props.content.release_date
      : props.content.first_air_date;
  return dateString ? new Date(dateString).getFullYear() : "";
});
const duration = computed(() => {
  if (!props.content) return "";
  if (props.contentType === "movie" && props.content.runtime) {
    const hours = Math.floor(props.content.runtime / 60);
    const minutes = props.content.runtime % 60;
    return `${hours}h ${minutes}m`;
  }
  if (props.contentType === "tv" && props.content.episode_run_time?.length) {
    return `${props.content.episode_run_time[0]}m`;
  }
  return "";
});
const seasonInfo = computed(() => {
  if (!props.content || props.contentType !== "tv") return "";
  const seasonCount = props.content.number_of_seasons || 0;
  return seasonCount === 1 ? "1 Season" : `${seasonCount} Seasons`;
});
const ageRating = computed(() => (props.content.adult ? "18+" : "PG-13"));
const genres = computed(() => props.content.genres || []);
const genreList = computed(() =>
  genres.value.map((genre) => genre.name).join(", ")
);
const castList = computed(() =>
  props.cast
    .slice(0, 5)
    .map((person) => person.name)
    .join(", ")
);
</script>
