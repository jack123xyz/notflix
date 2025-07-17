<template>
  <div class="flex items-center gap-2 mb-3">
    <button
      @click="$emit('play')"
      class="bg-white text-black rounded-full p-3 hover:bg-white/90 transition-colors cursor-pointer"
      aria-label="Play"
    >
      <svg
        fill="#000000"
        version="1.1"
        class="w-6 h-6 pl-1"
        viewBox="0 0 512 512"
      >
        <path
          d="M500.203,236.907L30.869,2.24c-6.613-3.285-14.443-2.944-20.736,0.939C3.84,7.083,0,13.931,0,21.333v469.333 c0,7.403,3.84,14.251,10.133,18.155c3.413,2.112,7.296,3.179,11.2,3.179c3.264,0,6.528-0.747,9.536-2.24l469.333-234.667 C507.435,271.467,512,264.085,512,256S507.435,240.533,500.203,236.907z"
        ></path>
      </svg>
    </button>

    <button
      @click="$emit('toggleMyList')"
      class="border bg-white/8 border-gray-400 border-2 hover:border-white text-white rounded-full p-3 hover:bg-white/10 transition-colors cursor-pointer"
      :title="isInMyList ? 'Remove from My List' : 'Add to My List'"
    >
      <svg v-if="!isInMyList" viewBox="0 0 24 24" class="w-6 h-6" fill="none">
        <path
          d="M12 4V20M4 12H20"
          stroke="#ffffff"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
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
      @click="$emit('thumbsUp')"
      class="border border-2 bg-white/8 border-gray-400 text-white rounded-full p-3 hover:border-white transition-colors cursor-pointer"
      :class="{ 'bg-white/30': isThumbsUp }"
    >
      <svg viewBox="-2.4 -2.4 28.80 28.80" fill="none" class="w-6 h-6">
        <g>
          <path
            d="M11.6049 5.78212L11.8341 3.41331C11.9263 2.46119 12.8146 1.81535 13.7128 2.04742C15.0643 2.39662 16.0125 3.65163 16.0125 5.09141V8.12624C16.0125 8.80124 16.0125 9.13874 16.159 9.3869C16.2419 9.52729 16.3561 9.64523 16.4919 9.73092C16.732 9.88239 17.0586 9.88239 17.7117 9.88239H18.108C19.8108 9.88239 20.6622 9.88239 21.1864 10.2729C21.5786 10.5649 21.8552 10.9937 21.9652 11.4801C22.1124 12.1304 21.7849 12.9426 21.13 14.5671L20.8035 15.3769C20.6149 15.8447 20.5377 16.3523 20.5784 16.8573C20.8101 19.7306 18.5307 22.1524 15.7451 21.9925L5.32067 21.394C4.18227 21.3286 3.61307 21.2959 3.09856 20.8408C2.58406 20.3856 2.48726 19.9169 2.29365 18.9797C2.12862 18.1807 2 17.2012 2 16.0888C2 14.855 2.15821 13.7847 2.34883 12.943C2.63157 11.6945 3.8242 11.0232 5.05534 11.1822C8.31887 11.6038 11.2777 9.16429 11.6049 5.78212Z"
            stroke="#ffffff"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :fill="isThumbsUp ? '#ffffff' : 'none'"
          ></path>
          <path
            d="M7.00008 11.5L6.86309 11.9566C5.97611 14.9132 6.02395 18.0716 7.00008 21"
            stroke="#ffffff"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        </g>
      </svg>
    </button>

    <div class="ml-auto">
      <button
        @click="$emit('expand')"
        class="border border-2 bg-white/8 border-gray-400 text-white hover:border-white rounded-full p-2 transition-colors cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isInMyList: Boolean,
  isThumbsUp: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["play", "toggleMyList", "thumbsUp", "expand"]);
</script>
