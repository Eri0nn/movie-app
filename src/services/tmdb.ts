import axios from "axios";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

export const getImageUrl = (path: string, size: string = "original") =>
  `${IMAGE_BASE_URL}/${size}${path}`;

export const getTrending = (timeWindow: "day" | "week" = "week") =>
  tmdbApi.get(`/trending/movie/${timeWindow}`);

export const getPopular = (page: number = 1) =>
  tmdbApi.get("/movie/popular", { params: { page } });

export const getTopRated = () => tmdbApi.get("/movie/top_rated");

export const getMovie = (id: string) => tmdbApi.get(`/movie/${id}`);

export const searchMovies = async (query: string) => {
  return axios.get(`${BASE_URL}/search/movie`, {
    params: {
      api_key: import.meta.env.VITE_TMDB_API_KEY,
      query,
      language: "en-US",
      include_adult: false,
      page: 1,
    },
  });
};

export const getMovieCredits = (id: string) =>
  tmdbApi.get(`/movie/${id}/credits`);

export const getSimilarMovies = (id: string) =>
  tmdbApi.get(`/movie/${id}/similar`);

export const getMovieVideos = (id: string) =>
  tmdbApi.get(`/movie/${id}/videos`);

export const getRecommendations = (id: string) =>
  tmdbApi.get(`/movie/${id}/recommendations`);
