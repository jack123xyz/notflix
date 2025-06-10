<template>
  <div class="relative w-full aspect-video mt-14">
    <div v-if="trailerKey && !videoEnded" class="w-full h-full">
      <div ref="youtubeContainer" class="w-full h-full relative z-30"></div>
    </div>
    <div v-else class="w-full h-full bg-black flex items-center justify-center">
      <img
        :src="
          backdropPath
            ? `https://image.tmdb.org/t/p/w1280${backdropPath}`
            : `https://image.tmdb.org/t/p/w500${posterPath}`
        "
        :alt="title"
        class="w-full h-full object-cover"
      />
    </div>

    <div
      class="absolute inset-0 bg-gradient-to-t from-netflix-bg-gray via-transparent to-transparent pointer-events-none"
    ></div>

    <div
      v-if="logoPath"
      class="absolute bottom-16 w-full flex justify-center pointer-events-none"
    >
      <img
        :src="`https://image.tmdb.org/t/p/w500${logoPath}`"
        :alt="title"
        class="max-w-[60%] max-h-16"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from "vue";

const props = defineProps({
  trailerKey: String,
  backdropPath: String,
  posterPath: String,
  logoPath: String,
  title: String,
});

const youtubeContainer = ref(null);
const videoEnded = ref(false);
const isPlaying = ref(true);
let player = null;

function loadYouTubeAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }
    window.onYouTubeIframeAPIReady = resolve;
    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (existingScript) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  });
}

async function setupYouTubePlayer() {
  if (!youtubeContainer.value || !props.trailerKey) return;
  try {
    if (player) {
      player.destroy();
      player = null;
    }
    youtubeContainer.value.innerHTML = "";
    await loadYouTubeAPI();
    const playerElement = document.createElement("div");
    youtubeContainer.value.appendChild(playerElement);
    player = new window.YT.Player(playerElement, {
      videoId: props.trailerKey,
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        mute: 0,
        playsinline: 1,
      },
      events: {
        onReady: (event) => {
          event.target.playVideo();
          videoEnded.value = false;
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            isPlaying.value = true;
            videoEnded.value = false;
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            isPlaying.value = false;
          } else if (event.data === window.YT.PlayerState.ENDED) {
            isPlaying.value = false;
            videoEnded.value = true;
          }
        },
        onError: () => {
          console.error("YouTube Player Error");
        },
      },
    });
  } catch (error) {
    console.error("Error setting up YouTube player:", error);
  }
}

watch(
  () => props.trailerKey,
  (newKey) => {
    if (newKey) {
      nextTick(() => setupYouTubePlayer());
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (player) {
    try {
      player.destroy();
    } catch (e) {
      console.error("Error destroying player:", e);
    }
    player = null;
  }
});
</script>

<style scoped>
.aspect-video {
  position: relative;
}
.aspect-video .absolute {
  z-index: 20;
}
</style>
