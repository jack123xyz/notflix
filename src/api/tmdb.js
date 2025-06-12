const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const RATING_FILTER = "&certification_country=US&certification.lte=R";

const filterByBackdropPath = (results) =>
  results.filter((item) => item.backdrop_path);

/**
 * Fetch trending movies, filtered to exclude ratings above R.
 * @returns {Promise<Array>} List of popular movies
 */
export async function fetchTrendingMovies() {
  const res = await fetch(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc${RATING_FILTER}`
  );
  if (!res.ok) throw new Error("Failed to fetch movies");
  const data = await res.json();
  return filterByBackdropPath(data.results);
}

export async function fetchMoviesByGenre(genreId) {
  const res = await fetch(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc${RATING_FILTER}`
  );
  if (!res.ok) throw new Error("Failed to fetch movies");
  const data = await res.json();
  return filterByBackdropPath(data.results);
}

export async function fetchMovieTrailers(movieId) {
  const res = await fetch(
    `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`
  );
  if (!res.ok) throw new Error("Failed to fetch trailers");
  const data = await res.json();

  return data.results.filter(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  );
}

export async function fetchMovieLogos(movieId) {
  const res = await fetch(
    `${BASE_URL}/movie/${movieId}/images?api_key=${API_KEY}&include_image_language=en,null`
  );
  if (!res.ok) throw new Error("Failed to fetch images");
  const data = await res.json();
  const logos = data.logos.filter((l) => l.iso_639_1 === "en") || data.logos;
  return logos.length > 0 ? logos[0].file_path : null;
}

export async function fetchMovieRatings(movieId) {
  try {
    const res = await fetch(
      `${BASE_URL}/movie/${movieId}/release_dates?api_key=${API_KEY}`
    );

    if (!res.ok) {
      console.error("Rating API error:", await res.text());
      return null;
    }

    const data = await res.json();

    const usRelease = data.results.find(
      (country) => country.iso_3166_1 === "US"
    );
    if (
      usRelease &&
      usRelease.release_dates &&
      usRelease.release_dates.length > 0
    ) {
      const certifiedRelease = usRelease.release_dates.find(
        (rd) => rd.certification
      );
      if (certifiedRelease && certifiedRelease.certification) {
        return certifiedRelease.certification;
      }
    }

    for (const country of data.results) {
      if (country.release_dates && country.release_dates.length > 0) {
        const certifiedRelease = country.release_dates.find(
          (rd) => rd.certification
        );
        if (certifiedRelease && certifiedRelease.certification) {
          return certifiedRelease.certification;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching movie rating:", error);
    return null;
  }
}

/**
 * Fetch new releases - movies released in the past 60 days, filtered by rating.
 * @returns {Promise<Array>} List of recent movie releases
 */
export async function fetchNewReleases() {
  const today = new Date();
  const sixtyDaysAgo = new Date(today);
  sixtyDaysAgo.setDate(today.getDate() - 60);

  const fromDate = sixtyDaysAgo.toISOString().split("T")[0];
  const toDate = today.toISOString().split("T")[0];

  const res = await fetch(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_date.gte=${fromDate}&primary_release_date.lte=${toDate}&sort_by=popularity.desc${RATING_FILTER}`
  );
  if (!res.ok) throw new Error("Failed to fetch new releases");
  const data = await res.json();
  return filterByBackdropPath(data.results);
}

/**
 * Fetch upcoming movies with improved error handling and more data, filtered by rating.
 * @returns {Promise<Array>} List of upcoming movies
 */
export async function fetchUpcomingMovies() {
  try {
    console.log("Fetching upcoming movies...");
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 90); // Look ahead 90 days

    const fromDate = today.toISOString().split("T")[0];
    const toDate = futureDate.toISOString().split("T")[0];

    const [page1Res, page2Res] = await Promise.all([
      fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_date.gte=${fromDate}&primary_release_date.lte=${toDate}&sort_by=primary_release_date.asc&page=1${RATING_FILTER}`
      ),
      fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_date.gte=${fromDate}&primary_release_date.lte=${toDate}&sort_by=primary_release_date.asc&page=2${RATING_FILTER}`
      ),
    ]);

    if (!page1Res.ok) {
      console.error("Upcoming Movies Page 1 error:", await page1Res.text());
      throw new Error(`Failed to fetch upcoming movies: ${page1Res.status}`);
    }

    const data1 = await page1Res.json();
    let results = [...data1.results];

    if (page2Res.ok) {
      const data2 = await page2Res.json();

      const existingIds = new Set(results.map((m) => m.id));
      const newMovies = data2.results.filter((m) => !existingIds.has(m.id));
      results = [...results, ...newMovies];
      console.log(`Added ${newMovies.length} more movies from page 2`);
    } else {
      console.warn("Upcoming Movies Page 2 failed:", page2Res.status);
    }

    console.log(`Total upcoming movies fetched: ${results.length}`);

    return filterByBackdropPath(results)
      .filter((movie) => movie.poster_path && movie.release_date)
      .sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
  } catch (error) {
    console.error("Error in fetchUpcomingMovies:", error);
    return [];
  }
}

/**
 * Fetch movies coming out this month (next 30 days)
 * @returns {Promise<Array>} Movies releasing within 30 days
 */
export async function fetchComingThisMonth() {
  try {
    const allUpcoming = await fetchUpcomingMovies();
    const today = new Date();

    console.log("Total upcoming movies found:", allUpcoming.length);

    return allUpcoming.filter((movie) => {
      if (!movie.release_date) return false;
      const releaseDate = new Date(movie.release_date);
      const daysDifference = (releaseDate - today) / (1000 * 60 * 60 * 24);
      return daysDifference > 7 && daysDifference <= 30;
    });
  } catch (error) {
    console.error("Error fetching this month's releases:", error);
    return [];
  }
}

/**
 * Fetch movies coming out next month (30-60 days from now)
 * @returns {Promise<Array>} Movies releasing 30-60 days from now
 */
export async function fetchComingNextMonth() {
  try {
    const today = new Date();

    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const sixtyDaysFromNow = new Date(today);
    sixtyDaysFromNow.setDate(today.getDate() + 60);

    const fromDate = thirtyDaysFromNow.toISOString().split("T")[0];
    const toDate = sixtyDaysFromNow.toISOString().split("T")[0];

    console.log(`Fetching movies from ${fromDate} to ${toDate}`);

    const res = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_date.gte=${fromDate}&primary_release_date.lte=${toDate}&sort_by=primary_release_date.asc®ion=US&with_release_type=3${RATING_FILTER}`
    );

    if (!res.ok) {
      console.error("Coming next month API error:", await res.text());
      throw new Error("Failed to fetch coming next month movies");
    }

    const data = await res.json();
    let results = filterByBackdropPath(data.results);
    if (results.length < 10) {
      const page2Res = await fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_date.gte=${fromDate}&primary_release_date.lte=${toDate}&sort_by=primary_release_date.asc&page=2®ion=US&with_release_type=3${RATING_FILTER}`
      );

      if (page2Res.ok) {
        const page2Data = await page2Res.json();
        results = [...results, ...filterByBackdropPath(page2Data.results)];
        console.log(
          `Added ${page2Data.results.length} more movies from page 2`
        );
      }
    }

    return results.filter((movie) => movie.poster_path);
  } catch (error) {
    console.error("Error fetching next month's releases:", error);
    return [];
  }
}

/**
 * Fetch movies coming out very soon (next 7 days)
 * @returns {Promise<Array>} Movies releasing within a week
 */
export async function fetchComingSoon() {
  try {
    const allUpcoming = await fetchUpcomingMovies();
    const today = new Date();

    return allUpcoming
      .filter((movie) => {
        if (!movie.release_date) return false;
        const releaseDate = new Date(movie.release_date);
        const daysDifference = (releaseDate - today) / (1000 * 60 * 60 * 24);
        return daysDifference >= 0 && daysDifference <= 7;
      })
      .slice(0, 20);
  } catch (error) {
    console.error("Error fetching coming soon releases:", error);
    return [];
  }
}

/**
 * Fetch critically acclaimed movies (high voter average), filtered by rating.
 * @returns {Promise<Array>} List of highly-rated movies
 */
export async function fetchCriticallyAcclaimedMovies() {
  const res = await fetch(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=vote_average.desc&vote_count.gte=3000${RATING_FILTER}`
  );
  if (!res.ok) throw new Error("Failed to fetch critically acclaimed movies");
  const data = await res.json();
  return filterByBackdropPath(data.results);
}

export async function fetchTrendingTVShows() {
  const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`);
  if (!res.ok) throw new Error("Failed to fetch TV shows");
  const data = await res.json();
  return filterByBackdropPath(data.results);
}

export async function fetchTVShowsByGenre(genreId) {
  const res = await fetch(
    `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`
  );
  if (!res.ok) throw new Error("Failed to fetch TV shows");
  const data = await res.json();
  return filterByBackdropPath(data.results);
}

export async function fetchTVShowTrailers(tvId) {
  const res = await fetch(`${BASE_URL}/tv/${tvId}/videos?api_key=${API_KEY}`);
  if (!res.ok) throw new Error("Failed to fetch trailers");
  const data = await res.json();

  return data.results.filter(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  );
}

export async function fetchTVShowSeasonDetails(tvId, seasonNumber) {
  try {
    const res = await fetch(
      `${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`
    );
    if (!res.ok) {
      console.error(`Failed to fetch season ${seasonNumber} for TV ID ${tvId}`);

      return { episodes: [] };
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching TV show season details:", error);
    return { episodes: [] };
  }
}

export async function fetchTVShowLogos(tvId) {
  const res = await fetch(
    `${BASE_URL}/tv/${tvId}/images?api_key=${API_KEY}&include_image_language=en,null`
  );
  if (!res.ok) throw new Error("Failed to fetch images");
  const data = await res.json();

  const logos = data.logos.filter((l) => l.iso_639_1 === "en") || data.logos;
  return logos.length > 0 ? logos[0].file_path : null;
}

export async function fetchTVShowRatings(tvId) {
  try {
    const res = await fetch(
      `${BASE_URL}/tv/${tvId}/content_ratings?api_key=${API_KEY}`
    );

    if (!res.ok) {
      console.error("Rating API error:", await res.text());
      return null;
    }

    const data = await res.json();

    const usRating = data.results.find((rating) => rating.iso_3166_1 === "US");
    if (usRating && usRating.rating) {
      return usRating.rating;
    }

    for (const rating of data.results) {
      if (rating.rating) {
        return rating.rating;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching TV show rating:", error);
    return null;
  }
}

/**
 * Fetch the current top 10 popular movies in the USA, filtered by rating.
 * Note: Uses discover/movie endpoint to allow for rating filters.
 * @returns {Promise<Array>} List of top 10 movies with ranking
 */
export async function fetchTopTenMovies() {
  const res = await fetch(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc®ion=US${RATING_FILTER}`
  );
  if (!res.ok) throw new Error("Failed to fetch top movies");
  const data = await res.json();
  return filterByBackdropPath(data.results)
    .slice(0, 10)
    .map((movie, index) => ({ ...movie, ranking: index + 1 }));
}

/**
 * Fetch the current top 10 TV shows in the USA
 * @returns {Promise<Array>} List of top 10 TV shows with ranking metadata
 */
export async function fetchTopTenTVShows() {
  const res = await fetch(
    `${BASE_URL}/trending/tv/week?api_key=${API_KEY}®ion=US`
  );
  if (!res.ok) throw new Error("Failed to fetch top TV shows");
  const data = await res.json();
  return filterByBackdropPath(data.results)
    .slice(0, 10)
    .map((show, index) => ({ ...show, ranking: index + 1 }));
}

export async function fetchMovieDetails(movieId) {
  const res = await fetch(
    `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,similar,images`
  );
  if (!res.ok)
    throw new Error(`Failed to fetch movie details for ID: ${movieId}`);
  const data = await res.json();
  return data;
}

export async function fetchTVShowDetails(tvId) {
  const res = await fetch(
    `${BASE_URL}/tv/${tvId}?api_key=${API_KEY}&append_to_response=credits,similar,images`
  );
  if (!res.ok)
    throw new Error(`Failed to fetch TV show details for ID: ${tvId}`);
  const data = await res.json();
  return data;
}

export async function fetchMovieCast(movieId) {
  const res = await fetch(
    `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`
  );
  if (!res.ok) throw new Error(`Failed to fetch cast for movie ID: ${movieId}`);
  const data = await res.json();
  return data.cast || [];
}

export async function fetchTVShowCast(tvId) {
  const res = await fetch(`${BASE_URL}/tv/${tvId}/credits?api_key=${API_KEY}`);
  if (!res.ok) throw new Error(`Failed to fetch cast for TV show ID: ${tvId}`);
  const data = await res.json();
  return data.cast || [];
}

export async function fetchSimilarMovies(movieId) {
  const res = await fetch(
    `${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}`
  );
  if (!res.ok)
    throw new Error(`Failed to fetch similar movies for ID: ${movieId}`);
  const data = await res.json();
  return filterByBackdropPath(data.results || []);
}

export async function fetchSimilarTVShows(tvId) {
  const res = await fetch(`${BASE_URL}/tv/${tvId}/similar?api_key=${API_KEY}`);
  if (!res.ok)
    throw new Error(`Failed to fetch similar TV shows for ID: ${tvId}`);
  const data = await res.json();
  return filterByBackdropPath(data.results || []);
}

export const MOVIE_GENRES = {
  ACTION: 28,
  COMEDY: 35,
  HORROR: 27,
  ROMANCE: 10749,
  DOCUMENTARY: 99,
};

export const TV_GENRES = {
  ACTION_ADVENTURE: 10759,
  COMEDY: 35,
  DRAMA: 18,
  REALITY: 10764,
  CRIME: 80,
  DOCUMENTARY: 99,
};

export async function fetchTVShowSeasons(tvId) {
  try {
    const res = await fetch(
      `${BASE_URL}/tv/${tvId}/season/1?api_key=${API_KEY}`
    );
    if (!res.ok) {
      console.error(`Failed to fetch TV show seasons for ID: ${tvId}`);
      return [];
    }
    const data = await res.json();
    return data.episodes || [];
  } catch (error) {
    console.error("Error fetching TV show seasons:", error);
    return [];
  }
}

export async function fetchMovieCredits(movieId) {
  return fetchMovieCast(movieId);
}

export async function fetchTVShowCredits(tvId) {
  return fetchTVShowCast(tvId);
}

export async function searchMulti(query, page = 1) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
        query
      )}&page=${page}&include_adult=false`
    );
    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    const data = await response.json();
    return filterByBackdropPath(
      data.results.filter(
        (item) => item.media_type === "movie" || item.media_type === "tv"
      ) || []
    );
  } catch (error) {
    console.error("Error searching TMDB:", error);
    return [];
  }
}
