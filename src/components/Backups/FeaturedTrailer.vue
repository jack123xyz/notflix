<template>
  <div class="absolute w-full h-screen flex items-end overflow-visible z-10">
    <img
      v-if="
        backdrop && (hideTrailerOnSmallScreen || !trailerKey || trailerEnded)
      "
      :src="backdrop"
      alt="Backdrop"
      class="absolute inset-0 w-full h-full object-cover z-[2] lg:h-[70vh] xl:h-[85vh] 2xl:h-[100vh] 3xl:h-[100vh]"
      draggable="false"
    />

    <div
      v-if="trailerKey && !trailerEnded && !hideTrailerOnSmallScreen"
      class="absolute inset-1 overflow-hidden lg:h-[70vh] xl:h-[85vh] 2xl:h-[100vh] 3xl:h-[100vh] bg-netflix-bg-gray"
    >
      <div ref="playerEl" class="relative w-full h-full"></div>
    </div>

    <div
      class="absolute -bottom-1 left-0 right-0 z-[5] pointer-events-none"
      :class="[
        hideTrailerOnSmallScreen
          ? 'h-48 sm:h-56'
          : 'h-40 lg:h-48 xl:h-64 2xl:h-72 3xl:h-80',
      ]"
    >
      <div
        class="absolute inset-0 h-1/3 bottom-2/3"
        :style="{
          background:
            'linear-gradient(to bottom, rgba(20, 20, 20, 0) 0%, rgba(20, 20, 20, 0.3) 100%)',
        }"
      ></div>

      <div
        class="absolute inset-0 h-1/3 top-1/3 bottom-1/3"
        :style="{
          background:
            'linear-gradient(to bottom, rgba(20, 20, 20, 0.3) 0%, rgba(20, 20, 20, 0.6) 100%)',
          backdropFilter: 'blur(1px)',
          WebkitBackdropFilter: 'blur(1px)',
        }"
      ></div>

      <div
        class="absolute inset-0 h-1/3 top-2/3"
        :style="{
          background:
            'linear-gradient(to bottom, rgba(20, 20, 20, 0.6) 0%, rgba(20, 20, 20, 0.9) 70%, rgba(20, 20, 20, 1) 100%)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }"
      ></div>
    </div>

    <div class="relative w-full h-full z-20">
      <div
        class="absolute left-0 w-full h-[50vh] min-h-[350px] max-h-[650px] top-1/2 -translate-y-1/2 flex flex-col"
      >
        <div
          class="text-white z-30 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-sm xl:max-w-3xl 2xl:max-w-3xl 3xl:max-w-5xl"
          :class="[
            showDescription
              ? 'mt-10 lg:mt-12 xl:mt-16 2xl:mt-20 3xl:mt-1'
              : 'mt-16 lg:mt-20 xl:mt-24 2xl:mt-28 3xl:mt-40',
          ]"
          :style="{
            marginLeft: calculateLeftPosition(),
            transformOrigin: 'left center',
            transform: logoLarge
              ? 'translate3d(0, 0, 0) scale(1)'
              : 'translate3d(0, 0, 0) scale(0.8)',
            transition: 'transform 1000ms cubic-bezier(0.2, 0, 0.2, 1)',
          }"
        >
          <img
            v-if="logoPath"
            :src="`https://image.tmdb.org/t/p/original${logoPath}`"
            alt="Movie Logo"
            :class="logoClasses"
            draggable="false"
          />
          <h1
            v-else
            class="font-bold drop-shadow-lg mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
          >
            {{ title }}
          </h1>

          <div
            v-if="hideTrailerOnSmallScreen && genres.length"
            class="flex flex-wrap gap-2 mt-3"
          >
            <span
              v-for="genre in genres"
              :key="genre.id"
              class="px-2 py-1 bg-netflix-gray-100/50 text-white text-xs sm:text-sm rounded-sm"
            >
              {{ genre.name }}
            </span>
          </div>

          <transition name="fade">
            <p
              v-if="showDescription && !hideTrailerOnSmallScreen"
              class="text-base sm:text-lg md:text-xl lg:text-sm xl:text-lg 2xl:text-xl 3xl:text-2xl font-semibold text-white/90 text-shadow-sm mt-4 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-md xl:max-w-xl 2xl:max-w-2xl"
            >
              {{ overview }}
            </p>
          </transition>
          <slot />
        </div>

        <div
          class="transition-all duration-1000"
          :style="{
            marginLeft: calculateLeftPosition(),
            marginTop: logoLarge ? (showDescription ? '2rem' : '2rem') : '3rem',
            transform: logoLarge ? 'translateY(0)' : 'translateY(-1rem)',
          }"
        >
          <div class="flex flex-row items-center gap-4">
            <button
              class="bg-white hover:bg-white/80 lg:px-6 xl:px-6 2xl:px-9 3xl:px-10 lg:py-2 2xl:py-2.5 3xl:py-3 rounded transition cursor-pointer flex items-center justify-center"
            >
              <svg
                fill="#000000"
                version="1.1"
                class="w-4 sm:w-5 md:w-6 lg:w-6 xl:w-7 2xl:w-7 3xl:w-8 mr-2"
                viewBox="0 0 512 512"
              >
                <path
                  d="M500.203,236.907L30.869,2.24c-6.613-3.285-14.443-2.944-20.736,0.939C3.84,7.083,0,13.931,0,21.333v469.333 c0,7.403,3.84,14.251,10.133,18.155c3.413,2.112,7.296,3.179,11.2,3.179c3.264,0,6.528-0.747,9.536-2.24l469.333-234.667 C507.435,271.467,512,264.085,512,256S507.435,240.533,500.203,236.907z"
                ></path>
              </svg>
              <span
                class="font-semibold text-sm sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl inline-block text-black"
                >Play</span
              >
            </button>

            <button
              aria-label="Info Button"
              class="bg-netflix-gray-100/50 hover:bg-white/20 lg:px-5 xl:px-6 2xl:px-7 lg:py-1 xl:py-1 2xl:py-1.5 rounded transition cursor-pointer flex items-center justify-center"
              @click="handleMoreInfoClick"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                class="h-6 sm:h-7 md:h-8 lg:h-8 xl:h-9 2xl:h-10 3xl:h-11 text-white inline-block"
              >
                <path
                  id="Vector"
                  d="M12 11V16M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 8V8.1L11.9502 8.1002V8H12.0498Z"
                  stroke="#ffffff"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
              <span
                class="font-semibold text-sm sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl pl-2 inline-block"
                >More Info</span
              >
            </button>
          </div>
        </div>
      </div>

      <div
        class="absolute right-0 lg:bottom-125 xl:bottom-120 2xl:bottom-85 3xl:bottom-120 flex items-end gap-4"
      >
        <button
          v-if="trailerKey && !trailerEnded && !hideTrailerOnSmallScreen"
          @click="toggleMute"
          class="bg-transparent border-white border hover:bg-white/20 rounded-full p-1 sm:p-1 md:p-1.5 lg:p-1.5 xl:p-2 2xl:p-2 3xl:p-3 transition cursor-pointer"
          aria-label="Toggle Mute"
        >
          <svg
            v-if="isMuted"
            viewBox="0 0 24 24"
            fill="none"
            class="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7 3xl:w-8 3xl:h-8 text-white"
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
            class="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7 3xl:w-8 3xl:h-8 text-white"
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

        <button
          v-if="trailerKey && trailerEnded && !hideTrailerOnSmallScreen"
          @click="replayTrailer"
          class="bg-transparent border-white border hover:bg-white/20 rounded-full p-1 sm:p-1 md:p-1.5 lg:p-1.5 xl:p-2 2xl:p-2 3xl:p-3 transition cursor-pointer"
          aria-label="Replay Trailer"
        >
          <svg
            fill="#ffffff"
            class="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7 3xl:w-8 3xl:h-8 text-white"
            viewBox="0 0 76.398 76.398"
          >
            <path
              d="M58.828,16.208l-3.686,4.735c7.944,6.182,11.908,16.191,10.345,26.123C63.121,62.112,48.954,72.432,33.908,70.06 C18.863,67.69,8.547,53.522,10.912,38.477c1.146-7.289,5.063-13.694,11.028-18.037c5.207-3.79,11.433-5.613,17.776-5.252 l-5.187,5.442l3.848,3.671l8.188-8.596l0.002,0.003l3.668-3.852L46.39,8.188l-0.002,0.001L37.795,0l-3.671,3.852l5.6,5.334 c-7.613-0.36-15.065,1.853-21.316,6.403c-7.26,5.286-12.027,13.083-13.423,21.956c-2.879,18.313,9.676,35.558,27.989,38.442 c1.763,0.277,3.514,0.411,5.245,0.411c16.254-0.001,30.591-11.85,33.195-28.4C73.317,35.911,68.494,23.73,58.828,16.208z"
            ></path>
          </svg>
        </button>

        <div
          v-if="contentRating"
          class="flex items-center bg-[rgba(51,51,51,0.6)] border-l-[3px] border-l-[#dcdcdc] lg:h-[2.4vw] xl:h-[2.4vw] 2xl:h-[2.3vw] pl-[0.8vw] pr-[5vw]"
        >
          <span
            class="text-white text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl font-medium whitespace-nowrap"
          >
            {{ contentRating }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import { fetchMovieRatings, fetchTVShowRatings } from "@/api/tmdb";
import { useAudioControl } from "@/composables/useAudioControl";

const props = defineProps({
  title: String,
  overview: String,
  backdropPath: String,
  trailerKey: String,
  logoPath: String,
  movieId: Number,
  genres: {
    type: Array,
    default: () => [],
  },
  contentType: {
    type: String,
    default: "movie",
    validator: (value) => ["movie", "tv"].includes(value),
  },
});

const hideTrailerOnSmallScreen = computed(() => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspectRatio = width / height;

  return width < 1024 || (width === 1024 && aspectRatio < 1.5);
});

const { requestAudioFocus, getActiveAudioSource } = useAudioControl();
const activeAudioSource = ref(getActiveAudioSource());
let releaseAudioFocus = null;

const componentId = "featured-trailer";

const backdrop = computed(() =>
  props.backdropPath
    ? `https://image.tmdb.org/t/p/original${props.backdropPath}`
    : null
);

const trailerEnded = ref(false);
const playerEl = ref(null);
let player = null;

const isMuted = ref(true);

const showDescription = ref(true);
const logoLarge = ref(true);

const contentRating = ref(null);

const DEBUG_LOGO = false;

if (DEBUG_LOGO) {
  logoLarge.value = true;
  showDescription.value = true;
}

function handleTrailerStart() {
  setTimeout(() => {
    logoLarge.value = false;
    showDescription.value = false;
  }, 7000);
}

function handleTrailerEnd() {
  logoLarge.value = true;
  showDescription.value = true;
}

function loadYouTubeAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
    } else if (window._ytApiLoading) {
      window._ytApiLoading.then(resolve);
    } else {
      window._ytApiLoading = new Promise((res) => {
        window.onYouTubeIframeAPIReady = () => {
          res();
          resolve();
        };
      });
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  });
}

function calculateLeftPosition() {
  const width = window.innerWidth;

  if (width < 640) {
    return "1.5rem";
  } else if (width < 768) {
    return "2rem";
  } else if (width < 1024) {
    return "3rem";
  } else if (width < 1280) {
    return "2rem";
  } else if (width < 1536) {
    return "2rem";
  } else if (width < 1940) {
    return "5rem";
  } else {
    return "6rem";
  }
}

function handleResize() {
  checkScreenSize();

  nextTick(() => {
    logoLarge.value = logoLarge.value;
  });
}

onMounted(async () => {
  window.addEventListener("resize", handleResize);

  if (props.trailerKey) {
    await safeCreatePlayer();
  }
});

watch(activeAudioSource, (newSource) => {
  if (newSource && newSource !== componentId) {
    isMuted.value = true;

    if (player) {
      try {
        player.mute();
      } catch (error) {
        console.error("Error muting on audio focus change:", error);
      }
    }
  }
});

function toggleMute() {
  if (!player) return;

  isMuted.value = !isMuted.value;

  if (!isMuted.value) {
    releaseAudioFocus = requestAudioFocus(componentId);
    player.unMute();
  } else {
    player.mute();

    if (releaseAudioFocus) {
      releaseAudioFocus();
      releaseAudioFocus = null;
    }
  }
}

async function createPlayer() {
  if (hideTrailerOnSmallScreen.value) return;

  if (!props.trailerKey || !playerEl.value) return;
  await loadYouTubeAPI();
  player = new window.YT.Player(playerEl.value, {
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
        player.mute();
        isMuted.value = true;

        const iframe = event.target.getIframe();
        if (iframe) {
          iframe.style.position = "absolute";
          iframe.style.top = "50%";
          iframe.style.left = "50%";
          iframe.style.width = "100%";
          iframe.style.height = "100%";
          iframe.style.objectFit = "cover";
          iframe.style.pointerEvents = "none";
          iframe.style.transform = "translate(-50%, -50%) scale(1.5)";
          iframe.style.transformOrigin = "center center";

          const container = playerEl.value;
          if (container) {
            container.style.overflow = "hidden";
            container.style.position = "relative";
            container.style.height = "100%";
          }

          window.addEventListener("resize", adjustIframePosition);
          adjustIframePosition();

          handleTrailerStart();
          monitorVideoTime();
        }
      },
      onStateChange: (event) => {
        if (event.data === window.YT.PlayerState.ENDED) {
          trailerEnded.value = true;
          handleTrailerEnd();

          if (releaseAudioFocus) {
            releaseAudioFocus();
            releaseAudioFocus = null;
          }
        }
      },
    },
  });
}

function adjustIframePosition() {
  if (!player) return;

  try {
    const iframe = player.getIframe();
    const container = playerEl.value;
    if (!iframe || !container) return;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const windowWidth = window.innerWidth;

    let scale;

    if (windowWidth < 640) {
      scale = 1.7;
    } else if (windowWidth < 768) {
      scale = 1.6;
    } else if (windowWidth < 1024) {
      scale = 1.5;
    } else if (windowWidth < 1280) {
      scale = 1.4;
    } else if (windowWidth < 1536) {
      scale = 1.3;
    } else {
      const dynamicScale = Math.max(
        1.2,
        containerWidth / containerHeight > 16 / 9
          ? (containerWidth / (containerHeight * (16 / 9))) * 1.1
          : (containerHeight / (containerWidth * (9 / 16))) * 1.1
      );
      scale = dynamicScale;
    }

    iframe.style.transform = `translate(-50%, -50%) scale(${scale})`;

    container.style.overflow = "hidden";
  } catch (e) {
    console.error("Error adjusting iframe position:", e);
  }
}

function monitorVideoTime() {
  if (!player) return;

  const checkTimeInterval = setInterval(() => {
    if (!player || trailerEnded.value) {
      clearInterval(checkTimeInterval);
      return;
    }

    try {
      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();

      if (duration > 0 && currentTime > 0 && duration - currentTime < 1.5) {
        clearInterval(checkTimeInterval);
        trailerEnded.value = true;
        handleTrailerEnd();
        player.stopVideo();
      }
    } catch (e) {
      console.error("Error monitoring video time:", e);
      clearInterval(checkTimeInterval);
    }
  }, 1000);

  onBeforeUnmount(() => {
    clearInterval(checkTimeInterval);
  });
}

async function safeCreatePlayer() {
  await nextTick();

  await loadYouTubeAPI();

  if (props.trailerKey && playerEl.value) {
    createPlayer();
  }
}

function replayTrailer() {
  if (!props.trailerKey) return;

  trailerEnded.value = false;
  logoLarge.value = true;
  showDescription.value = true;

  if (player) {
    player.destroy();
    player = null;
  }

  nextTick(() => {
    createPlayer();
  });
}

watch(
  () => [props.movieId, props.contentType],
  async ([newId, contentType]) => {
    if (newId) {
      try {
        if (contentType === "tv") {
          contentRating.value = await fetchTVShowRatings(newId);
        } else {
          contentRating.value = await fetchMovieRatings(newId);
        }
      } catch (error) {
        console.error(`Failed to fetch ${contentType} rating:`, error);
      }
    }
  },
  { immediate: true }
);

watch(
  () => props.trailerKey,
  async (newKey) => {
    trailerEnded.value = false;
    isMuted.value = false;
    logoLarge.value = true;
    showDescription.value = true;
    if (player) {
      player.destroy();
      player = null;
    }
    if (newKey) {
      await safeCreatePlayer();
    }
  }
);

const logoClasses = computed(() => {
  const baseClasses = "w-auto drop-shadow-lg";

  if (logoLarge.value) {
    return `${baseClasses} max-h-32 sm:max-h-40 md:max-h-48 lg:max-h-45 lg:max-w-[75%] xl:max-h-20 2xl:max-h-34 2xl:max-w-[80%] 3xl:max-h-72`;
  } else {
    return `${baseClasses} max-h-24 sm:max-h-28 md:max-h-32 lg:max-h-25 xl:max-h-35 2xl:max-h-44 3xl:max-h-48 opacity-90`;
  }
});

function checkScreenSize() {
  if (hideTrailerOnSmallScreen.value && player) {
    player.destroy();
    player = null;
  } else if (!hideTrailerOnSmallScreen.value && props.trailerKey && !player) {
    safeCreatePlayer();
  }
}

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);

  if (player) {
    player.destroy();
    player = null;
  }
});

const emit = defineEmits(["showMoreInfo"]);

function handleMoreInfoClick() {
  if (props.movieId && props.contentType) {
    emit("showMoreInfo", { id: props.movieId, contentType: props.contentType });
  } else {
    console.warn(
      "FeaturedTrailer: movieId or contentType is missing, cannot open modal."
    );
  }
}
</script>
