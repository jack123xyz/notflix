<template>
  <div
    class="fixed bottom-0 left-0 right-0 bg-netflix-bg-gray py-3 px-6 flex justify-around border-t border-white/10"
    aria-label="Bottom action buttons"
  >
    <button class="flex flex-col items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-label="My List icon"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4v16m8-8H4"
        />
      </svg>
      <span class="text-xs mt-1">My List</span>
    </button>
    <button
      class="flex flex-col items-center relative"
      @click="handleRateClick"
    >
      <div
        v-if="isRatingOpen"
        class="absolute bottom-16 bg-netflix-gray-100 px-4 rounded-full py-2 flex items-center gap-5"
      >
        <button
          class="flex flex-col items-center"
          @click.stop="submitRating('not-for-me')"
        >
          <div class="thumbs-down-container">
            <svg
              viewBox="-2.4 -2.4 28.80 28.80"
              fill="none"
              class="w-6 h-6"
              :class="{ 'bounce-animation': isAnimating === 'not-for-me' }"
              aria-label="Not for me icon"
            >
              <path
                d="M11.6049 5.78212L11.8341 3.41331C11.9263 2.46119 12.8146 1.81535 13.7128 2.04742C15.0643 2.39662 16.0125 3.65163 16.0125 5.09141V8.12624C16.0125 8.80124 16.0125 9.13874 16.159 9.3869C16.2419 9.52729 16.3561 9.64523 16.4919 9.73092C16.732 9.88239 17.0586 9.88239 17.7117 9.88239H18.108C19.8108 9.88239 20.6622 9.88239 21.1864 10.2729C21.5786 10.5649 21.8552 10.9937 21.9652 11.4801C22.1124 12.1304 21.7849 12.9426 21.13 14.5671L20.8035 15.3769C20.6149 15.8447 20.5377 16.3523 20.5784 16.8573C20.8101 19.7306 18.5307 22.1524 15.7451 21.9925L5.32067 21.394C4.18227 21.3286 3.61307 21.2959 3.09856 20.8408C2.58406 20.3856 2.48726 19.9169 2.29365 18.9797C2.12862 18.1807 2 17.2012 2 16.0888C2 14.855 2.15821 13.7847 2.34883 12.943C2.63157 11.6945 3.8242 11.0232 5.05534 11.1822C8.31887 11.6038 11.2777 9.16429 11.6049 5.78212Z"
                :fill="selectedRating === 'not-for-me' ? '#ffffff' : 'none'"
                stroke="#ffffff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M7.00008 11.5L6.86309 11.9566C5.97611 14.9132 6.02395 18.0716 7.00008 21"
                :fill="selectedRating === 'not-for-me' ? '#ffffff' : 'none'"
                stroke="#ffffff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
          </div>
          <span class="text-xs mt-2 w-15">Not for me</span>
        </button>
        <button
          class="flex flex-col items-center"
          @click.stop="submitRating('like')"
        >
          <svg
            viewBox="-2.4 -2.4 28.80 28.80"
            class="w-6 h-6"
            :class="{ 'bounce-animation': isAnimating === 'like' }"
            aria-label="Rating icon"
          >
            <path
              d="M11.6049 5.78212L11.8341 3.41331C11.9263 2.46119 12.8146 1.81535 13.7128 2.04742C15.0643 2.39662 16.0125 3.65163 16.0125 5.09141V8.12624C16.0125 8.80124 16.0125 9.13874 16.159 9.3869C16.2419 9.52729 16.3561 9.64523 16.4919 9.73092C16.732 9.88239 17.0586 9.88239 17.7117 9.88239H18.108C19.8108 9.88239 20.6622 9.88239 21.1864 10.2729C21.5786 10.5649 21.8552 10.9937 21.9652 11.4801C22.1124 12.1304 21.7849 12.9426 21.13 14.5671L20.8035 15.3769C20.6149 15.8447 20.5377 16.3523 20.5784 16.8573C20.8101 19.7306 18.5307 22.1524 15.7451 21.9925L5.32067 21.394C4.18227 21.3286 3.61307 21.2959 3.09856 20.8408C2.58406 20.3856 2.48726 19.9169 2.29365 18.9797C2.12862 18.1807 2 17.2012 2 16.0888C2 14.855 2.15821 13.7847 2.34883 12.943C2.63157 11.6945 3.8242 11.0232 5.05534 11.1822C8.31887 11.6038 11.2777 9.16429 11.6049 5.78212Z"
              :fill="selectedRating === 'like' ? '#ffffff' : 'none'"
              stroke="#ffffff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
            <path
              d="M7.00008 11.5L6.86309 11.9566C5.97611 14.9132 6.02395 18.0716 7.00008 21"
              :fill="selectedRating === 'like' ? '#ffffff' : 'none'"
              stroke="#ffffff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
          <span class="text-xs mt-2 w-15">I like this</span>
        </button>
        <button
          class="flex flex-col items-center"
          @click.stop="submitRating('love')"
        >
          <svg
            viewBox="0 0 24 24"
            class="w-6 h-6"
            :class="{ 'bounce-animation': isAnimating === 'love' }"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
              :fill="selectedRating === 'love' ? '#ffffff' : 'none'"
              stroke="#ffffff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
          <span class="text-xs mt-2 w-15">I love this</span>
        </button>
      </div>
      <div
        v-if="isRatingOpen"
        class="w-6 h-6 flex items-center justify-center rounded-full bg-netflix-gray-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <svg
        v-else
        viewBox="-2.4 -2.4 28.80 28.80"
        class="w-6 h-6"
        aria-label="Rating icon"
      >
        <path
          d="M11.6049 5.78212L11.8341 3.41331C11.9263 2.46119 12.8146 1.81535 13.7128 2.04742C15.0643 2.39662 16.0125 3.65163 16.0125 5.09141V8.12624C16.0125 8.80124 16.0125 9.13874 16.159 9.3869C16.2419 9.52729 16.3561 9.64523 16.4919 9.73092C16.732 9.88239 17.0586 9.88239 17.7117 9.88239H18.108C19.8108 9.88239 20.6622 9.88239 21.1864 10.2729C21.5786 10.5649 21.8552 10.9937 21.9652 11.4801C22.1124 12.1304 21.7849 12.9426 21.13 14.5671L20.8035 15.3769C20.6149 15.8447 20.5377 16.3523 20.5784 16.8573C20.8101 19.7306 18.5307 22.1524 15.7451 21.9925L5.32067 21.394C4.18227 21.3286 3.61307 21.2959 3.09856 20.8408C2.58406 20.3856 2.48726 19.9169 2.29365 18.9797C2.12862 18.1807 2 17.2012 2 16.0888C2 14.855 2.15821 13.7847 2.34883 12.943C2.63157 11.6945 3.8242 11.0232 5.05534 11.1822C8.31887 11.6038 11.2777 9.16429 11.6049 5.78212Z"
          stroke="#ffffff"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          d="M7.00008 11.5L6.86309 11.9566C5.97611 14.9132 6.02395 18.0716 7.00008 21"
          stroke="#ffffff"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
      <span class="text-xs mt-1">{{ isRatingOpen ? "Close" : "Rate" }}</span>
    </button>
    <button class="flex flex-col items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-label="Share icon"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
      <span class="text-xs mt-1">Share</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  contentId: Number,
});
const emit = defineEmits(["rate-content"]);

const isRatingOpen = ref(false);
const isAnimating = ref(null);
const selectedRating = ref(null);

function handleRateClick() {
  isRatingOpen.value = !isRatingOpen.value;
}

function submitRating(rating) {
  selectedRating.value = selectedRating.value === rating ? null : rating;
  isAnimating.value = rating;
  setTimeout(() => {
    isAnimating.value = null;
  }, 300);
  emit("rate-content", {
    contentId: props.contentId,
    rating: selectedRating.value,
  });
}
</script>

<style scoped>
.absolute {
  transition: all 0.2s ease-in-out;
}
.thumbs-down-container {
  transform: rotate(180deg);
}
.thumbs-down-container .bounce-animation {
  animation: thumbs-down-bounce 0.3s ease;
}
@keyframes thumbs-down-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(6px);
  }
  60% {
    transform: translateY(3px);
  }
  80% {
    transform: translateY(1px);
  }
}
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-6px);
  }
  60% {
    transform: translateY(-3px);
  }
  80% {
    transform: translateY(-1px);
  }
}
.bounce-animation {
  animation: bounce 0.3s ease;
}
svg path {
  transition: fill 0.2s ease-in-out;
}
</style>
