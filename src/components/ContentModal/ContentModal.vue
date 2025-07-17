<template>
  <div
    class="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4"
    @click.stop="close"
  >
    <div
      v-if="!isLoading && details"
      class="content-modal w-full max-h-full overflow-y-auto"
    >
      <div
        class="relative w-full lg:max-w-4xl xl:max-w-4xl 2xl:max-w-4xl 3xl:max-w-7xl mx-auto my-8 bg-netflix-bg-gray rounded-lg shadow-lg overflow-hidden"
        @click.stop
      >
        <button
          @click="close"
          class="absolute right-4 top-4 z-[9999] bg-netflix-bg-gray/80 backdrop-blur-sm rounded-full p-2 hover:bg-white/20 transition-colors"
        >
          <svg viewBox="0 0 24 24" class="w-6 h-6 text-white">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              fill="currentColor"
            />
          </svg>
        </button>

        <ModalVideoPlayer
          :details="details"
          :trailer-key="trailerKey"
          :logo-path="logoPath"
          :is-in-my-list="isInMyList"
          @toggle-my-list="toggleMyListInModal"
        />

        <div class="p-8">
          <ModalDetails
            :details="details"
            :cast="cast"
            :content-rating="contentRating"
          />

          <ModalEpisodes
            v-if="props.contentType === 'tv'"
            :tv-id="props.id"
            :seasons="details.seasons"
          />

          <ModalSimilarContent
            :similar-content="similarContent"
            :logos="similarLogos"
            :main-content-rating="contentRating"
          />
        </div>
      </div>
    </div>

    <div v-else>
      <div
        class="w-16 h-16 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useUserStore } from "@/stores/user";
import { useContentModalData } from "@/composables/useContentModalData";

import ModalVideoPlayer from "./ModalVideoPlayer.vue";
import ModalDetails from "./ModalDetails.vue";
import ModalEpisodes from "./ModalEpisodes.vue";
import ModalSimilarContent from "./ModalSimilarContent.vue";

const props = defineProps({
  id: { type: Number, required: true },
  contentType: { type: String, required: true },
});

const emit = defineEmits(["close"]);
const userStore = useUserStore();

const {
  isLoading,
  details,
  cast,
  trailerKey,
  logoPath,
  similarContent,
  contentRating,
  similarLogos,
} = useContentModalData(props);

const isInMyList = computed(() =>
  details.value
    ? userStore.isItemInMyList(details.value, props.contentType)
    : false
);

const toggleMyListInModal = () => {
  if (details.value) {
    userStore.toggleListItem(details.value, props.contentType);
  }
};

const close = () => emit("close");
</script>

<style scoped>
.content-modal::-webkit-scrollbar {
  display: none;
}
.content-modal {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
