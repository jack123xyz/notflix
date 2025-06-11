<template>
  <!-- Update outer div click handler -->
  <div
    class="fixed inset-0 z-[9999] overflow-hidden"
    @click="handleOutsideClick"
  >
    <!-- Update backdrop click handler -->
    <div class="absolute inset-0 bg-black/70" @click="handleOutsideClick"></div>

    <!-- Modal content -->
    <div class="content-modal overflow-y-auto h-full" @click.stop>
      <!-- Modal container -->
      <div
        class="relative w-full lg:max-w-4xl xl:max-w-4xl 2xl:max-w-4xl 3xl:max-w-7xl mx-auto lg:mt-8 xl:mt-8 2xl:mt-5 bg-netflix-bg-gray rounded-lg shadow-lg"
      >
        <!-- Close button -->
        <button
          @click="close"
          class="absolute right-4 top-4 z-[9999] bg-netflix-bg-gray/80 backdrop-blur-sm rounded-full p-2 hover:bg-white/20 transition-colors"
          aria-label="Close modal"
        >
          <svg viewBox="0 0 24 24" class="w-6 h-6 text-white">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              fill="currentColor"
            />
          </svg>
        </button>

        <!-- Video/Backdrop container -->
        <div class="relative w-full aspect-video bg-black">
          <!-- Backdrop image (shown when trailer ends or no trailer available) -->
          <img
            v-if="backdrop && (trailerEnded || !trailerKey)"
            :src="backdrop"
            alt="Backdrop"
            class="w-full h-full object-cover"
          />

          <!-- Trailer container -->
          <div
            v-if="trailerKey && !trailerEnded"
            class="absolute inset-0 overflow-hidden bg-netflix-bg-gray pointer-events-none"
          >
            <div ref="playerEl" class="relative w-full h-full"></div>
          </div>

          <!-- Gradient overlay for seamless transition -->
          <div
            class="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          >
            <!-- Top part: No blur, just gradient -->
            <div
              class="absolute inset-0 h-1/3 bottom-2/3"
              :style="{
                background:
                  'linear-gradient(to bottom, rgba(20, 20, 20, 0) 0%, rgba(20, 20, 20, 0.3) 100%)',
              }"
            ></div>

            <!-- Middle part: Very subtle blur transition -->
            <div
              class="absolute inset-0 h-1/3 top-1/3 bottom-1/3"
              :style="{
                background:
                  'linear-gradient(to bottom, rgba(20, 20, 20, 0.3) 0%, rgba(20, 20, 20, 0.6) 100%)',
                backdropFilter: 'blur(1px)',
                WebkitBackdropFilter: 'blur(1px)',
              }"
            ></div>

            <!-- Bottom part: Stronger gradient with full blur -->
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

          <!-- Title & controls overlay -->
          <div class="absolute bottom-0 left-0 right-0 p-8">
            <!-- Logo or title -->
            <img
              v-if="logoPath"
              :src="`https://image.tmdb.org/t/p/original${logoPath}`"
              alt="Title Logo"
              class="lg:max-h-15 xl:max-h-15 2xl:max-h-16 3xl:max-h-32 w-auto mb-10"
            />
            <h1 v-else class="2xl:text-xl 3xl:text-5xl font-bold mb-4">
              {{ title }}
            </h1>

            <!-- Control buttons -->
            <div class="flex items-center gap-3 mb-4">
              <button
                class="bg-white text-black hover:bg-white/90 lg:px-7 lg:py-1.5 xl:px-7 2xl:px-9 xl:py-1.5 2xl:py-2 3xl:py-3 rounded flex items-center font-semibold cursor-pointer"
              >
                <svg
                  fill="#000000"
                  class="3xl:w-7 3xl:h-7 w-5 h-5 mr-2"
                  viewBox="0 0 512 512"
                >
                  <path
                    d="M500.203,236.907L30.869,2.24c-6.613-3.285-14.443-2.944-20.736,0.939C3.84,7.083,0,13.931,0,21.333v469.333 c0,7.403,3.84,14.251,10.133,18.155c3.413,2.112,7.296,3.179,11.2,3.179c3.264,0,6.528-0.747,9.536-2.24l469.333-234.667 C507.435,271.467,512,264.085,512,256S507.435,240.533,500.203,236.907z"
                  ></path>
                </svg>
                <span class="lg:text-lg xl:text-lg 2xl:text-2xl font-semibold"
                  >Play</span
                >
              </button>
              <button
                @click.stop="toggleMyListInModal"
                class="border bg-white/8 border-gray-400/70 border-2 hover:border-white hover:bg-white/25 text-white rounded-full lg:p-2.5 2xl:p-3 transition-colors cursor-pointer"
                :title="isInMyList ? 'Remove from My List' : 'Add to My List'"
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
                        <g
                          id="icons"
                          transform="translate(56.000000, 160.000000)"
                        >
                          <polygon
                            id="plus-[#1512]"
                            points="344 89 344 91 334.55 91 334.55 100 332.45 100 332.45 91 323 91 323 89 332.45 89 332.45 80 334.55 80 334.55 89"
                          ></polygon>
                        </g>
                      </g>
                    </g>
                  </g>
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="lg:w-4 lg:h-4 2xl:w-6 2xl:h-6"
                >
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
                class="border border-2 bg-white/8 border-gray-400/70 text-white rounded-full lg:p-2 2xl:p-3 hover:bg-white/15 transition-colors relative"
                @mouseenter="isRatingPopupOpen = true"
                @mouseleave="handleMouseLeave"
                @click.stop="isRatingPopupOpen = !isRatingPopupOpen"
              >
                <!-- Thumbs up (default or when 'like' is selected) -->
                <svg
                  v-if="
                    getCurrentRating === null || getCurrentRating === 'like'
                  "
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

                <!-- Thumbs down (when 'not-for-me' is selected) -->
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

                <!-- Heart (when 'love' is selected) -->
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

                <!-- Rating popup transition remains the same -->
                <transition
                  name="rating-popup"
                  enter-active-class="transition-all duration-300 ease-out delay-300"
                  leave-active-class="transition-all duration-200 ease-in"
                  enter-from-class="opacity-0 transform scale-x-0"
                  enter-to-class="opacity-100 transform scale-x-100"
                  leave-from-class="opacity-100 transform scale-x-100"
                  leave-to-class="opacity-0 transform scale-x-0"
                >
                  <!-- Rating popup content remains the same -->
                  <div
                    v-if="isRatingPopupOpen"
                    class="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-netflix-bg-gray rounded-full lg:py-4 xl:py-4 2xl:py-6 lg:px-4 xl:px-6 2xl:px-8 z-50 flex items-center gap-5 origin-center"
                    @mouseenter="isRatingPopupOpen = true"
                    @mouseleave="isRatingPopupOpen = false"
                  >
                    <!-- Thumbs down -->
                    <button
                      class="flex flex-col items-center hover:scale-110 transition-transform"
                      @click.stop="selectRating('not-for-me')"
                    >
                      <div class="thumbs-down-container">
                        <svg
                          viewBox="-2.4 -2.4 28.80 28.80"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          class="lg:w-6 lg:h-6 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7 cursor-pointer"
                          aria-label="Not for me"
                        >
                          <path
                            d="M11.6049 5.78212L11.8341 3.41331C11.9263 2.46119 12.8146 1.81535 13.7128 2.04742C15.0643 2.39662 16.0125 3.65163 16.0125 5.09141V8.12624C16.0125 8.80124 16.0125 9.13874 16.159 9.3869C16.2419 9.52729 16.3561 9.64523 16.4919 9.73092C16.732 9.88239 17.0586 9.88239 17.7117 9.88239H18.108C19.8108 9.88239 20.6622 9.88239 21.1864 10.2729C21.5786 10.5649 21.8552 10.9937 21.9652 11.4801C22.1124 12.1304 21.7849 12.9426 21.13 14.5671L20.8035 15.3769C20.6149 15.8447 20.5377 16.3523 20.5784 16.8573C20.8101 19.7306 18.5307 22.1524 15.7451 21.9925L5.32067 21.394C4.18227 21.3286 3.61307 21.2959 3.09856 20.8408C2.58406 20.3856 2.48726 19.9169 2.29365 18.9797C2.12862 18.1807 2 17.2012 2 16.0888C2 14.855 2.15821 13.7847 2.34883 12.943C2.63157 11.6945 3.8242 11.0232 5.05534 11.1822C8.31887 11.6038 11.2777 9.16429 11.6049 5.78212Z"
                            :fill="
                              getCurrentRating === 'not-for-me'
                                ? '#ffffff'
                                : 'none'
                            "
                            stroke="#ffffff"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>
                          <path
                            d="M7.00008 11.5L6.86309 11.9566C5.97611 14.9132 6.02395 18.0716 7.00008 21"
                            :fill="
                              getCurrentRating === 'not-for-me'
                                ? '#ffffff'
                                : 'none'
                            "
                            stroke="#ffffff"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>
                        </svg>
                      </div>
                    </button>

                    <!-- Thumbs up -->
                    <button
                      class="flex flex-col items-center hover:scale-110 transition-transform"
                      @click.stop="selectRating('like')"
                    >
                      <svg
                        viewBox="-2.4 -2.4 28.80 28.80"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="lg:w-6 lg:h-6 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7 cursor-pointer"
                        aria-label="I like this"
                      >
                        <path
                          d="M11.6049 5.78212L11.8341 3.41331C11.9263 2.46119 12.8146 1.81535 13.7128 2.04742C15.0643 2.39662 16.0125 3.65163 16.0125 5.09141V8.12624C16.0125 8.80124 16.0125 9.13874 16.159 9.3869C16.2419 9.52729 16.3561 9.64523 16.4919 9.73092C16.732 9.88239 17.0586 9.88239 17.7117 9.88239H18.108C19.8108 9.88239 20.6622 9.88239 21.1864 10.2729C21.5786 10.5649 21.8552 10.9937 21.9652 11.4801C22.1124 12.1304 21.7849 12.9426 21.13 14.5671L20.8035 15.3769C20.6149 15.8447 20.5377 16.3523 20.5784 16.8573C20.8101 19.7306 18.5307 22.1524 15.7451 21.9925L5.32067 21.394C4.18227 21.3286 3.61307 21.2959 3.09856 20.8408C2.58406 20.3856 2.48726 19.9169 2.29365 18.9797C2.12862 18.1807 2 17.2012 2 16.0888C2 14.855 2.15821 13.7847 2.34883 12.943C2.63157 11.6945 3.8242 11.0232 5.05534 11.1822C8.31887 11.6038 11.2777 9.16429 11.6049 5.78212Z"
                          :fill="
                            getCurrentRating === 'like' ? '#ffffff' : 'none'
                          "
                          stroke="#ffffff"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                        <path
                          d="M7.00008 11.5L6.86309 11.9566C5.97611 14.9132 6.02395 18.0716 7.00008 21"
                          :fill="
                            getCurrentRating === 'like' ? '#ffffff' : 'none'
                          "
                          stroke="#ffffff"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                      </svg>
                    </button>

                    <!-- Heart/Love -->
                    <button
                      class="flex flex-col items-center hover:scale-110 transition-transform"
                      @click.stop="selectRating('love')"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="lg:w-6 xl:w-5 2xl:w-7 2xl:h-7 cursor-pointer"
                        aria-label="Love this"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
                          :fill="
                            getCurrentRating === 'love' ? '#ffffff' : 'none'
                          "
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

              <!-- Mute/Unmute button -->
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
              <!-- Replay button -->
              <button
                v-if="trailerKey && trailerEnded"
                @click="replayTrailer"
                class="bg-transparent border-white/70 border hover:bg-white/20 rounded-full p-1 absolute right-12 lg:p-1.5 xl:p-2 2xl:p-2 3xl:p-3 transition cursor-pointer"
                aria-label="Replay Trailer"
              >
                <!-- Replay SVG -->
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

        <!-- Content details section -->
        <div class="p-8">
          <div class="flex flex-col md:flex-row gap-8">
            <!-- Left column: Main details -->
            <div class="flex-1">
              <!-- Metadata row -->
              <div class="flex items-center gap-3 text-md 3xl:text-lg mb-4">
                <span
                  v-if="releaseYear"
                  class="text-netflix-gray-25 font-semibold"
                  >{{ releaseYear }}</span
                >
                <span
                  class="border border-netflix-gray-100 rounded lg:text-[11px] 3xl:text-xs text-white lg:px-1.5 2xl:px-2 leading-tight 2xl:pb-[0.4px]"
                  >HD</span
                >

                <svg
                  fill="#bcbcbc"
                  width="64px"
                  height="64px"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  class="lg:h-8 lg:w-8 3xl:h-10 3xl:w-10"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="m9.32 16.326h-2.28v-1.366h-3.044l-.872 1.366h-3.124l.189-.255 3.274-4.548 3.091-4.302 1.386-.006h1.38zm-2.181-6.08-.996 1.46-.995 1.464.989.019c.225 0 .434.005.605.005.033.001.072.002.111.002.106 0 .21-.004.313-.013l-.014.001c.012-.012.014-.566.006-1.483zm4.836 6.08h-1.874v-9.111h1.939c.185-.009.402-.014.621-.014.61 0 1.21.041 1.798.12l-.069-.008c1.122.267 2.027 1.024 2.49 2.028l.009.023c.338.618.537 1.354.537 2.137 0 .107-.004.213-.011.318l.001-.014c.004.072.007.157.007.243 0 .448-.069.879-.198 1.284l.008-.03c-.277 1.131-1.006 2.055-1.979 2.586l-.021.01c-.781.381-1.146.429-3.258.429zm.274-6.919v4.654l.866-.026c.994-.033 1.238-.119 1.634-.579.332-.395.534-.91.534-1.471 0-.087-.005-.173-.014-.258l.001.01c.011-.078.017-.168.017-.26 0-.308-.071-.599-.198-.858l.005.011c-.428-.921-.79-1.132-2.037-1.191l-.81-.032zm10.329 6.913c-.096 0-.141-.009-.155-.03s0-.042.01-.074c.506-1.32.803-2.846.814-4.44v-.005c-.017-1.6-.314-3.126-.844-4.537l.03.092c-.014-.035-.016-.055-.006-.07.023-.034.114-.041.357-.041.314 0 .405.024.455.124.239.654.445 1.435.581 2.239l.011.081c.107.635.168 1.366.168 2.111 0 1.419-.221 2.785-.63 4.068l.026-.095-.182.553-.416.02c-.103.002-.169.005-.219.005zm-4.232 0c-.055 0-.115 0-.195-.006l-.436-.02.234-.351c.582-.888.985-1.943 1.134-3.079l.004-.038c.028-.29.044-.626.044-.967 0-.676-.062-1.338-.182-1.98l.01.066c-.243-.984-.641-1.848-1.171-2.614l.017.026-.104-.143h.924l.176.274c.335.578.617 1.246.812 1.95l.014.061c.188.676.295 1.453.295 2.255 0 1.366-.313 2.659-.871 3.811l.023-.052c-.344.7-.4.807-.73.807zm2.024 0c-.02.002-.042.004-.065.004-.065 0-.128-.01-.187-.03l.004.001c0-.024.135-.309.195-.43.13-.26.262-.577.374-.904l.017-.056c.296-.922.466-1.983.466-3.084 0-1.497-.315-2.92-.883-4.207l.026.067c-.059-.121-.195-.405-.195-.43.056-.019.12-.03.186-.03.022 0 .043.001.064.003h-.003c.06 0 .124 0 .188.006l.436.019.247.615c.442 1.159.698 2.5.698 3.9 0 1.465-.28 2.864-.789 4.148l.027-.076-.18.453-.436.02c-.064 0-.127.005-.188.005z"
                    ></path>
                  </g>
                </svg>
                <svg
                  fill="#bcbcbc"
                  height="64px"
                  width="64px"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 24 24"
                  enable-background="new 0 0 24 24"
                  xml:space="preserve"
                  class="lg:h-4 lg:w-4 3xl:h-5 3xl:w-5"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <g id="subtitles">
                      <path
                        d="M12,24l-4.4-5H0V0h24v19h-7.6L12,24z M2,17h6.4l3.6,4l3.6-4H22V2H2V17z"
                      ></path>
                      <path
                        d="M4,13h7v2H4V13z M12,13h7v2h-7V13z M4,10h5v2H4V10z M14,10h6v2h-6V10z M10,10h3v2h-3V10z"
                      ></path>
                    </g>
                  </g>
                </svg>

                <span
                  v-if="runtime"
                  class="text-netflix-gray-25 font-semibold"
                  >{{ formatRuntime(runtime) }}</span
                >
              </div>
              <span
                v-if="contentRating"
                class="border px-1 text-sm text-netflix-gray-25 border-netfilx-gray-100 leading-tight"
                >{{ contentRating }}</span
              >
              <!-- Description -->
              <p
                class="text-white mb-6 xl:text-sm 2xl:text-md 3xl:text-lg mt-4 xl:w-md 2xl:w-lg 3xl:max-w-3xl"
              >
                {{ overview }}
              </p>
            </div>

            <!-- Right column: Additional info -->
            <div>
              <!-- Info container with consistent alignment -->
              <div
                class="flex flex-col space-y-2 xl:text-sm 2xl:text-md 3xl:text-sm"
              >
                <!-- Cast info -->
                <div v-if="cast && cast.length" class="flex items-start gap-1">
                  <span class="text-gray-400 pr-0">Cast:</span
                  ><span
                    class="text-white pl-0 2xl:text-wrap 3xl:text-nowrap"
                    >{{ formatCast(cast) }}</span
                  >
                </div>

                <!-- Genres info -->
                <div
                  v-if="genres && genres.length"
                  class="flex items-start gap-1"
                >
                  <span class="text-gray-400 pr-0">Genres:</span
                  ><span class="pl-0">
                    <span
                      v-for="genre in genres"
                      :key="genre.id"
                      class="whitespace-nowrap 2xl:text-wrap 3xl:text-nowrap"
                    >
                      {{ genre.name
                      }}{{
                        genres.indexOf(genre) !== genres.length - 1 ? ", " : ""
                      }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Episodes section (for TV shows) -->
          <div
            v-if="contentType === 'tv' && episodes && episodes.length"
            class="mt-10"
          >
            <h2
              v-if="seasons && seasons.length > 1"
              class="text-2xl font-semibold -mb-5"
            >
              Episodes
            </h2>
            <h2 v-else class="text-2xl font-semibold mb-7">Episodes</h2>

            <!-- Season selector -->
            <div class="flex justify-end">
              <div v-if="seasons && seasons.length > 1" class="mb-4">
                <div class="relative w-55">
                  <button
                    @click="toggleSeasonDropdown"
                    data-action="toggle-season"
                    class="w-full bg-netflix-gray-250 border border-netflix-gray-100 text-white py-2 px-4 rounded flex justify-between items-center font-semibold text-lg cursor-pointer"
                  >
                    <span>{{ currentSeasonName }}</span>
                    <svg
                      class="w-4 h-4 ml-2"
                      xmlns="http://www.w3.org/2000/svg"
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

                  <div
                    v-if="isSeasonDropdownOpen"
                    class="absolute mt-1 w-full rounded border border-netflix-gray-150 z-50 max-h-60 overflow-auto netflix-dropdown-menu font-semibold text-lg"
                  >
                    <div class="py-2">
                      <button
                        v-for="season in seasons"
                        :key="season.id"
                        @click="selectSeason(season.season_number)"
                        class="block w-full text-left px-4 py-2 text-white hover:bg-netflix-gray-150 cursor-pointer"
                        :class="{
                          'bg-netflix-gray-800':
                            selectedSeason === season.season_number,
                        }"
                      >
                        <div class="flex justify-between items-center">
                          <span>{{
                            season.name || `Season ${season.season_number}`
                          }}</span>
                          <span class="text-white text-sm">
                            ({{ season.episode_count || "?" }} Episodes)
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Episodes list -->
            <div class="grid gap-4">
              <!-- Loading skeletons -->
              <div
                v-if="isLoadingEpisodes"
                v-for="i in 5"
                :key="`skeleton-${i}`"
                class="flex border-b border-white/10 pb-4 p-2 animate-pulse"
              >
                <!-- Episode thumbnail skeleton -->
                <div
                  class="w-40 h-24 flex-shrink-0 mr-4 bg-netflix-gray-250 rounded"
                ></div>

                <!-- Episode info skeleton -->
                <div class="flex-1">
                  <div class="h-5 bg-netflix-gray-250 rounded w-1/3 mb-3"></div>
                  <div
                    class="h-3 bg-netflix-gray-250 rounded w-full mb-2"
                  ></div>
                  <div class="h-3 bg-netflix-gray-250 rounded w-2/3"></div>
                </div>

                <!-- Play button skeleton -->
                <div
                  class="self-center ml-2 p-2 rounded-full w-12 h-12 bg-netflix-gray-250"
                ></div>
              </div>

              <!-- Actual episodes (shown when not loading) -->
              <div
                v-if="!isLoadingEpisodes"
                v-for="episode in filteredEpisodes"
                :key="episode.id"
                class="flex border-b border-white/10 pb-4 hover:bg-white/5 p-2 transition-colors cursor-pointer"
              >
                <h3
                  class="mr-6 flex text-center items-center text-2xl font-semibold text-gray-300"
                >
                  {{ episode.episode_number }}
                </h3>
                <!-- Episode thumbnail -->
                <div class="w-52 h-28 flex-shrink-0 mr-4">
                  <img
                    :src="
                      episode.still_path
                        ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
                        : '/NotflixLogo.png'
                    "
                    :alt="`${episode.name} thumbnail`"
                    class="w-full h-full object-cover rounded"
                  />
                </div>

                <!-- Episode info -->
                <div class="flex-1">
                  <h3 class="font-bold">
                    {{ episode.name }}
                  </h3>
                  <p class="text-sm text-white/70 line-clamp-2">
                    {{ episode.overview }}
                  </p>
                </div>

                <!-- Play button -->
                <button
                  class="self-center ml-2 p-2 rounded-full hover:bg-white/10"
                >
                  <svg fill="currentColor" class="w-8 h-8" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"></path>
                  </svg>
                </button>
              </div>

              <!-- Empty state when no episodes are available -->
              <div
                v-if="
                  !isLoadingEpisodes &&
                  (!filteredEpisodes || filteredEpisodes.length === 0)
                "
                class="py-8 text-center text-gray-400"
              >
                No episodes available for this season.
              </div>
            </div>
          </div>

          <!-- More like this section -->
          <div class="mt-12">
            <h2 class="text-2xl font-semibold mb-4">More Like This</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              <div
                v-for="(item, index) in similarContent"
                :key="index"
                class="relative bg-netflix-gray-250 rounded overflow-hidden cursor-pointer pb-12"
              >
                <!-- Content container with fixed aspect ratio -->
                <div class="flex flex-col">
                  <!-- Backdrop image with fixed aspect ratio -->
                  <div class="aspect-video relative">
                    <img
                      :src="
                        item.backdrop_path
                          ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
                          : '/NotflixLogo.png'
                      "
                      :alt="item.title || item.name"
                      class="w-full h-full object-cover"
                    />

                    <!-- Logo overlay with gradient background -->
                    <div
                      class="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                    >
                      <img
                        v-if="similarLogos[item.id]"
                        :src="`https://image.tmdb.org/t/p/w300${
                          similarLogos[item.id]
                        }`"
                        :alt="`${item.title || item.name} Logo`"
                        class="max-h-16 w-auto drop-shadow-lg"
                        draggable="false"
                      />
                      <h3
                        v-else
                        class="text-white text-center font-bold 2xl:text-md 3xl:text-xl px-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                      >
                        {{ item.title || item.name }}
                      </h3>
                    </div>
                  </div>

                  <!-- Info section below image -->
                  <div class="bg-netflix-gray-800 p-2 flex flex-col h-full">
                    <!-- Gray menu bar with metadata -->
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <span
                          class="border border-netflix-gray-100 text-md px-1 py-0 inline-flex text-netflix-gray-25 leading-tight"
                          >{{ contentRating }}</span
                        >
                        <!-- HD indicator -->
                        <span
                          class="border border-netflix-gray-100 rounded xl:text-xs 2xl:text-sm text-white px-1"
                          >HD</span
                        >

                        <span class="lg:text-md 3xl:text-lg text-gray-300">
                          {{
                            new Date(
                              item.release_date || item.first_air_date || ""
                            ).getFullYear() || "N/A"
                          }}
                        </span>
                      </div>

                      <!-- Plus Button -->
                      <button
                        @click.stop.prevent="
                          (event) => toggleSimilarInMyList(item, event)
                        "
                        class="border bg-transparent border-gray-400/70 border-2 hover:border-white hover:bg-white/25 text-white rounded-full lg:p-2 xl:p-2 2xl:p-3.5 hover:bg-white/10 transition-colors cursor-pointer"
                        :title="
                          isItemInMyList(item)
                            ? 'Remove from My List'
                            : 'Add to My List'
                        "
                      >
                        <!-- Plus icon (when not in list) -->
                        <svg
                          v-if="!isItemInMyList(item)"
                          viewBox="0 -0.5 21 21"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          xmlns:xlink="http://www.w3.org/1999/xlink"
                          fill="#ffffff"
                          class="lg:w-4 lg:h-4 2xl:w-5 2xl:h-5"
                        >
                          <g id="SVGRepo_iconCarrier">
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
                                <g
                                  id="icons"
                                  transform="translate(56.000000, 160.000000)"
                                >
                                  <polygon
                                    id="plus-[#1512]"
                                    points="344 89 344 91 334.55 91 334.55 100 332.45 100 332.45 91 323 91 323 89 332.45 89 332.45 80 334.55 80 334.55 89"
                                  ></polygon>
                                </g>
                              </g>
                            </g>
                          </g>
                        </svg>

                        <!-- Check icon (when in list) -->
                        <svg
                          v-else
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          class="lg:w-4 lg:h-4 2xl:w-5 2xl:h-5"
                        >
                          <path
                            d="M5 12L10 17L20 7"
                            stroke="#ffffff"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </button>
                    </div>

                    <!-- Short description -->
                    <p
                      class="relative xl:text-sm 2xl:text-md text-white/80 line-clamp-5 mt-4"
                    >
                      {{
                        item.overview
                          ? item.overview.substring(0, 200) +
                            (item.overview.length > 200 ? "..." : "")
                          : "No description available."
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
import {
  fetchMovieDetails,
  fetchTVShowDetails,
  fetchMovieTrailers,
  fetchTVShowTrailers,
  fetchMovieCast, // ← This is imported
  fetchTVShowCast, // ← This is imported
  fetchSimilarMovies,
  fetchSimilarTVShows,
  fetchMovieLogos,
  fetchTVShowLogos,
  fetchMovieRatings,
  fetchTVShowRatings,
  fetchTVShowSeasons,
} from "@/api/tmdb";
import { useAudioControl } from "@/composables/useAudioControl";
import { useUserStore } from "@/stores/user"; // Import the user store

// Simplified props - only need the minimal info to load content
const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  contentType: {
    type: String,
    default: "movie",
    validator: (value) => ["movie", "tv"].includes(value),
  },
});

const emit = defineEmits(["close"]);

// Initialize user store
const userStore = useUserStore();

// Reactive state for all content data
const isLoading = ref(true);
const title = ref("");
const overview = ref("");
const backdropPath = ref("");
const posterPath = ref("");
const releaseDate = ref("");
const firstAirDate = ref("");
const genres = ref([]);
const runtime = ref(null);
const trailerKey = ref(null);
const logoPath = ref(null);
const cast = ref([]);
const director = ref("");
const episodes = ref([]);
const seasons = ref([]);
const similarContent = ref([]);
const contentRating = ref(null);
const similarLogos = ref({});
const isRatingPopupOpen = ref(false);

// YouTube player state
const isMuted = ref(true);
const trailerEnded = ref(false);
const playerEl = ref(null);
const selectedSeason = ref(1);
let player = null;

// Audio control
const { requestAudioFocus, hasAudioFocus, getActiveAudioSource } =
  useAudioControl();
const activeAudioSource = getActiveAudioSource();
let releaseAudioFocus = null;
const componentId = "content-modal";

// Computed properties
const backdrop = computed(() =>
  backdropPath.value
    ? `https://image.tmdb.org/t/p/original${backdropPath.value}`
    : null
);

const releaseYear = computed(() => {
  const date = releaseDate.value || firstAirDate.value;
  return date ? new Date(date).getFullYear() : null;
});

const filteredEpisodes = computed(() => {
  if (!episodes.value.length) return [];
  return episodes.value.filter(
    (episode) => episode.season_number === selectedSeason.value
  );
});

// New computed property for cast list
const castList = computed(() => {
  if (!cast.value || cast.value.length === 0) {
    return [];
  }

  // Add debugging
  console.log("Building cast list from", cast.value.length, "actors");

  // Get top 8 cast members (or fewer if not available)
  return cast.value.slice(0, 8).map((actor) => ({
    id: actor.id || Math.random().toString(),
    name: actor.name || "Unknown",
    character: actor.character || "",
  }));
});

// Add these to your existing reactive state variables
const isSeasonDropdownOpen = ref(false);
const isLoadingEpisodes = ref(false);

// Add this computed property
const currentSeasonName = computed(() => {
  const season = seasons.value.find(
    (s) => s.season_number === selectedSeason.value
  );
  return season
    ? season.name || `Season ${season.season_number}`
    : "Select a season";
});

// Computed property to check if the current item is in "My List"
const isInMyList = computed(() => {
  if (!userStore.currentMyList || !props.id) return false;
  return userStore.currentMyList.some(
    (listItem) =>
      Number(listItem.id) === Number(props.id) &&
      listItem.media_type === props.contentType
  );
});

// Main function to fetch all content data
async function loadContent() {
  isLoading.value = true;

  try {
    if (props.contentType === "movie") {
      await fetchMovieData(props.id);
    } else {
      await fetchTVShowData(props.id);
    }
  } catch (error) {
    console.error("Error loading content:", error);
  } finally {
    isLoading.value = false;
  }
}

// Fetch movie data
async function fetchMovieData(movieId) {
  try {
    console.log("Fetching movie data for ID:", movieId);

    // Keep your existing Promise.all code
    const [
      detailsResponse,
      creditsResponse,
      similarResponse,
      trailersResponse,
      logoResponse,
      ratingResponse,
    ] = await Promise.all([
      fetchMovieDetails(movieId),
      fetchMovieCast(movieId),
      fetchSimilarMovies(movieId),
      fetchMovieTrailers(movieId),
      fetchMovieLogos(movieId),
      fetchMovieRatings(movieId),
    ]);

    console.log("Movie API responses received:", {
      details: !!detailsResponse,
      credits: !!creditsResponse,
      similar: !!similarResponse,
      trailers: trailersResponse?.length || 0,
      logo: !!logoResponse,
      rating: !!ratingResponse,
    });

    // Update state with movie details
    if (detailsResponse) {
      title.value = detailsResponse.title || "";
      overview.value = detailsResponse.overview || "";
      backdropPath.value = detailsResponse.backdrop_path || "";
      posterPath.value = detailsResponse.poster_path || "";
      releaseDate.value = detailsResponse.release_date || "";
      genres.value = detailsResponse.genres || [];
      runtime.value = detailsResponse.runtime || null;
    }

    // Update credits - add better logging
    if (creditsResponse) {
      console.log(
        "Cast data received:",
        creditsResponse.cast?.length || 0,
        "actors"
      );
      cast.value = creditsResponse.cast || [];

      // If cast is empty, try fetching directly
      if (!cast.value.length) {
        console.log("No cast from credits response, trying direct fetch");
        try {
          const BASE_URL = "https://api.themoviedb.org/3";
          const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
          const url = `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data.cast && data.cast.length) {
              console.log(
                "Direct fetch successful:",
                data.cast.length,
                "actors found"
              );
              cast.value = data.cast;
            }
          }
        } catch (e) {
          console.error("Error in direct cast fetch:", e);
        }
      }

      // Find director from crew
      const directors =
        creditsResponse.crew?.filter((person) => person.job === "Director") ||
        [];
      director.value = directors.map((d) => d.name).join(", ");
    }

    // Update similar content
    if (similarResponse) {
      similarContent.value = similarResponse.slice(0, 12);
      // Fetch logos for similar content
      fetchSimilarContentLogos();
    }

    // Update trailer key
    if (trailersResponse && trailersResponse.length > 0) {
      // Prefer official trailers if available
      const officialTrailer = trailersResponse.find(
        (trailer) => trailer.type === "Trailer" && trailer.official
      );
      trailerKey.value = officialTrailer?.key || trailersResponse[0].key;
    }

    // Update logo path
    if (logoResponse) {
      logoPath.value = logoResponse;
    }

    // Update content rating
    if (ratingResponse) {
      contentRating.value = ratingResponse;
    }

    // Initialize player if trailer key exists
    if (trailerKey.value) {
      await safeCreatePlayer();
    }
  } catch (error) {
    console.error("Error fetching movie data:", error);
    // Provide fallback values in case of error
    cast.value = cast.value || [];
  }
}

function replayTrailer() {
  if (!trailerKey.value) return;

  // Set state first
  trailerEnded.value = false;

  // Destroy and recreate player to ensure clean restart
  if (player) {
    try {
      player.destroy();
    } catch (e) {
      console.error("Error destroying player:", e);
    }
    player = null;
  }

  // Wait for DOM to update before creating player
  nextTick(() => {
    createPlayer();
  });
}

// Fetch TV show data
async function fetchTVShowData(tvId) {
  try {
    console.log("Fetching TV show data for ID:", tvId);

    const [
      detailsResponse,
      creditsResponse,
      similarResponse,
      trailersResponse,
      logoResponse,
      ratingResponse,
      seasonsData,
    ] = await Promise.all([
      fetchTVShowDetails(tvId),
      fetchTVShowCast(tvId),
      fetchSimilarTVShows(tvId),
      fetchTVShowTrailers(tvId),
      fetchTVShowLogos(tvId),
      fetchTVShowRatings(tvId),
      fetchTVShowSeasons(tvId),
    ]);

    console.log("TV API responses received:", {
      details: !!detailsResponse,
      credits: !!creditsResponse,
      similar: !!similarResponse,
      trailers: trailersResponse?.length || 0,
      logo: !!logoResponse,
      rating: !!ratingResponse,
      seasons: !!seasonsData,
    });

    // Update TV show details
    if (detailsResponse) {
      title.value = detailsResponse.name || "";
      overview.value = detailsResponse.overview || "";
      backdropPath.value = detailsResponse.backdrop_path || "";
      posterPath.value = detailsResponse.poster_path || "";
      firstAirDate.value = detailsResponse.first_air_date || "";
      genres.value = detailsResponse.genres || [];
      seasons.value = detailsResponse.seasons || [];
    }

    // Update credits
    if (creditsResponse) {
      console.log(
        "TV Cast data received:",
        creditsResponse.cast?.length || 0,
        "actors"
      );
      cast.value = creditsResponse.cast || [];

      // If cast is empty, try fetching directly
      if (!cast.value.length) {
        console.log("No cast from TV credits response, trying direct fetch");
        try {
          const BASE_URL = "https://api.themoviedb.org/3";
          const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
          const url = `${BASE_URL}/tv/${tvId}/credits?api_key=${API_KEY}`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data.cast && data.cast.length) {
              console.log(
                "Direct TV fetch successful:",
                data.cast.length,
                "actors found"
              );
              cast.value = data.cast;
            }
          }
        } catch (e) {
          console.error("Error in direct TV cast fetch:", e);
        }
      }

      // Find creators/showrunners
      const creators =
        creditsResponse.crew?.filter(
          (person) =>
            person.job === "Executive Producer" || person.job === "Creator"
        ) || [];
      director.value = creators.map((c) => c.name).join(", ");
    }

    // Update similar content
    if (similarResponse) {
      similarContent.value = similarResponse.slice(0, 12);
      // Fetch logos for similar content
      fetchSimilarContentLogos();
    }

    // Update trailer key
    if (trailersResponse && trailersResponse.length > 0) {
      trailerKey.value = trailersResponse[0].key;
    }

    // Update logo path
    if (logoResponse) {
      logoPath.value = logoResponse;
    }

    // Update content rating
    if (ratingResponse) {
      contentRating.value = ratingResponse;
    }

    // Update seasons if available
    if (detailsResponse && detailsResponse.seasons) {
      // Filter out season 0 (specials) for display purposes
      seasons.value = detailsResponse.seasons.filter(
        (s) => s.season_number > 0
      );

      // Sort seasons numerically
      seasons.value.sort((a, b) => a.season_number - b.season_number);

      // Default to season 1 if available, otherwise first season
      const season1 = seasons.value.find((s) => s.season_number === 1);
      if (season1) {
        selectedSeason.value = 1;
      } else if (seasons.value.length > 0) {
        selectedSeason.value = seasons.value[0].season_number;
      }

      // Fetch episodes for the selected season
      const seasonEpisodes = await fetchSeasonEpisodes(
        tvId,
        selectedSeason.value
      );
      episodes.value = seasonEpisodes;
    }

    // Initialize player if trailer key exists
    if (trailerKey.value) {
      await safeCreatePlayer();
    }
  } catch (error) {
    console.error("Error fetching TV show data:", error);
    // Provide fallback values in case of error
    cast.value = cast.value || [];
  }
}

// Add this function to fetch episodes for a specific season
async function fetchSeasonEpisodes(tvId, seasonNumber) {
  try {
    console.log(
      `Fetching episodes for TV show ${tvId}, season ${seasonNumber}`
    );
    const BASE_URL = "https://api.themoviedb.org/3";
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

    const url = `${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error(
        `Failed to fetch season data: ${res.status} ${res.statusText}`
      );
      return [];
    }

    const data = await res.json();
    console.log(
      `Received ${
        data.episodes?.length || 0
      } episodes for season ${seasonNumber}`
    );
    return data.episodes || [];
  } catch (error) {
    console.error(`Error fetching season episodes:`, error);
    return [];
  }
}

// Add this watcher to fetch new episodes when the season changes
watch(selectedSeason, async (newSeason) => {
  if (props.contentType === "tv" && newSeason) {
    console.log(`Season changed to ${newSeason}, fetching episodes...`);

    // Set loading state instead of clearing episodes
    isLoadingEpisodes.value = true;

    // Fetch new episodes
    const seasonEpisodes = await fetchSeasonEpisodes(props.id, newSeason);

    // Update episodes and end loading state
    episodes.value = seasonEpisodes;
    isLoadingEpisodes.value = false;
  }
});

// Add this function to toggle the season dropdown
function toggleSeasonDropdown() {
  isSeasonDropdownOpen.value = !isSeasonDropdownOpen.value;
}

// Add this function to select a season
function selectSeason(seasonNumber) {
  selectedSeason.value = seasonNumber;
  isSeasonDropdownOpen.value = false;
}

// Update onMounted to add an event listener to close the dropdown when clicking outside
onMounted(() => {
  loadContent();

  // Prevent body scrolling when modal is open
  document.body.style.overflow = "hidden";

  // Close dropdown when clicking outside
  document.addEventListener("click", handleClickOutside);
});

// Define the click handler
function handleClickOutside(e) {
  if (isSeasonDropdownOpen.value) {
    const dropdown = document.querySelector(".netflix-dropdown-menu");
    const toggleButton = e.target.closest('[data-action="toggle-season"]');

    if (dropdown && !dropdown.contains(e.target) && !toggleButton) {
      isSeasonDropdownOpen.value = false;
    }
  }

  // Updated code for rating popup
  if (isRatingPopupOpen.value) {
    const ratingButton = e.target.closest('button[class*="rounded-full"]');
    const ratingPopup = e.target.closest(".absolute.-bottom-3");

    if (!ratingButton && !ratingPopup) {
      isRatingPopupOpen.value = false;
    }
  }
}

// Update onBeforeUnmount to remove the event listener
onBeforeUnmount(() => {
  // Restore body scrolling when modal is closed
  document.body.style.overflow = "";

  // Clean up player
  if (player && typeof player.destroy === "function") {
    try {
      player.destroy();
    } catch (e) {
      console.error("Error destroying player in onBeforeUnmount:", e);
    }
  }
  player = null; // Ensure player is nullified

  // Clear any interval
  if (videoTimeIntervalId) {
    clearInterval(videoTimeIntervalId);
    videoTimeIntervalId = null;
  }

  // Release audio focus
  if (releaseAudioFocus) {
    releaseAudioFocus();
    releaseAudioFocus = null;
  }

  // Remove event listener
  document.removeEventListener("click", handleClickOutside);
});

// Helper functions
function formatRuntime(minutes) {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function formatCast(cast) {
  if (!cast || !cast.length) return "";
  return cast
    .slice(0, 3)
    .map((person) => person.name)
    .join(", ");
}

function close() {
  if (player && typeof player.destroy === "function") {
    try {
      player.destroy();
    } catch (e) {
      console.error("Error destroying player in close():", e);
    }
  }
  player = null; // Explicitly nullify

  if (releaseAudioFocus) {
    releaseAudioFocus();
    releaseAudioFocus = null;
  }

  emit("close");
}

// YouTube player setup
async function loadYouTubeAPI() {
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

// Function borrowed from FeaturedTrailer to safely create the player
async function safeCreatePlayer() {
  try {
    console.log("Setting up YouTube player...");
    await nextTick();

    if (!trailerKey.value) {
      console.warn("No trailer key available");
      return;
    }

    if (!playerEl.value) {
      console.warn("Player element not found");
      return;
    }

    await loadYouTubeAPI();
    console.log(
      "YouTube API loaded, creating player for video:",
      trailerKey.value
    );
    await createPlayer();
  } catch (error) {
    console.error("Error creating player:", error);
    trailerEnded.value = true; // Fall back to backdrop
  }
}

function toggleMute() {
  if (!player) {
    console.error("toggleMute: Player not available (null or undefined).");
    return;
  }

  if (
    typeof player.getPlayerState !== "function" ||
    typeof player.playVideo !== "function" ||
    typeof player.mute !== "function" ||
    typeof player.unMute !== "function" ||
    typeof player.setVolume !== "function"
  ) {
    console.error(
      "toggleMute: Player object seems invalid (missing YT Player methods). This might happen if onReady hasn't properly set the player instance. Current player object:",
      player
    );
    return;
  }

  isMuted.value = !isMuted.value;
  console.log(
    `Toggling mute. Desired state: ${isMuted.value ? "MUTED" : "UNMUTED"}`
  );

  if (!isMuted.value) {
    // Attempting to UNMUTE
    releaseAudioFocus = requestAudioFocus(componentId);
    try {
      console.log(
        "Attempting to unmute player. Current state before unmute:",
        player.getPlayerState(),
        "isMuted:",
        player.isMuted(),
        "Volume:",
        player.getVolume()
      );

      player.unMute();
      player.setVolume(100);
      if (player.getPlayerState() !== window.YT.PlayerState.PLAYING) {
        player.playVideo();
      }
      console.log(
        "Player state after unmute commands:",
        player.getPlayerState(),
        "isMuted:",
        player.isMuted(),
        "Volume:",
        player.getVolume()
      );

      setTimeout(() => {
        if (
          player &&
          typeof player.isMuted === "function" &&
          typeof player.getPlayerState === "function" &&
          typeof player.getVolume === "function"
        ) {
          const stillMuted = player.isMuted();
          const playState = player.getPlayerState();
          const currentVolume = player.getVolume();
          console.log(
            `Post-unmute check (100ms): Is Muted: ${stillMuted}, Player State: ${playState}, Volume: ${currentVolume}`
          );
          if (stillMuted) {
            console.warn(
              "Player still muted after 100ms, retrying unmute/volume."
            );
            player.unMute();
            player.setVolume(100);
          }
          if (
            playState !== window.YT.PlayerState.PLAYING &&
            playState !== window.YT.PlayerState.BUFFERING
          ) {
            console.warn(
              "Player not playing/buffering after 100ms, retrying playVideo."
            );
            player.playVideo();
          }
        } else {
          console.warn(
            "Player instance or methods became unavailable for unmute timeout check."
          );
        }
      }, 100);
    } catch (e) {
      console.error("Error during unmute operation:", e);
      // Potentially revert isMuted.value if unmuting fails critically
      // isMuted.value = true;
    }
  } else {
    // Attempting to MUTE
    console.log("Attempting to mute player...");
    player.mute();
    if (releaseAudioFocus) {
      releaseAudioFocus();
      releaseAudioFocus = null;
    }
  }
}

async function createPlayer() {
  if (!trailerKey.value || !playerEl.value) {
    console.warn("Cannot create player: missing key or element");
    return;
  }

  try {
    console.log(
      "Attempting to create YT.Player. Current `player` variable before creation:",
      player
    );
    if (player && typeof player.destroy === "function") {
      console.warn(
        "Existing player found before creating a new one. Destroying old player."
      );
      try {
        player.destroy();
      } catch (destroyError) {
        console.error("Error destroying old player instance:", destroyError);
      }
      player = null;
    }

    if (!window.YT || !window.YT.Player) {
      console.error(
        "YouTube API (window.YT or window.YT.Player) not available at createPlayer. Attempting to load again."
      );
      await loadYouTubeAPI();
      if (!window.YT || !window.YT.Player) {
        console.error(
          "YouTube API still not available after attempting to reload. Aborting player creation."
        );
        trailerEnded.value = true;
        player = null;
        return;
      }
    }

    const newPlayerInstance = new window.YT.Player(playerEl.value, {
      videoId: trailerKey.value,
      playerVars: {
        autoplay: 1,
        controls: 0,
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
          console.log(
            "YouTube player onReady event. Assigning event.target to component's player variable."
          );
          player = event.target; // Crucial assignment

          if (!player || typeof player.mute !== "function") {
            console.error(
              "Player in onReady is invalid or missing methods. Event target:",
              event.target
            );
            trailerEnded.value = true;
            return;
          }

          console.log(
            "Player assigned in onReady. Initial isMuted:",
            player.isMuted(),
            "Volume:",
            player.getVolume()
          );

          player.mute();
          isMuted.value = true;
          player.setVolume(100);
          player.playVideo();

          console.log("Player state after onReady setup commands:", {
            state: player.getPlayerState(),
            muted: player.isMuted(),
            volume: player.getVolume(),
          });

          const iframe = player.getIframe();
          if (iframe) {
            iframe.style.position = "absolute";
            iframe.style.top = "50%";
            iframe.style.left = "50%";
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.transform = "translate(-50%, -50%) scale(1.01)";
            iframe.style.transformOrigin = "center center";
            iframe.style.objectFit = "cover";
            iframe.style.pointerEvents = "none";

            const container = playerEl.value;
            if (container) {
              container.style.overflow = "hidden";
              container.style.position = "relative";
              container.style.height = "100%";
            }
          }
          monitorVideoTime();
        },
        onError: (event) => {
          console.error(
            "YouTube player error event. Data:",
            event.data,
            "Current player instance:",
            player
          );
          trailerEnded.value = true;
          if (player && typeof player.destroy === "function") {
            try {
              player.destroy();
            } catch (e) {
              console.error("Error destroying player in onError:", e);
            }
          }
          player = null;
        },
        onStateChange: (event) => {
          if (!player || typeof player.getPlayerState !== "function") {
            console.warn(
              "onStateChange: Player not valid or methods missing. Current player:",
              player,
              "Event data:",
              event.data
            );
            // If player became invalid, we might not be able to get isMuted or getVolume.
            // Log event.data directly.
            if (event.data === window.YT.PlayerState.ENDED) {
              trailerEnded.value = true;
              if (releaseAudioFocus) {
                releaseAudioFocus();
                releaseAudioFocus = null;
              }
            }
            return;
          }
          console.log(
            "YouTube player state change. Data:",
            event.data,
            "isMuted:",
            player.isMuted(),
            "Volume:",
            player.getVolume(),
            "Player State:",
            player.getPlayerState()
          );

          if (event.data === window.YT.PlayerState.ENDED) {
            trailerEnded.value = true;
            if (releaseAudioFocus) {
              releaseAudioFocus();
              releaseAudioFocus = null;
            }
          }
        },
      },
    });

    if (
      !newPlayerInstance ||
      typeof newPlayerInstance.getPlayerState !== "function"
    ) {
      console.error(
        "new window.YT.Player() constructor did not immediately return a valid-looking player object. Result:",
        newPlayerInstance
      );
      // Don't assign to 'player' here; rely on onReady to assign the fully functional instance.
      // If onReady doesn't fire or fails, 'player' might remain null or the old instance.
      // trailerEnded.value = true; // onReady or onError should handle this
    } else {
      console.log(
        "YT.Player constructor returned. Waiting for onReady to assign to component's player. Instance:",
        newPlayerInstance
      );
    }
  } catch (error) {
    console.error("Error in createPlayer's main try-catch block:", error);
    trailerEnded.value = true;
    if (player && typeof player.destroy === "function") {
      try {
        player.destroy();
      } catch (e) {
        console.error("Error destroying player in createPlayer catch:", e);
      }
    }
    player = null;
  }
}

// Add this function to monitor and stop video before end (copied from FeaturedTrailer)
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

      // If within 1.5 seconds of the end, stop the video
      if (duration > 0 && currentTime > 0 && duration - currentTime < 1.5) {
        clearInterval(checkTimeInterval);
        trailerEnded.value = true;
        player.stopVideo(); // Stop instead of letting it end naturally
      }
    } catch (e) {
      console.error("Error monitoring video time:", e);
      clearInterval(checkTimeInterval);
    }
  }, 1000); // Check every second

  // Store interval ID for cleanup
  videoTimeIntervalId = checkTimeInterval;
}

let videoTimeIntervalId = null;

// Cleanup on component unmount
onBeforeUnmount(() => {
  // Restore body scrolling when modal is closed
  document.body.style.overflow = "";

  // Clean up player
  if (player && typeof player.destroy === "function") {
    try {
      player.destroy();
    } catch (e) {
      console.error("Error destroying player in onBeforeUnmount:", e);
    }
  }
  player = null; // Ensure player is nullified

  // Clear any interval
  if (videoTimeIntervalId) {
    clearInterval(videoTimeIntervalId);
    videoTimeIntervalId = null;
  }

  // Release audio focus
  if (releaseAudioFocus) {
    releaseAudioFocus();
    releaseAudioFocus = null;
  }

  // Remove event listener
  document.removeEventListener("click", handleClickOutside);
});

// Load content when component mounts
onMounted(() => {
  loadContent();

  // Prevent body scrolling when modal is open
  document.body.style.overflow = "hidden";
});

// Watch for changes in active audio source
watch(activeAudioSource, (newSource) => {
  // If some other component has audio focus
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

// Add this watch handler after your computed properties
watch(cast, (newCast) => {
  console.log("Cast data updated:", newCast?.length || 0, "actors");
  if (newCast && newCast.length > 0) {
    console.log("First cast member:", newCast[0]);
  }
});

// Replace the single selectedRating ref with a content ratings map
const contentRatings = ref({});

// Add a computed property to get the current content's rating
const getCurrentRating = computed(() => {
  return contentRatings.value[props.id] || null;
});

// Update the rating function to be content-specific
function selectRating(rating) {
  // Toggle rating if clicking the same one
  if (contentRatings.value[props.id] === rating) {
    contentRatings.value[props.id] = null;
  } else {
    // Set the new rating
    contentRatings.value = {
      ...contentRatings.value,
      [props.id]: rating,
    };
  }

  console.log(`Content ${props.id} rated as: ${rating}`);

  // Optional: store ratings in localStorage for persistence
  try {
    localStorage.setItem(
      "netflix-ratings",
      JSON.stringify(contentRatings.value)
    );
  } catch (e) {
    console.error("Could not save rating to localStorage", e);
  }
}

// Add this function to fetch logos for similar content
async function fetchSimilarContentLogos() {
  if (!similarContent.value || similarContent.value.length === 0) return;

  const fetchPromises = similarContent.value.map(async (item) => {
    try {
      const logoPath = await (props.contentType === "movie"
        ? fetchMovieLogos(item.id)
        : fetchTVShowLogos(item.id));

      if (logoPath) {
        similarLogos.value[item.id] = logoPath;
      }
    } catch (error) {
      console.error(
        `Error fetching logo for ${props.contentType} ID ${item.id}:`,
        error
      );
    }
  });

  await Promise.allSettled(fetchPromises);
}

// Toggle item in My List for ContentModal
async function toggleMyListInModal() {
  if (!userStore.currentProfile) {
    console.warn("No profile selected. Cannot modify list.");
    return;
  }

  try {
    if (isInMyList.value) {
      const listItem = userStore.currentMyList.find(
        (item) =>
          Number(item.id) === Number(props.id) &&
          item.media_type === props.contentType
      );

      if (!listItem || !listItem.docId) {
        console.error(
          "Item or its Firestore docId not found in local list for removal (Modal)."
        );
        return;
      }
      await userStore.removeFromMyList(listItem.docId);
      console.log("Modal: Removed from My List -", title.value);
    } else {
      const itemToAdd = {
        id: props.id,
        title: title.value, // Use the fetched title
        name: props.contentType === "tv" ? title.value : null, // For TV shows, name is the title
        poster_path: posterPath.value,
        backdrop_path: backdropPath.value,
        media_type: props.contentType,
        overview: overview.value,
        // vote_average: itemDetails.value?.vote_average, // Assuming itemDetails holds this
        // release_date: releaseDate.value || firstAirDate.value, // Assuming these are populated
      };
      await userStore.addToMyList(itemToAdd);
      console.log("Modal: Added to My List -", title.value);
    }
  } catch (error) {
    console.error("Modal: Error updating My List:", error);
  }
}

// Function to check if a similar item is in My List - with better error handling
function isItemInMyList(item) {
  // Defensive check
  if (!item || !item.id || !userStore.currentMyList) return false;

  return userStore.currentMyList.some(
    (listItem) =>
      Number(listItem.id) === Number(item.id) &&
      listItem.media_type === (item.first_air_date ? "tv" : "movie")
  );
}

// Improve the toggleSimilarInMyList function with better error handling
async function toggleSimilarInMyList(item, event) {
  // Immediately prevent default and stop propagation
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Defensive check for the item
  if (!item || typeof item !== "object") {
    console.error("Cannot toggle list item: Invalid item", item);
    return;
  }

  if (!userStore.currentProfile) {
    console.warn("No profile selected. Cannot modify list.");
    return;
  }

  const mediaType = item.first_air_date ? "tv" : "movie";
  const title = item.title || item.name || "Unknown";
  const itemId = item.id; // Store the ID for later reference

  try {
    // Create a reference to the DOM element before we modify the list
    // This helps maintain event handling context
    const currentElement = event?.target?.closest("button");

    if (isItemInMyList(item)) {
      // Find the item in My List
      const listItem = userStore.currentMyList.find(
        (listItem) =>
          Number(listItem.id) === Number(itemId) &&
          listItem.media_type === mediaType
      );
f
      if (!listItem || !listItem.docId) {
        console.error(
          "Item or its Firestore docId not found in local list for removal."
        );
        return;
      }

      // Optimistically remove from UI list first
      const currentList = [...userStore.currentMyList];
      const itemIndex = currentList.findIndex(
        (i) => Number(i.id) === Number(itemId) && i.media_type === mediaType
      );

      if (itemIndex > -1) {
        userStore.currentMyList = [
          ...currentList.slice(0, itemIndex),
          ...currentList.slice(itemIndex + 1),
        ];
      }

      // Then perform the actual Firestore operation
      await userStore.removeFromMyList(listItem.docId);
      console.log("Similar: Removed from My List -", title);
    } else {
      const itemToAdd = {
        id: itemId,
        title: item.title || null,
        name: item.name || null,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        media_type: mediaType,
        overview: item.overview,
        vote_average: item.vote_average,
        release_date: item.release_date || item.first_air_date,
      };

      await userStore.addToMyList(itemToAdd);
      console.log("Similar: Added to My List -", title);
    }

    // Wait for DOM to update completely
    await nextTick();

    // Reset any hover cards or states that may reference stale data
    document.querySelectorAll(".content-hover-card").forEach((card) => {
      card.dispatchEvent(new Event("mouseleave"));
    });

    // Add a small delay before allowing more interactions
    // This gives time for all components to complete their updates
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Focus back on the original element if it still exists
    if (currentElement && currentElement.isConnected) {
      currentElement.focus();
    }
  } catch (error) {
    console.error("Similar: Error updating My List:", error);
  }
}

// Add this function to your script section
function handleOutsideClick(event) {
  // Only close if clicking directly on backdrop (not on content)
  if (
    event.target.classList.contains("fixed") ||
    event.target.classList.contains("bg-black/70")
  ) {
    close();
  }
}
</script>

<style scoped>
.content-modal {
  scroll-behavior: smooth;
  overscroll-behavior: contain;
  /* These next two properties are causing the issue - remove them */
  /* isolation: isolate; */
  /* pointer-events: auto; */
}

/* Hide scrollbar for Chrome, Safari and Opera */
.content-modal::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.content-modal {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.netflix-dropdown-menu {
  background-color: #242424;
  z-index: 100;
}

/* Add these new styles for the thumbs down icon rotation */
.thumbs-down-container {
  transform: rotate(180deg);
}

/* Make sure backdrop click works */
.fixed.inset-0 {
  pointer-events: auto !important;
}

/* Make sure the backdrop itself gets clicks */
.absolute.inset-0.bg-black\/70 {
  pointer-events: auto !important;
}

/* Ensure hover cards don't interfere only with modal content */
:deep(.content-hover-card) {
  pointer-events: none;
}

/* Optional: Animation for rating selection */
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

/* Add to your existing style section */
.origin-center {
  transform-origin: center;
}

/* For a more organic Netflix-like effect */
.rating-popup-enter-active {
  transition-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
}

.rating-popup-leave-active {
  transition-timing-function: cubic-bezier(0.5, 0, 0.75, 0);
}

/* This is already defined above - remove the duplicate */
/* .thumbs-down-container {
  transform: rotate(180deg);
} */

/* REMOVE THESE PROBLEMATIC LINES */
/* .content-modal {
  isolation: isolate;
  z-index: 9999;
  pointer-events: auto;
} */

/* Ensure hover cards don't interfere with modal clicks */
:deep(.content-hover-card) {
  pointer-events: none !important;
}
</style>
