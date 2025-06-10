import { defineStore } from "pinia";
import { ref } from "vue";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const useTVStore = defineStore("tv", () => {
  const genres = ref(null);
  const tvShowDetails = ref({});
  const tvShowVideos = ref({});
  const loading = ref(false);
  const error = ref(null);

  async function fetchGenres() {
    if (genres.value) return genres.value;

    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `${BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=en-US`
      );

      if (!response.ok)
        throw new Error(`Failed to fetch TV genres: ${response.status}`);

      const data = await response.json();

      const genreLookup = {};
      data.genres.forEach((genre) => {
        genreLookup[genre.id] = genre.name;
      });

      genres.value = genreLookup;
      return genreLookup;
    } catch (err) {
      console.error("Error fetching TV genres:", err);
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function getTVShowDetails(id) {
    if (tvShowDetails.value[id]) return tvShowDetails.value[id];

    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=en-US&append_to_response=content_ratings,credits,similar,keywords`
      );

      if (!response.ok)
        throw new Error(`Failed to fetch TV show details: ${response.status}`);

      const data = await response.json();
      tvShowDetails.value[id] = data;
      return data;
    } catch (err) {
      console.error(`Error fetching details for TV show ${id}:`, err);
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function getTVShowVideos(id) {
    if (tvShowVideos.value[id]) return tvShowVideos.value[id];

    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `${BASE_URL}/tv/${id}/videos?api_key=${API_KEY}&language=en-US`
      );

      if (!response.ok)
        throw new Error(`Failed to fetch TV show videos: ${response.status}`);

      const data = await response.json();

      tvShowVideos.value[id] = data.results;
      return data.results;
    } catch (err) {
      console.error(`Error fetching videos for TV show ${id}:`, err);
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function searchTV(query) {
    if (!query) return [];

    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `${BASE_URL}/search/tv?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
          query
        )}&page=1`
      );

      if (!response.ok)
        throw new Error(`Failed to search TV shows: ${response.status}`);

      const data = await response.json();
      return data.results;
    } catch (err) {
      console.error("Error searching TV shows:", err);
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function getTVRecommendations(id) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `${BASE_URL}/tv/${id}/recommendations?api_key=${API_KEY}&language=en-US&page=1`
      );

      if (!response.ok)
        throw new Error(
          `Failed to fetch TV recommendations: ${response.status}`
        );

      const data = await response.json();
      return data.results;
    } catch (err) {
      console.error(`Error fetching recommendations for TV show ${id}:`, err);
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function getPopularTVShows() {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=1`
      );

      if (!response.ok)
        throw new Error(`Failed to fetch popular TV shows: ${response.status}`);

      const data = await response.json();
      return data.results;
    } catch (err) {
      console.error("Error fetching popular TV shows:", err);
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function getTodaysShows() {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `${BASE_URL}/tv/airing_today?api_key=${API_KEY}&language=en-US&page=1`
      );

      if (!response.ok)
        throw new Error(`Failed to fetch today's TV shows: ${response.status}`);

      const data = await response.json();
      return data.results;
    } catch (err) {
      console.error("Error fetching today's TV shows:", err);
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  }

  function clearCache() {
    tvShowDetails.value = {};
    tvShowVideos.value = {};
  }

  return {
    genres,
    tvShowDetails,
    tvShowVideos,
    loading,
    error,

    fetchGenres,
    getTVShowDetails,
    getTVShowVideos,
    searchTV,
    getTVRecommendations,
    getPopularTVShows,
    getTodaysShows,
    clearCache,
  };
});
