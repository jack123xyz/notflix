<template>
  <div class="mb-4 mt-8">
    <div class="flex border-b border-white/20">
      <button
        @click="activeTab = 'similar'"
        class="py-2 px-4 mr-4 relative"
        :class="
          activeTab === 'similar' ? 'text-white font-medium' : 'text-white/70'
        "
      >
        More Like This
        <div
          v-if="activeTab === 'similar'"
          class="absolute bottom-0 left-0 right-0 h-1 bg-red-600"
        ></div>
      </button>
      <button
        @click="activeTab = 'episodes'"
        class="py-2 px-4 relative"
        :class="
          activeTab === 'episodes' ? 'text-white font-medium' : 'text-white/70'
        "
      >
        Episodes
        <div
          v-if="activeTab === 'episodes'"
          class="absolute bottom-0 left-0 right-0 h-1 bg-red-600"
        ></div>
      </button>
    </div>
  </div>

  <SimilarContentGrid
    v-if="activeTab === 'similar'"
    :items="similarContent"
    @item-click="handleSimilarClick"
  />

  <EpisodeList
    v-if="activeTab === 'episodes'"
    :show-id="showId"
    :seasons="seasons"
  />
</template>

<script setup>
import { ref } from "vue";
import SimilarContentGrid from "./SimilarContentGrid.vue";
import EpisodeList from "./EpisodeList.vue";

const props = defineProps({
  showId: Number,
  seasons: Array,
  similarContent: Array,
});

const emit = defineEmits(["navigate-to-similar"]);
const activeTab = ref("similar");

function handleSimilarClick(item) {
  emit("navigate-to-similar", item);
}
</script>
