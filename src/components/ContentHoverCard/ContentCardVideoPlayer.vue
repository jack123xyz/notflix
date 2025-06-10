<template>
  <div class="relative aspect-video rounded-t-md overflow-hidden z-[1000]">
    <img
      v-if="!isVideoPlayerReady || !trailerKey"
      :src="getImagePath(backdropPath)"
      :alt="title"
      class="w-full h-full object-cover"
    />

    <div
      class="absolute inset-0 z-10 transition-opacity duration-500"
      :class="{ 'opacity-0': !isVideoPlayerReady || !trailerKey }"
    >
      <div :id="playerId" class="w-full h-full"></div>
    </div>

    <button
      v-if="isVideoPlayerReady && trailerKey"
      @click.stop="toggleMute"
      class="absolute bottom-6 right-6 z-[1010] border border-white/40 hover:border-white bg-gray-500/20 rounded-full p-2 hover:bg-white/20 absolute right-12 xl:p-3 cursor-pointer group"
      aria-label="Toggle Mute"
    >
      <!-- SVG icons -->
      <svg
        v-if="isMuted"
        viewBox="0 0 24 24"
        fill="none"
        class="lg:w-5 2xl:w-6 2xl:h-6 text-white/30 hover:text-white group-hover:text-white"
      >
        <path
          d="M16 9L22 15M22 9L16 15M13 3L7 8H5C3.89543 8 3 8.89543 3 10V14C3 15.1046 3.89543 16 5 16H7L13 21V3Z"
          stroke="#ffffff"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
      <svg
        v-else
        viewBox="0 0 24 24"
        fill="none"
        class="lg:w-5 lg:w-5 2xl:w-6 2xl:h-6 text-white/30 hover:text-white group-hover:text-white"
      >
        <path
          d="M16 9C16.5 9.5 17 10.5 17 12C17 13.5 16.5 14.5 16 15M19 6C20.5 7.5 21 10 21 12C21 14 20.5 16.5 19 18M13 3L7 8H5C3.89543 8 3 8.89543 3 10V14C3 15.1046 3.89543 16 5 16H7L13 21V3Z"
          stroke="#ffffff"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
    </button>

    <div
      v-if="(!isVideoPlayerReady || !trailerKey) && (logoPath || title)"
      class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-[1003]"
    >
      <img
        v-if="logoPath"
        :src="getImagePath(logoPath)"
        :alt="title + ' Logo'"
        class="max-h-10 w-auto mb-2"
      />
      <h3 v-else class="text-xl font-bold text-white">{{ title }}</h3>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from "vue";
import { useAudioControl } from "@/composables/useAudioControl";

const props = defineProps({
  trailerKey: String,
  backdropPath: String,
  logoPath: String,
  title: String,
});

const { requestAudioFocus } = useAudioControl();
let releaseLocalFocus = null;

const isMuted = ref(true);
const player = ref(null);
const isVideoPlayerReady = ref(false);

const playerId = `youtube-player-${Math.random().toString(36).substring(2, 9)}`;

const getImagePath = (path) => {
  if (!path) return "/NotflixLogo.png";
  return path.startsWith("http")
    ? path
    : `https://image.tmdb.org/t/p/w500${path}`;
};

function toggleMute() {
  if (!player.value) return;
  isMuted.value = !isMuted.value;
  if (isMuted.value) {
    player.value.mute();
    if (releaseLocalFocus) {
      releaseLocalFocus();
      releaseLocalFocus = null;
    }
  } else {
    releaseLocalFocus = requestAudioFocus(playerId);
    player.value.unMute();
    player.value.setVolume(100);
  }
}

// loadYouTubeAPI remains the same...
const loadYouTubeAPI = () =>
  new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) return resolve(window.YT);
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.onerror = (e) => reject(e);
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
    document.head.appendChild(tag);
  });

watch(
  () => props.trailerKey,
  async (newKey) => {
    isVideoPlayerReady.value = false;

    if (player.value && typeof player.value.destroy === "function") {
      player.value.destroy();
      player.value = null;
    }

    if (newKey) {
      await nextTick();

      const playerElement = document.getElementById(playerId);
      if (!playerElement) {
        console.error(`Player DOM element #${playerId} not found.`);
        return;
      }

      try {
        const YT = await loadYouTubeAPI();
        player.value = new YT.Player(playerId, {
          videoId: newKey,
          playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
            mute: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              console.log(
                `[VideoPlayer ${props.title}] Player ready for ${newKey}. Playing video.`
              );
              event.target.playVideo();
              isVideoPlayerReady.value = true;
            },
            onError: (event) => {
              console.error(
                `[VideoPlayer ${props.title}] YouTube Player Error for ${newKey}:`,
                event.data
              );
              isVideoPlayerReady.value = false;
            },
            onStateChange: (event) => {
              if (event.data === window.YT?.PlayerState.ENDED) {
                player.value?.seekTo(0);
                player.value?.playVideo();
              }
            },
          },
        });
      } catch (error) {
        console.error(
          `[VideoPlayer ${props.title}] Error initializing YouTube player for ${newKey}:`,
          error
        );
      }
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (player.value && typeof player.value.destroy === "function") {
    player.value.destroy();
    player.value = null;
  }
  if (releaseLocalFocus) {
    releaseLocalFocus();
  }
});
</script>
