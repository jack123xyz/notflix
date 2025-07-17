<template>
  <div v-if="similarContent && similarContent.length" class="mt-12">
    <h2 class="text-2xl font-semibold mb-4">More Like This</h2>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="item in similarContent"
        :key="item.id"
        class="group relative bg-netflix-gray-250 rounded-lg overflow-hidden cursor-pointer"
      >
        <div class="flex flex-col h-full">
          <div class="aspect-video relative">
            <img
              :src="
                item.backdrop_path
                  ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
                  : 'null'
              "
              :alt="item.title || item.name"
              class="w-full h-full object-cover"
            />
            <div
              class="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            >
              <img
                v-if="logos[item.id]"
                :src="`https://image.tmdb.org/t/p/w300${logos[item.id]}`"
                :alt="`${item.title || item.name} Logo`"
                class="max-h-16 w-auto drop-shadow-lg"
                draggable="false"
              />
              <h3
                v-else
                class="text-white text-center font-bold 2xl:text-md 3xl:text-xl px-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              >
                {{ item.title || item.name }}
              </h3>
            </div>
          </div>

          <div class="bg-netflix-gray-800 p-2 flex flex-col flex-grow">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span
                  class="border border-netflix-gray-100 text-md px-1 py-0 inline-flex text-netflix-gray-25 leading-tight"
                  >{{ mainContentRating || "N/A" }}</span
                >
                <span
                  class="border border-netflix-gray-100 rounded xl:text-xs 2xl:text-sm text-white px-1"
                  >HD</span
                >
                <span class="lg:text-md 3xl:text-lg text-gray-300">{{
                  getYear(item)
                }}</span>
              </div>
              <button
                @click.stop="toggleInList(item)"
                class="border bg-transparent border-gray-400/70 border-2 hover:border-white hover:bg-white/25 text-white rounded-full p-1.5 sm:p-2 transition-colors cursor-pointer"
                :title="
                  isItemInList(item) ? 'Remove from My List' : 'Add to My List'
                "
              >
                <svg
                  v-if="!isItemInList(item)"
                  viewBox="0 0 22 22"
                  class="w-4 h-4 lg:w-4 lg:h-4 2xl:w-5 2xl:h-5"
                  fill="none"
                  stroke="#FFFFFF"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M11 5V17M5 11H17" />
                  {/* A simpler, centered plus path */}
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  class="w-4 h-4 lg:w-4 lg:h-4 2xl:w-5 2xl:h-5"
                >
                  <path
                    d="M5 12L10 17L20 7"
                    stroke="#ffffff"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
            <p
              class="relative xl:text-sm 2xl:text-md text-white/80 line-clamp-3 sm:line-clamp-4 mt-2 flex-grow"
            >
              {{
                item.overview
                  ? item.overview.substring(0, 150) +
                    (item.overview.length > 150 ? "..." : "")
                  : "No description available."
              }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "@/stores/user";

const props = defineProps({
  similarContent: { type: Array, default: () => [] },
  logos: { type: Object, default: () => ({}) },
  mainContentRating: { type: String, default: "N/A" },
});

const userStore = useUserStore();

const getMediaType = (item) =>
  item.media_type || (item.first_air_date ? "tv" : "movie");

const getYear = (item) => {
  const date = item.release_date || item.first_air_date;
  return date ? new Date(date).getFullYear().toString() : "N/A";
};

const isItemInList = (item) =>
  userStore.isItemInMyList(item, getMediaType(item));

const toggleInList = (item) => {
  userStore.toggleListItem(item, getMediaType(item));
};
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
.line-clamp-4 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  overflow: hidden;
}

.group > .flex.flex-col {
  min-height: 100%;
}
</style>
