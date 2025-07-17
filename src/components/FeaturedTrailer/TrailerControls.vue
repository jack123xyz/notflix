<template>
  <div
    class="absolute bottom-10 lg:bottom-20 w-full flex items-end justify-between px-4 sm:px-8 md:px-12"
  >
    <div class="flex flex-row items-center gap-4">
      <button
        class="bg-white hover:bg-white/80 lg:px-6 xl:px-6 2xl:px-9 3xl:px-10 lg:py-2 2xl:py-2.5 3xl:py-3 rounded transition cursor-pointer flex items-center justify-center"
      >
        <svg fill="#000000" class="w-6 sm:w-7 mr-2" viewBox="0 0 512 512">
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
        @click="emit('showMoreInfo')"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          class="h-6 sm:h-7 md:h-8 lg:h-8 xl:h-9 2xl:h-10 3xl:h-11 text-white inline-block"
        >
          <path
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

    <!-- RIGHT SIDE stuff -->
    <div
      class="absolute right-0 lg:bottom-12 xl:bottom-12 2xl:bottom-15 3xl:bottom-12 flex items-end gap-4"
    >
      <button
        v-if="trailerKey && !trailerEnded"
        @click="emit('toggleMute')"
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
        v-if="trailerKey && trailerEnded"
        @click="emit('replay')"
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
          >{{ contentRating }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["toggleMute", "replay", "showMoreInfo"]);

defineProps({
  trailerKey: String,
  trailerEnded: Boolean,
  isMuted: Boolean,
  contentRating: String,
});
</script>
