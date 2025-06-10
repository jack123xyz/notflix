// src/composables/useContentLoader.js
import { ref, computed, watch, onMounted } from "vue";
import { useMovieStore } from "@/stores/movieStore";
import { useTVStore } from "@/stores/tvStore";

export function useContentLoader(props) {
  const movieStore = useMovieStore();
  const tvStore = useTVStore();

  const store = computed(() =>
    props.contentType === "movie" ? movieStore : tvStore
  );

  const itemDetails = ref(null);
  const trailerKey = ref(null);
  const isLoading = ref(false);

  const title = computed(() => {
    if (!props.item) return "";
    return props.contentType === "movie" ? props.item.title : props.item.name;
  });

  const contentGenres = computed(() => {
    const storeGenres = store.value.genres;
    if (props.item?.genre_ids && storeGenres) {
      return props.item.genre_ids
        .slice(0, 3)
        .map((id) => storeGenres[id])
        .filter(Boolean);
    }
    if (itemDetails.value?.genres) {
      return itemDetails.value.genres.slice(0, 3).map((g) => g.name);
    }
    return [];
  });

  const loadData = async () => {
    if (!props.item?.id || isLoading.value) return;
    isLoading.value = true;

    try {
      let details;
      let videos;

      if (props.contentType === "movie") {
        details = await movieStore.getMovieDetails(props.item.id);
        videos = await movieStore.getMovieVideos(props.item.id);
      } else if (props.contentType === "tv") {
        details = await tvStore.getTVShowDetails(props.item.id);
        videos = await tvStore.getTVShowVideos(props.item.id);
      } else {
        console.warn(
          `[useContentLoader] Unknown content type: ${props.contentType}`
        );
        isLoading.value = false;
        return;
      }

      itemDetails.value = details;

      if (videos && videos.length > 0) {
        const trailer = videos.find((v) => v.type === "Trailer") || videos[0];
        trailerKey.value = trailer?.key || null;
      } else {
        trailerKey.value = null;
      }
    } catch (error) {
      console.error(
        `Error loading content for ${props.contentType} ID ${props.item.id}:`,
        error
      );

      itemDetails.value = null;
      trailerKey.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(async () => {
    if (store.value && !store.value.genres) {
      await store.value.fetchGenres();
    }
  });

  watch(
    () => props.item,
    (newItem, oldItem) => {
      if (newItem && newItem.id && (!oldItem || newItem.id !== oldItem.id)) {
        loadData();
      } else if (!newItem) {
        itemDetails.value = null;
        trailerKey.value = null;
      }
    },
    { immediate: true }
  );

  return {
    itemDetails,
    trailerKey,
    title,
    contentGenres,
    isLoading,
  };
}
