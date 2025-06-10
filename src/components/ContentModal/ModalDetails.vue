<template>
  <div class="flex flex-col md:flex-row gap-8">
    <div class="flex-1">
      <div class="flex items-center gap-3 text-md mb-4">
        <span v-if="releaseYear" class="text-netflix-gray-25 font-semibold">{{
          releaseYear
        }}</span>
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

        <span v-if="runtime" class="text-netflix-gray-25 font-semibold">{{
          formatRuntime(runtime)
        }}</span>
      </div>
      <span
        v-if="contentRating"
        class="border px-1 text-sm text-netflix-gray-25 border-netfilx-gray-100 leading-tight"
        >{{ contentRating }}</span
      >
      <p
        class="text-white mb-6 xl:text-sm 2xl:text-md 3xl:text-lg mt-4 xl:w-md 2xl:w-lg 3xl:max-w-3xl"
      >
        {{ overview }}
      </p>
    </div>

    <!-- Right column: Additional info -->
    <div class="w-full md:w-1/3 text-sm">
      <div class="flex flex-col space-y-2">
        <p v-if="castList.length > 0">
          <span class="text-gray-400">Cast: </span>
          <span class="text-white">{{ castList }}</span>
        </p>
        <p v-if="genreList.length > 0">
          <span class="text-gray-400">Genres: </span>
          <span class="text-white">{{ genreList }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  details: Object,
  cast: Array,
  contentRating: String,
});

const releaseYear = computed(() => {
  const date = props.details?.release_date || props.details?.first_air_date;
  return date ? new Date(date).getFullYear() : null;
});
const runtime = computed(() => props.details?.runtime);
const overview = computed(() => props.details?.overview);

const formatRuntime = (minutes) => {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

const castList = computed(
  () =>
    props.cast
      ?.slice(0, 3)
      .map((c) => c.name)
      .join(", ") || ""
);
const genreList = computed(
  () => props.details?.genres?.map((g) => g.name).join(", ") || ""
);
</script>
