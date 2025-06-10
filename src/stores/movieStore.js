import { defineStore } from "pinia";
import { fetchMovieTrailers } from "@/api/tmdb";

export const useMovieStore = defineStore("movie", {
  state: () => ({
    genres: null,
    apiKey: import.meta.env.VITE_TMDB_API_KEY,
    baseUrl: "https://api.themoviedb.org/3",
  }),

  actions: {
    async fetchGenres() {
      if (this.genres) return this.genres;

      try {
        const response = await fetch(
          `${this.baseUrl}/genre/movie/list?api_key=${this.apiKey}&language=en-US`
        );
        const data = await response.json();

        this.genres = data.genres.reduce((acc, genre) => {
          acc[genre.id] = genre.name;
          return acc;
        }, {});

        return this.genres;
      } catch (error) {
        console.error("Error fetching genres:", error);
        return null;
      }
    },

    async getMovieVideos(movieId) {
      try {
        const videos = await fetchMovieTrailers(movieId);
        return videos;
      } catch (error) {
        console.error("Error fetching movie videos:", error);
        return [];
      }
    },

    async getMovieDetails(movieId) {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=${this.apiKey}&language=en-US`
        );
        return await response.json();
      } catch (error) {
        console.error("Error fetching movie details:", error);
        return null;
      }
    },
  },
});
