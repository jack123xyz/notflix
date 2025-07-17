import { ref, watch, onMounted } from "vue";
import {
  fetchMovieDetails,
  fetchTVShowDetails,
  fetchMovieCast,
  fetchTVShowCast,
  fetchSimilarMovies,
  fetchSimilarTVShows,
  fetchMovieLogos,
  fetchTVShowLogos,
  fetchMovieRatings,
  fetchTVShowRatings,
  fetchMovieTrailers,
  fetchTVShowTrailers,
} from "@/api/tmdb";

export function useContentModalData(props) {
  const isLoading = ref(true);
  const details = ref(null);
  const cast = ref([]);
  const trailerKey = ref(null);
  const logoPath = ref(null);
  const similarContent = ref([]);
  const contentRating = ref(null);
  const similarLogos = ref({});

  const loadContent = async () => {
    if (!props.id) return;
    isLoading.value = true;
    try {
      const fetchDetailsFn =
        props.contentType === "movie" ? fetchMovieDetails : fetchTVShowDetails;
      const fetchCreditsFn =
        props.contentType === "movie" ? fetchMovieCast : fetchTVShowCast;
      const fetchSimilarFn =
        props.contentType === "movie"
          ? fetchSimilarMovies
          : fetchSimilarTVShows;
      const fetchTrailersFn =
        props.contentType === "movie"
          ? fetchMovieTrailers
          : fetchTVShowTrailers;
      const fetchLogosFn =
        props.contentType === "movie" ? fetchMovieLogos : fetchTVShowLogos;
      const fetchRatingsFn =
        props.contentType === "movie" ? fetchMovieRatings : fetchTVShowRatings;

      const [
        detailsRes,
        creditsRes,
        similarRes,
        trailersRes,
        logoRes,
        ratingRes,
      ] = await Promise.all([
        fetchDetailsFn(props.id),
        fetchCreditsFn(props.id),
        fetchSimilarFn(props.id),
        fetchTrailersFn(props.id),
        fetchLogosFn(props.id),
        fetchRatingsFn(props.id),
      ]);

      details.value = detailsRes;
      cast.value = Array.isArray(creditsRes) ? creditsRes : [];
      similarContent.value = similarRes?.slice(0, 12) || [];
      fetchSimilarContentLogos();
      logoPath.value = logoRes;
      contentRating.value = ratingRes;

      if (trailersRes && trailersRes.length > 0) {
        const officialTrailer = trailersRes.find(
          (t) => t.type === "Trailer" && t.official
        );
        trailerKey.value = officialTrailer?.key || trailersRes[0].key;
      }
    } catch (error) {
      console.error(
        `Error loading content modal data for ${props.contentType} ID ${props.id}:`,
        error
      );
    } finally {
      isLoading.value = false;
    }
  };
  const fetchSimilarContentLogos = async () => {
    if (!similarContent.value || similarContent.value.length === 0) return;

    const logoPromises = similarContent.value.map(async (item) => {
      const mediaType =
        item.media_type || (item.first_air_date ? "tv" : "movie");
      const fetchLogoFn =
        mediaType === "movie" ? fetchMovieLogos : fetchTVShowLogos;
      const logo = await fetchLogoFn(item.id);
      return { id: item.id, logo };
    });

    const logos = await Promise.all(logoPromises);
    const newLogos = {};
    logos.forEach(({ id, logo }) => {
      if (logo) newLogos[id] = logo;
    });
    similarLogos.value = newLogos;
  };

  onMounted(loadContent);
  watch(() => [props.id, props.contentType], loadContent, { immediate: true });

  return {
    isLoading,
    details,
    cast,
    trailerKey,
    logoPath,
    similarContent,
    contentRating,
    similarLogos,
  };
}
