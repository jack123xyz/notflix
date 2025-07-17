<template>
  <div class="relative w-full aspect-video bg-black">
    <img
      v-if="!trailerKey || trailerEnded"
      :src="`https://image.tmdb.org/t/p/original${details.backdrop_path}`"
      alt="Backdrop"
      class="w-full h-full object-cover"
    />

    <div
      v-if="trailerKey && !trailerEnded"
      class="absolute inset-0 overflow-hidden pointer-events-none"
    >
      <div ref="playerEl" class="relative w-full h-full"></div>
    </div>

    <div
      class="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
      style="
        background: linear-gradient(
          to top,
          rgba(20, 20, 20, 1) 0%,
          rgba(20, 20, 20, 0) 100%
        );
      "
    ></div>

    <div class="absolute bottom-0 left-0 right-0 p-8">
      <img
        v-if="logoPath"
        :src="`https://image.tmdb.org/t/p/w500${logoPath}`"
        alt="Title Logo"
        class="lg:max-h-20 w-auto mb-6"
      />
      <h1 v-else class="text-5xl font-bold mb-4">
        {{ details.title || details.name }}
      </h1>
      <div class="flex items-center gap-3">
        <button
          class="bg-white text-black hover:bg-white/90 lg:px-7 lg:py-1.5 xl:px-7 2xl:px-9 xl:py-1.5 2xl:py-2 3xl:py-3 rounded flex items-center font-semibold"
        >
          <svg fill="#000000" class="w-6 h-6 mr-2" viewBox="0 0 512 512">
            <path
              d="M500.203,236.907L30.869,2.24c-6.613-3.285-14.443-2.944-20.736,0.939C3.84,7.083,0,13.931,0,21.333v469.333 c0,7.403,3.84,14.251,10.133,18.155c3.413,2.112,7.296,3.179,11.2,3.179c3.264,0,6.528-0.747,9.536-2.24l469.333-234.667 C507.435,271.467,512,264.085,512,256S507.435,240.533,500.203,236.907z"
            ></path>
          </svg>
          <span class="text-xl font-semibold">Play</span>
        </button>

        <button
          @click.stop="$emit('toggleMyList')"
          class="border bg-white/10 border-gray-400 border-2 hover:border-white text-white rounded-full p-3 transition-colors cursor-pointer"
        >
          <svg
            v-if="!isInMyList"
            viewBox="0 -0.5 21 21"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            fill="#000000"
            class="lg:w-4 lg:h-4 2xl:w-6 2xl:h-6"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <title>plus [#1512]</title>
              <desc>Created with Sketch.</desc>
              <defs></defs>
              <g
                id="Page-1"
                stroke="none"
                stroke-width="1"
                fill="none"
                fill-rule="evenodd"
              >
                <g
                  id="Dribbble-Light-Preview"
                  transform="translate(-379.000000, -240.000000)"
                  fill="#ffffff"
                >
                  <g id="icons" transform="translate(56.000000, 160.000000)">
                    <polygon
                      id="plus-[#1512]"
                      points="344 89 344 91 334.55 91 334.55 100 332.45 100 332.45 91 323 91 323 89 332.45 89 332.45 80 334.55 80 334.55 89"
                    ></polygon>
                  </g>
                </g>
              </g>
            </g>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" class="w-6 h-6">
            <path
              d="M5 12L10 17L20 7"
              stroke="#ffffff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <button
          class="border border-2 bg-white/8 border-gray-400/70 text-white rounded-full p-3 hover:bg-white/15 transition-colors relative cursor-pointer"
          @mouseenter="isRatingPopupOpen = true"
          @mouseleave="handleMouseLeave"
          @click.stop="isRatingPopupOpen = !isRatingPopupOpen"
        >
          <svg
            v-if="getCurrentRating === null || getCurrentRating === 'like'"
            viewBox="-2.4 -2.4 28.80 28.80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="lg:w-5 xl:w-5 2xl:w-6 2xl:h-6"
          >
            <g id="SVGRepo_iconCarrier">
              <path
                d="M11.6049 5.78212L11.8341 3.41331C11.9263 2.46119 12.8146 1.81535 13.7128 2.04742C15.0643 2.39662 16.0125 3.65163 16.0125 5.09141V8.12624C16.0125 8.80124 16.0125 9.13874 16.159 9.3869C16.2419 9.52729 16.3561 9.64523 16.4919 9.73092C16.732 9.88239 17.0586 9.88239 17.7117 9.88239H18.108C19.8108 9.88239 20.6622 9.88239 21.1864 10.2729C21.5786 10.5649 21.8552 10.9937 21.9652 11.4801C22.1124 12.1304 21.7849 12.9426 21.13 14.5671L20.8035 15.3769C20.6149 15.8447 20.5377 16.3523 20.5784 16.8573C20.8101 19.7306 18.5307 22.1524 15.7451 21.9925L5.32067 21.394C4.18227 21.3286 3.61307 21.2959 3.09856 20.8408C2.58406 20.3856 2.48726 19.9169 2.29365 18.9797C2.12862 18.1807 2 17.2012 2 16.0888C2 14.855 2.15821 13.7847 2.34883 12.943C2.63157 11.6945 3.8242 11.0232 5.05534 11.1822C8.31887 11.6038 11.2777 9.16429 11.6049 5.78212Z"
                :fill="getCurrentRating === 'like' ? '#ffffff' : 'none'"
                stroke="#ffffff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M7.00008 11.5L6.86309 11.9566C5.97611 14.9132 6.02395 18.0716 7.00008 21"
                :fill="getCurrentRating === 'like' ? '#ffffff' : 'none'"
                stroke="#ffffff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </g>
          </svg>
          <div
            v-else-if="getCurrentRating === 'not-for-me'"
            class="thumbs-down-container"
          >
            <svg
              viewBox="-2.4 -2.4 28.80 28.80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="lg:w-5 xl:w-5 2xl:w-6 2xl:h-6"
            >
              <path
                d="M11.6049 5.78212L11.8341 3.41331C11.9263 2.46119 12.8146 1.81535 13.7128 2.04742C15.0643 2.39662 16.0125 3.65163 16.0125 5.09141V8.12624C16.0125 8.80124 16.0125 9.13874 16.159 9.3869C16.2419 9.52729 16.3561 9.64523 16.4919 9.73092C16.732 9.88239 17.0586 9.88239 17.7117 9.88239H18.108C19.8108 9.88239 20.6622 9.88239 21.1864 10.2729C21.5786 10.5649 21.8552 10.9937 21.9652 11.4801C22.1124 12.1304 21.7849 12.9426 21.13 14.5671L20.8035 15.3769C20.6149 15.8447 20.5377 16.3523 20.5784 16.8573C20.8101 19.7306 18.5307 22.1524 15.7451 21.9925L5.32067 21.394C4.18227 21.3286 3.61307 21.2959 3.09856 20.8408C2.58406 20.3856 2.48726 19.9169 2.29365 18.9797C2.12862 18.1807 2 17.2012 2 16.0888C2 14.855 2.15821 13.7847 2.34883 12.943C2.63157 11.6945 3.8242 11.0232 5.05534 11.1822C8.31887 11.6038 11.2777 9.16429 11.6049 5.78212Z"
                fill="#ffffff"
                stroke="#ffffff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M7.00008 11.5L6.86309 11.9566C5.97611 14.9132 6.02395 18.0716 7.00008 21"
                fill="#ffffff"
                stroke="#ffffff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
          </div>
          <svg
            v-else-if="getCurrentRating === 'love'"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="lg:w-5 xl:w-5 2xl:w-6 2xl:h-6"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
              :fill="getCurrentRating === 'love' ? '#ffffff' : 'none'"
              stroke="#ffffff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>

          <transition
            name="rating-popup"
            enter-active-class="transition-all duration-300 ease-out delay-300"
            leave-active-class="transition-all duration-200 ease-in"
            enter-from-class="opacity-0 transform scale-x-0"
            enter-to-class="opacity-100 transform scale-x-100"
            leave-from-class="opacity-100 transform scale-x-100"
            leave-to-class="opacity-0 transform scale-x-0"
          >
            <div
              v-if="isRatingPopupOpen"
              class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-netflix-bg-gray rounded-full py-4 px-8 z-50 flex items-center gap-5 origin-center"
              @mouseenter="isRatingPopupOpen = true"
              @mouseleave="isRatingPopupOpen = false"
            >
              <button
                class="flex flex-col items-center hover:scale-110 transition-transform"
                @click.stop="selectRating('not-for-me')"
              >
                <div class="thumbs-down-container">
                  <svg
                    viewBox="-2.4 -2.4 28.80 28.80"
                    fill="none"
                    class="w-7 h-7 cursor-pointer"
                    aria-label="Not for me"
                  >
                    <path
                      d="M11.6049 5.78212L11.8341 3.41331C11.9263 2.46119 12.8146 1.81535 13.7128 2.04742C15.0643 2.39662 16.0125 3.65163 16.0125 5.09141V8.12624C16.0125 8.80124 16.0125 9.13874 16.159 9.3869C16.2419 9.52729 16.3561 9.64523 16.4919 9.73092C16.732 9.88239 17.0586 9.88239 17.7117 9.88239H18.108C19.8108 9.88239 20.6622 9.88239 21.1864 10.2729C21.5786 10.5649 21.8552 10.9937 21.9652 11.4801C22.1124 12.1304 21.7849 12.9426 21.13 14.5671L20.8035 15.3769C20.6149 15.8447 20.5377 16.3523 20.5784 16.8573C20.8101 19.7306 18.5307 22.1524 15.7451 21.9925L5.32067 21.394C4.18227 21.3286 3.61307 21.2959 3.09856 20.8408C2.58406 20.3856 2.48726 19.9169 2.29365 18.9797C2.12862 18.1807 2 17.2012 2 16.0888C2 14.855 2.15821 13.7847 2.34883 12.943C2.63157 11.6945 3.8242 11.0232 5.05534 11.1822C8.31887 11.6038 11.2777 9.16429 11.6049 5.78212Z"
                      :fill="
                        getCurrentRating === 'not-for-me' ? '#ffffff' : 'none'
                      "
                      stroke="#ffffff"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                    <path
                      d="M7.00008 11.5L6.86309 11.9566C5.97611 14.9132 6.02395 18.0716 7.00008 21"
                      :fill="
                        getCurrentRating === 'not-for-me' ? '#ffffff' : 'none'
                      "
                      stroke="#ffffff"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                  </svg>
                </div>
              </button>

              <button
                class="flex flex-col items-center hover:scale-110 transition-transform"
                @click.stop="selectRating('like')"
              >
                <svg
                  viewBox="-2.4 -2.4 28.80 28.80"
                  fill="none"
                  class="w-7 h-7 cursor-pointer"
                  aria-label="I like this"
                >
                  <path
                    d="M11.6049 5.78212L11.8341 3.41331C11.9263 2.46119 12.8146 1.81535 13.7128 2.04742C15.0643 2.39662 16.0125 3.65163 16.0125 5.09141V8.12624C16.0125 8.80124 16.0125 9.13874 16.159 9.3869C16.2419 9.52729 16.3561 9.64523 16.4919 9.73092C16.732 9.88239 17.0586 9.88239 17.7117 9.88239H18.108C19.8108 9.88239 20.6622 9.88239 21.1864 10.2729C21.5786 10.5649 21.8552 10.9937 21.9652 11.4801C22.1124 12.1304 21.7849 12.9426 21.13 14.5671L20.8035 15.3769C20.6149 15.8447 20.5377 16.3523 20.5784 16.8573C20.8101 19.7306 18.5307 22.1524 15.7451 21.9925L5.32067 21.394C4.18227 21.3286 3.61307 21.2959 3.09856 20.8408C2.58406 20.3856 2.48726 19.9169 2.29365 18.9797C2.12862 18.1807 2 17.2012 2 16.0888C2 14.855 2.15821 13.7847 2.34883 12.943C2.63157 11.6945 3.8242 11.0232 5.05534 11.1822C8.31887 11.6038 11.2777 9.16429 11.6049 5.78212Z"
                    :fill="getCurrentRating === 'like' ? '#ffffff' : 'none'"
                    stroke="#ffffff"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                  <path
                    d="M7.00008 11.5L6.86309 11.9566C5.97611 14.9132 6.02395 18.0716 7.00008 21"
                    :fill="getCurrentRating === 'like' ? '#ffffff' : 'none'"
                    stroke="#ffffff"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                </svg>
              </button>

              <button
                class="flex flex-col items-center hover:scale-110 transition-transform"
                @click.stop="selectRating('love')"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  class="w-7 h-7 cursor-pointer"
                  aria-label="Love this"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
                    :fill="getCurrentRating === 'love' ? '#ffffff' : 'none'"
                    stroke="#ffffff"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                </svg>
              </button>
            </div>
          </transition>
        </button>
        <button
          v-if="trailerKey && !trailerEnded"
          @click="toggleMute"
          class="border border-white/40 hover:border-white bg-gray-500/20 rounded-full p-2 hover:bg-white/20 absolute right-12 xl:p-3 cursor-pointer group"
          aria-label="Toggle mute"
        >
          <svg
            v-if="isMuted"
            viewBox="0 0 24 24"
            fill="none"
            class="lg:w-5 2xl:w-6 2xl:h-6 text-white/30 hover:text-white group-hover:text-white"
          >
            <path
              d="M16 9L22 15M22 9L16 15M13 3L7 8H5C3.89543 8 3 8.89543 3 10V14C3 15.1046 3.89543 16 5 16H7L13 21V3Z"
              stroke="currentColor"
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
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        </button>

        <button
          v-if="trailerKey && trailerEnded"
          @click="replayTrailer"
          class="bg-transparent border-white/70 border hover:bg-white/20 rounded-full p-1 absolute right-12 lg:p-1.5 xl:p-2 2xl:p-2 3xl:p-3 transition cursor-pointer"
          aria-label="Replay Trailer"
        >
          <svg
            fill="#ffffff"
            class="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7 3xl:w-7 3xl:h-7 text-white"
            viewBox="0 0 76.398 76.398"
          >
            <path
              d="M58.828,16.208l-3.686,4.735c7.944,6.182,11.908,16.191 10.345,26.123C63.121,62.112,48.954,72.432,33.908,70.06C18.863,67.69,8.547,53.522,10.912,38.477c1.146-7.289,5.063-13.694,11.028-18.037c5.207-3.79,11.433-5.613,17.776-5.252l-5.187,5.442l3.848,3.671l8.188-8.596l0.002,0.003l3.668-3.852L46.39,8.188l-0.002,0.001L37.795,0l-3.671,3.852l5.6,5.334c-7.613-0.36-15.065,1.853-21.316,6.403c-7.26,5.286-12.027,13.083-13.423,21.956c-2.879,18.313,9.676,35.558,27.989,38.442c1.763,0.277,3.514,0.411,5.245,0.411c16.254-0.001,30.591-11.85,33.195-28.4C73.317,35.911,68.494,23.73,58.828,16.208z"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  watch,
  onBeforeUnmount,
  onMounted,
  computed,
  nextTick,
} from "vue";
import { useUserStore } from "@/stores/user";

const props = defineProps({
  details: Object,
  trailerKey: String,
  logoPath: String,
  isInMyList: Boolean,
});

const emit = defineEmits(["toggleMyList"]);
const userStore = useUserStore();

const playerEl = ref(null);
let player = null;
let videoTimeIntervalId = null;
const isMuted = ref(true);
const trailerEnded = ref(false);

const isRatingPopupOpen = ref(false);

const getCurrentRating = computed(() => {
  return userStore.ratings[props.details.id] || null;
});

function selectRating(rating) {
  const newRating = getCurrentRating.value === rating ? null : rating;
  userStore.setRating(props.details.id, newRating);
  isRatingPopupOpen.value = false;
}

function handleMouseLeave() {
  setTimeout(() => {
    isRatingPopupOpen.value = false;
  }, 100);
}

const loadYouTubeAPI = () =>
  new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve(window.YT);
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
  });

const createPlayer = async () => {
  if (!props.trailerKey || !playerEl.value) return;
  await loadYouTubeAPI();
  player = new window.YT.Player(playerEl.value, {
    videoId: props.trailerKey,
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      mute: 1,
      playsinline: 1,
      origin: window.location.origin,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError,
    },
  });
};

const onPlayerReady = (event) => {
  player = event.target;
  player.mute();
  isMuted.value = true;
  player.playVideo();
  monitorVideoTime();
};

const onPlayerStateChange = (event) => {
  if (event.data === window.YT.PlayerState.ENDED) {
    trailerEnded.value = true;
    if (videoTimeIntervalId) clearInterval(videoTimeIntervalId);
  }
};

const onPlayerError = () => {
  trailerEnded.value = true;
};

const monitorVideoTime = () => {
  if (videoTimeIntervalId) clearInterval(videoTimeIntervalId);
  videoTimeIntervalId = setInterval(() => {
    if (
      !player ||
      typeof player.getDuration !== "function" ||
      !player.getCurrentTime
    ) {
      clearInterval(videoTimeIntervalId);
      return;
    }
    const duration = player.getDuration();
    if (duration > 0 && duration - player.getCurrentTime() < 1.5) {
      trailerEnded.value = true;
      player.stopVideo();
      clearInterval(videoTimeIntervalId);
    }
  }, 1000);
};

const toggleMute = () => {
  if (!player) return;
  isMuted.value ? player.unMute() : player.mute();
  isMuted.value = !isMuted.value;
};

const replayTrailer = () => {
  trailerEnded.value = false;
  nextTick(() => {
    if (player) player.destroy();
    createPlayer();
  });
};

watch(
  () => props.trailerKey,
  (newKey) => {
    if (newKey) {
      replayTrailer();
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (player) player.destroy();
  if (videoTimeIntervalId) clearInterval(videoTimeIntervalId);
});
</script>

<style scoped>
.rating-popup-enter-active,
.rating-popup-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.rating-popup-enter-from,
.rating-popup-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}
.origin-center {
  transform-origin: center;
}
</style>
