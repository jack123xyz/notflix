<template>
  <div
    v-if="item"
    class="absolute bg-neutral-900 rounded-md shadow-3xl content-hover-card"
    :style="cardStyle"
    @mouseenter="$emit('keep-hover')"
    @mouseleave="$emit('end-hover')"
  >
    <VideoPlayer
      :trailer-key="trailerKey"
      :backdrop-path="item.backdrop_path"
      :logo-path="logo"
      :title="title"
    />

    <div class="p-10">
      <CardActionButtons
        :is-in-my-list="isInMyList"
        @toggle-my-list="handleToggleMyList"
        @expand="handleExpandClick"
        @play="handlePlayClick"
      />
      <CardInfo
        :item="item"
        :details="itemDetails"
        :content-type="contentType"
        :genres="contentGenres"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useUserStore } from "@/stores/user";
import { contentCardPositioning } from "@/composables/useContentCardPositioning";
import { useContentLoader } from "@/composables/useContentCardLoader";

import VideoPlayer from "./ContentCardVideoPlayer.vue";
import CardActionButtons from "./ContentCardActionButtons.vue";
import CardInfo from "./ContentCardInfo.vue";

const props = defineProps({
  item: Object,
  logo: String,
  position: Object,
  contentType: { type: String, required: true },
  overrideScaleFactor: { type: Number, default: null },
  overrideVerticalOffset: { type: Number, default: null },
});

const emit = defineEmits(["keep-hover", "end-hover", "openModal"]);
const userStore = useUserStore();

const { cardStyle } = contentCardPositioning(props);
const { itemDetails, trailerKey, title, contentGenres } =
  useContentLoader(props);

const isInMyList = computed(() => {
  return userStore.isItemInMyList(props.item, props.contentType);
});

async function handleToggleMyList() {
  if (!userStore.currentProfile) {
    console.warn("No profile selected. Cannot modify list.");
    return;
  }
  try {
    await userStore.toggleListItem(props.item, props.contentType);
  } catch (error) {
    console.error("Error updating My List:", error);
  }
}

function handleExpandClick() {
  emit("openModal", { id: props.item.id, contentType: props.contentType });
}

function handlePlayClick() {
  console.log("Playing:", title.value);
  handleExpandClick(); //
}
</script>

<style scoped>
.content-hover-card {
  animation: hover-card-appear 0.3s cubic-bezier(0.2, 0.89, 0.32, 1.28);
}
@keyframes hover-card-appear {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
