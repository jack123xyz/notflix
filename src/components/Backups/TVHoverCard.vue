<template>
  <div
    class="absolute z-[1000] bg-neutral-900 rounded-md shadow-3xl tv-hover-card"
    :style="cardStyle"
    @mouseenter="$emit('keep-hover')"
    @mouseleave="$emit('end-hover')"
  >
    <!-- TV show trailer container -->
    <div class="relative aspect-video rounded-t-md overflow-hidden z-[1001]">
      <!-- Placeholder image until trailer loads -->
      <img
        :src="getShowImage(show.backdrop_path)"
        :alt="show.name"
        class="w-full h-full object-cover"
      />

      <!-- Trailer video (loads after component mounted) -->
      <div v-if="trailerKey" class="absolute inset-0 z-[1002]">
        <iframe
          :id="`youtube-${trailerKey}`"
          :src="youtubeUrl"
          class="w-full h-full"
          frameborder="0"
          allow="autoplay; encrypted-media"
          allowfullscreen
        ></iframe>
      </div>

      <!-- Mute/Unmute Button Overlay -->
      <button
        v-if="trailerKey"
        @click.stop="toggleMute"
        class="absolute bottom-6 right-6 z-[1004] bg-transparent border-white border hover:bg-white/20 rounded-full p-3 transition cursor-pointer"
        aria-label="Toggle Mute"
      >
        <svg
          v-if="isMuted"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-white"
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
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-white"
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

      <!-- TV show title/logo overlay -->
      <div
        class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-[1003]"
      >
        <img
          v-if="logo"
          :src="getShowImage(logo)"
          :alt="show.name + ' Logo'"
          class="max-h-10 w-auto mb-2"
        />
        <h3 v-else class="text-xl font-bold text-white">{{ show.name }}</h3>
      </div>
    </div>

    <!-- Controls and info section -->
    <div class="p-10">
      <!-- Action buttons -->
      <div class="flex items-center gap-2 mb-3 cusor-pointer">
        <button
          class="bg-white text-black rounded-full p-3 hover:bg-white/90 transition-colors cursor-pointer"
        >
          <svg
            fill="#000000"
            version="1.1"
            class="w-6 h-6 pl-1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 512 512"
            xml:space="preserve"
          >
            <path
              d="M500.203,236.907L30.869,2.24c-6.613-3.285-14.443-2.944-20.736,0.939C3.84,7.083,0,13.931,0,21.333v469.333 c0,7.403,3.84,14.251,10.133,18.155c3.413,2.112,7.296,3.179,11.2,3.179c3.264,0,6.528-0.747,9.536-2.24l469.333-234.667 C507.435,271.467,512,264.085,512,256S507.435,240.533,500.203,236.907z"
            ></path>
          </svg>
        </button>
        <button
          class="border bg-white/8 border-gray-400 border-2 hover:border-white text-white rounded-full p-3 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <svg
            viewBox="0 -0.5 21 21"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            fill="#000000"
            class="w-6 h-6"
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
        </button>
        <button
          class="border border-2 bg-white/8 border-gray-400 text-white rounded-full p-3 hover:border-white transition-colors cursor-pointer"
        >
          <svg
            viewBox="-2.4 -2.4 28.80 28.80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            transform="rotate(0)"
            class="w-6 h-6"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
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
            </g>
          </svg>
        </button>
        <div class="ml-auto">
          <button
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

      <!-- TV show metadata -->
      <div class="flex items-center gap-2 text-md">
        <span class="border border-gray-400 px-3 text-gray-400 font-semibold">{{
          getContentRating
        }}</span>
        <span class="text-gray-400 text-lg font-semibold">{{
          getSeasonInfo
        }}</span>
        <span
          class="border border-gray-400 rounded text-xs text-gray-400 font-bold px-2"
          >HD</span
        >
      </div>

      <!-- Genres -->
      <div class="mt-2 text-md text-white">
        <span v-for="(genre, i) in showGenres" :key="genre">
          {{ genre }}{{ i < showGenres.length - 1 ? " • " : "" }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import { useTVStore } from "@/stores/tvStore";
import { useAudioControl } from "@/composables/useAudioControl";

// Get audio control utilities
const { requestAudioFocus, hasAudioFocus, getActiveAudioSource } =
  useAudioControl();
let releaseAudioFocus = null;

// Add unique ID based on TV show ID
const componentId = computed(() => `tv-hover-${props.show?.id}`);

// debug flag
const forceOpen = ref(true);

const showDetails = ref(null);
const isMuted = ref(true); // Start with audio muted by default

// Youtube player reference
let player = null;

const props = defineProps({
  show: Object,
  logo: String,
  rightAligned: Boolean,
  position: Object,
});

const emit = defineEmits(["keep-hover", "end-hover"]);

const tvStore = useTVStore();
const trailerKey = ref(null);
const trailerLoading = ref(false);

// Function to get TV show image path
function getShowImage(path) {
  if (!path) return "";
  return `https://image.tmdb.org/t/p/w500${path}`;
}

// Updated cardStyle with dynamic right-edge detection - same fix as MovieHoverCard
const cardStyle = computed(() => {
  if (!props.position) return {};

  const {
    top,
    left,
    width,
    height,
    scrollY = 0,
    scrollX = 0,
    isRightEdge,
  } = props.position;

  const scaleFactor = 1.45;
  const heightIncrease = height * (scaleFactor - 1);
  const isLeftEdgeTile = left < 100;
  const expandedWidth = width * scaleFactor;

  // Always check if we're near the right edge of the viewport
  const viewportWidth = window.innerWidth;

  // Add a buffer to ensure we detect edge cases properly
  const bufferSpace = 40;
  const wouldOverflowRight = left + expandedWidth > viewportWidth - bufferSpace;

  // Force right alignment for the last item on first hover
  // This is the key change that fixes the bug
  const forceRightAlignment = isRightEdge || wouldOverflowRight;

  let leftPosition;
  let originPoint;

  if (isLeftEdgeTile) {
    leftPosition = left + scrollX;
    originPoint = "left bottom";
  } else if (forceRightAlignment) {
    // Calculate position from the right edge of the tile/viewport
    const rightEdgeOfTile = left + width;

    // Calculate the maximum allowed left position to prevent overflow
    const maxLeftPosition = viewportWidth - expandedWidth - bufferSpace;

    // Use the smaller of these two values to ensure no overflow
    leftPosition = Math.min(
      rightEdgeOfTile - expandedWidth + scrollX,
      maxLeftPosition + scrollX
    );

    originPoint = "right bottom";

    console.log(
      `Right-aligned tile: ${props.show.name}, original width=${width}, expanded=${expandedWidth}`
    );
    console.log(
      `Original right edge: ${rightEdgeOfTile}, new left position: ${leftPosition}, viewport width: ${viewportWidth}`
    );
  } else {
    leftPosition = left + scrollX - (width * (scaleFactor - 1)) / 2;
    originPoint = "center bottom";
  }

  // Additional safety check to prevent any possible overflow
  if (leftPosition + expandedWidth > viewportWidth - bufferSpace) {
    leftPosition = viewportWidth - expandedWidth - bufferSpace + scrollX;
    originPoint = "right bottom";
    console.log(
      `Safety adjustment applied for ${props.show.name}: new left = ${leftPosition}`
    );
  }

  // Prevent positioning too far left
  if (leftPosition < bufferSpace) {
    leftPosition = bufferSpace;
    originPoint = "left bottom";
    console.log(
      `Left edge safety adjustment for ${props.show.name}: new left = ${leftPosition}`
    );
  }

  return {
    position: "absolute",
    top: `${top + scrollY - heightIncrease}px`,
    left: `${leftPosition}px`,
    width: `${expandedWidth}px`,
    zIndex: 1000,
    transform: "scale(1)",
    transformOrigin: originPoint,
    transition: "all 0.3s cubic-bezier(0.2, 0.89, 0.32, 1.28)",
    opacity: 1,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
  };
});

// Update the YouTube URL parameters
const youtubeUrl = computed(() => {
  if (!trailerKey.value) return "";

  // Add mute=1 to make sure it's muted by default from YouTube's side
  return `https://www.youtube.com/embed/${trailerKey.value}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&origin=${window.location.origin}&enablejsapi=1&mute=1`;
});

// Add a watcher for the active audio source
const activeAudioSource = getActiveAudioSource();

// Watch for changes in active audio source
watch(activeAudioSource, (newSource) => {
  console.log("Audio source changed:", newSource, "our ID:", componentId.value);

  // Only unmute our player if WE are the active audio source
  if (newSource === componentId.value) {
    console.log("We have audio focus, unmuting");
    isMuted.value = false;

    if (player) {
      try {
        player.unMute();
        player.setVolume(100);
      } catch (error) {
        console.error("Error unmuting:", error);
      }
    }
  } else if (newSource && newSource !== componentId.value) {
    // If another component has focus, ensure we're muted
    console.log("Another component has focus, muting ourselves");
    isMuted.value = true;

    if (player) {
      try {
        player.mute();
      } catch (error) {
        console.error("Error muting:", error);
      }
    }
  }
});

// Get formatted season info (e.g. "2 Seasons")
const getSeasonInfo = computed(() => {
  console.log("TV show details:", showDetails.value);

  const numberOfSeasons = showDetails.value?.number_of_seasons || 0;
  if (numberOfSeasons === 1) {
    return "1 Season";
  } else if (numberOfSeasons > 1) {
    return `${numberOfSeasons} Seasons`;
  }
  return "";
});

// Get age rating
const getContentRating = computed(() => {
  if (showDetails.value?.content_ratings?.results) {
    const usRating = showDetails.value.content_ratings.results.find(
      (rating) => rating.iso_3166_1 === "US"
    );
    if (usRating) return usRating.rating;
  }
  return props.show.adult ? "TV-MA" : "TV-14"; // Default ratings for TV shows
});

// Update the showGenres computed property
const showGenres = computed(() => {
  console.log("TV show genre IDs:", props.show?.genre_ids);
  console.log("Available TV genres:", tvStore.genres);

  // First try to use genre_ids from props
  if (props.show?.genre_ids && tvStore.genres) {
    return props.show.genre_ids
      .slice(0, 3)
      .map((id) => tvStore.genres[id])
      .filter(Boolean);
  }

  // Fallback to genres from TV show details
  if (showDetails.value?.genres) {
    return showDetails.value.genres.slice(0, 3).map((genre) => genre.name);
  }

  return [];
});

// Toggle mute function with audio focus management
function toggleMute() {
  isMuted.value = !isMuted.value;
  console.log("Toggle mute:", isMuted.value);

  if (player) {
    try {
      if (isMuted.value) {
        player.mute();
        // Release audio focus when muting
        if (releaseAudioFocus) {
          releaseAudioFocus();
          releaseAudioFocus = null;
        }
      } else {
        // Request audio focus when unmuting - this will signal other components
        releaseAudioFocus = requestAudioFocus(componentId.value);
        player.unMute();
        player.setVolume(100);
      }
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  }
}

// Add this to load the YouTube API properly
function loadYouTubeAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
    } else if (window._ytApiLoading) {
      // Wait for global promise if already loading
      window._ytApiLoading.then(resolve);
    } else {
      // Create a global promise to avoid multiple loads
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

// Function to initialize YouTube player with API controls
async function initializeYouTubePlayer() {
  if (!trailerKey.value) return;

  try {
    await loadYouTubeAPI();

    console.log(
      `Initializing player for ${props.show.name} with key ${trailerKey.value}`
    );

    // Initialize player with API control
    player = new YT.Player(`youtube-${trailerKey.value}`, {
      events: {
        onReady: (event) => {
          console.log(`Player ready for ${props.show.name}`);

          // Always start muted
          event.target.mute();
          isMuted.value = true;

          event.target.playVideo();
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            console.log(`Player started playing for ${props.show.name}`);
          }
        },
      },
    });
  } catch (error) {
    console.error("Error initializing YouTube player:", error);
  }
}

// Add this to your onMounted function
onMounted(async () => {
  // Load TV genres if not already loaded
  if (!tvStore.genres) {
    await tvStore.fetchGenres();
    console.log("Loaded TV genres:", tvStore.genres);
  }

  // Load TV show details (including seasons)
  loadShowDetails();

  // Rest of your existing onMounted code
  setTimeout(() => {
    loadTrailer();
  }, 500); // 500ms delay before starting to fetch the trailer
});

// Add this function to fetch TV show details
async function loadShowDetails() {
  if (!props.show?.id) return;

  try {
    console.log("Fetching details for TV show ID:", props.show.id);
    const details = await tvStore.getTVShowDetails(props.show.id);
    showDetails.value = details;
    console.log("TV show details:", details);
  } catch (error) {
    console.error("Error loading TV show details:", error);
  }
}

// Fix for the loadTrailer function - complete implementation
async function loadTrailer() {
  if (!props.show?.id || trailerLoading.value) return;

  trailerLoading.value = true;

  try {
    console.log("Fetching trailer for TV show ID:", props.show.id);
    const videos = await tvStore.getTVShowVideos(props.show.id);

    console.log("Received videos:", videos);

    if (videos && videos.length > 0) {
      // Filter for actual trailers if possible
      const trailers = videos.filter((v) => v.type === "Trailer");
      const trailer = trailers.length > 0 ? trailers[0] : videos[0];

      if (trailer && trailer.key) {
        console.log("Using trailer key:", trailer.key);
        trailerKey.value = trailer.key;

        // Initialize YouTube player after setting the key
        setTimeout(() => {
          initializeYouTubePlayer();
        }, 300);
      }
    }
  } catch (error) {
    console.error("Error loading trailer:", error);
  } finally {
    trailerLoading.value = false;
  }
}

// Clean up on component unmount
onBeforeUnmount(() => {
  if (player) {
    try {
      player.destroy();
    } catch (error) {
      console.error("Error destroying player:", error);
    }
    player = null;
  }

  // Release audio focus when component is unmounted
  if (releaseAudioFocus) {
    releaseAudioFocus();
    releaseAudioFocus = null;
  }
});
</script>

<style scoped>
.tv-hover-card {
  animation: hover-card-appear 0.3s cubic-bezier(0.2, 0.89, 0.32, 1.28); /* Spring-like effect */
}

@keyframes hover-card-appear {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
