<template>
  <div
    class="absolute inset-0 overflow-hidden lg:h-[70vh] xl:h-[85vh] 2xl:h-[100vh] 3xl:h-[100vh] bg-netflix-bg-gray"
  >
    <div
      ref="playerContainer"
      id="featured-trailer-player-container"
      class="relative w-full h-full"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { useAudioControl } from "@/composables/useAudioControl";

const props = defineProps({
  trailerKey: {
    type: String,
    required: true,
  },
  isMuted: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["trailerEnded", "playerReady", "update:isMuted"]);

const { requestAudioFocus, getActiveAudioSource } = useAudioControl();
const componentId = "featured-trailer-player";

let player = null;
let timeMonitor = null;
let audioFocusRelease = null;
const playerContainer = ref(null);
const activeAudioSource = ref(getActiveAudioSource());

const loadYouTubeAPI = () => {
  return new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) {
      return resolve();
    }

    const existingScript = document.getElementById("youtube-iframe-api");
    if (existingScript) {
      const checkAPI = () => {
        if (window.YT && window.YT.Player) {
          resolve();
        } else {
          setTimeout(checkAPI, 100);
        }
      };
      checkAPI();
      return;
    }

    const tag = document.createElement("script");
    tag.id = "youtube-iframe-api";
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    tag.defer = true;

    const originalCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (originalCallback) originalCallback();
      resolve();
    };

    tag.onerror = () => {
      console.error("Failed to load YouTube API");
      reject(new Error("YouTube API failed to load"));
    };

    setTimeout(() => {
      if (!window.YT || !window.YT.Player) {
        reject(new Error("YouTube API load timeout"));
      }
    }, 10000);

    document.head.appendChild(tag);
  });
};

const resizeIframe = () => {
  if (!player?.getIframe) return;
  const iframe = player.getIframe();
  if (iframe) {
    iframe.style.transform = `translate(-50%, -50%) scale(1.5)`;
  }
};

const setupPlayerIframe = (ytPlayer) => {
  const iframe = ytPlayer.getIframe();
  if (!iframe) return;

  Object.assign(iframe.style, {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    pointerEvents: "none",
    transformOrigin: "center center",
  });

  const container = playerContainer.value;
  if (container) {
    Object.assign(container.style, {
      overflow: "hidden",
      position: "relative",
      height: "100%",
    });
  }

  window.addEventListener("resize", resizeIframe);
  resizeIframe();
};

const startVideoMonitor = () => {
  if (timeMonitor) clearInterval(timeMonitor);
  timeMonitor = setInterval(() => {
    if (!player?.getCurrentTime) {
      clearInterval(timeMonitor);
      return;
    }
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    if (duration > 0 && currentTime > duration - 1.5) {
      clearInterval(timeMonitor);
      player.stopVideo();

      emit("trailerEnded");
    }
  }, 1000);
};

const initPlayer = async () => {
  if (!props.trailerKey || !playerContainer.value) return;

  try {
    await loadYouTubeAPI();

    if (!playerContainer.value) {
      console.warn("Player container no longer exists");
      return;
    }

    player = new window.YT.Player("featured-trailer-player-container", {
      videoId: props.trailerKey,
      playerVars: {
        autoplay: 1,
        controls: 0,
        loop: 0,
        playlist: props.trailerKey,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        mute: 1,
        iv_load_policy: 3,
        fs: 0,
        disablekb: 1,
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          try {
            setupPlayerIframe(event.target);
            emit("playerReady");
            startVideoMonitor();
            handleMuteChange();
          } catch (error) {
            console.error("Error in onReady:", error);
          }
        },
        onStateChange: (event) => {
          try {
            if (event.data === window.YT.PlayerState.ENDED) {
              emit("trailerEnded");
              if (audioFocusRelease) {
                audioFocusRelease();
                audioFocusRelease = null;
              }
            }
          } catch (error) {
            console.error("Error in onStateChange:", error);
          }
        },
        onError: (event) => {
          console.error("YouTube player error:", event.data);
        },
      },
    });
  } catch (error) {
    console.error("Failed to initialize YouTube player:", error);
  }
};

const handleMuteChange = () => {
  if (!player) return;
  if (props.isMuted) {
    player.mute();
    if (audioFocusRelease) {
      audioFocusRelease();
      audioFocusRelease = null;
    }
  } else {
    audioFocusRelease = requestAudioFocus(componentId);
    player.unMute();
  }
};

const cleanupPlayer = () => {
  clearInterval(timeMonitor);
  window.removeEventListener("resize", resizeIframe);
  if (player?.destroy) {
    player.destroy();
  }
  player = null;
};

watch(() => props.isMuted, handleMuteChange);

watch(
  () => props.trailerKey,
  (newKey) => {
    cleanupPlayer();
    if (newKey) {
      nextTick(initPlayer);
    }
  }
);

watch(activeAudioSource, (newSource) => {
  if (newSource && newSource !== componentId && !props.isMuted) {
    emit("update:isMuted", true);
  }
});

onMounted(() => {
  nextTick(initPlayer);
});

onBeforeUnmount(cleanupPlayer);

defineExpose({
  replay: () => {
    cleanupPlayer();
    nextTick(initPlayer);
  },
});
</script>
