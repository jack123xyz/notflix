<template>
  <div>
    <div class="flex items-center gap-2 text-md">
      <span class="border border-gray-400 px-3 text-gray-400 font-semibold">{{
        contentRating
      }}</span>
      <span class="text-gray-400 text-lg font-semibold">{{
        durationInfo
      }}</span>
      <span
        class="border border-gray-400 rounded text-xs text-gray-400 font-bold px-2"
        >HD</span
      >
    </div>

    <div class="mt-2 text-md text-white">
      <span v-for="(genre, i) in genres" :key="genre">
        {{ genre }}{{ i < genres.length - 1 ? " • " : "" }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  item: Object,
  details: Object,
  contentType: String,
  genres: Array,
});

const durationInfo = computed(() => {
  if (props.contentType === "movie") {
    const runtime = props.details?.runtime || props.item?.runtime;
    if (!runtime) return "";
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return `${hours > 0 ? hours + "h" : ""}${
      minutes > 0 ? " " + minutes + "m" : ""
    }`;
  } else {
    const seasons = props.details?.number_of_seasons;
    return seasons ? `${seasons} Season${seasons > 1 ? "s" : ""}` : "";
  }
});

const contentRating = computed(() => {
  if (props.contentType === "movie") {
    return props.item?.adult ? "R" : "PG-13";
  } else {
    const usRating = props.details?.content_ratings?.results.find(
      (r) => r.iso_3166_1 === "US"
    );
    return usRating?.rating || (props.item?.adult ? "TV-MA" : "TV-14");
  }
});
</script>
