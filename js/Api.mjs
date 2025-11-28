/**
 * Api.mjs
 * * This module handles all API requests to The Movie Database (TMDB).
 * * It includes LOCALSTORAGE CACHING to reduce API calls.
 */

import { API_KEY, BASE_URL } from "./Config.mjs";

/**
 * ------------------------------------------------------------------
 * CACHING LOGIC
 * ------------------------------------------------------------------
 */

/**
 * Fetches data from a URL with caching in localStorage.
 *
 * @param {string} cacheKey The key to use for storing/retrieving from localStorage.
 * @param {string} url The URL to fetch from if the cache is stale or empty.
 * @param {number} cacheDurationInHours How many hours the cache should be valid for.
 * @returns {Promise<any>} A promise that resolves with the data.
 */
async function fetchWithCache(cacheKey, url, cacheDurationInHours) {
	const cacheDuration = cacheDurationInHours * 60 * 60 * 1000;

	// Checking localStorage for existing cached data
	const cachedItemString = localStorage.getItem(cacheKey);

	if (cachedItemString) {
		try {
			const cachedItem = JSON.parse(cachedItemString);
			const now = Date.now();

			// Check if the cache is still "fresh"
			if (now - cachedItem.timestamp < cacheDuration) {
				// console.log(`Using fresh cached data for: ${cacheKey}`);
				return cachedItem.data;
			} else {
				// console.log(`Cache is stale for: ${cacheKey}`);
				localStorage.removeItem(cacheKey);
			}
		} catch (e) {
			// If JSON parse fails, ignore cache and fetch new
			console.warn("Error parsing cache, fetching new data");
		}
	}

	// No cache or stale cache: Fetch new data
	// console.log(`Fetching new data from API for: ${cacheKey}`);

	const response = await fetch(url);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(
			errorData.status_message || `HTTP error! status: ${response.status}`
		);
	}

	const data = await response.json();

	// Save the new data and a new timestamp to localStorage
	try {
		const itemToCache = {
			data: data,
			timestamp: Date.now(),
		};
		localStorage.setItem(cacheKey, JSON.stringify(itemToCache));
	} catch (e) {
		console.warn("Quota exceeded or error saving to localStorage");
	}

	return data;
}

/**
 * ------------------------------------------------------------------
 * API ENDPOINTS
 * ------------------------------------------------------------------
 */

/**
 * Fetches the list of movie genres.
 * CACHED: 24 Hours
 */
export async function fetchGenres() {
	const url = `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`;
	const data = await fetchWithCache("tmdb_genres", url, 24);
	return data.genres;
}

/**
 * Fetches the top 10 trending movies for the week.
 * CACHED: 1 Hour
 */
export async function fetchTrendingMovies() {
	const url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`;
	const data = await fetchWithCache("tmdb_trending", url, 1);
	return data.results.slice(0, 10);
}

/**
 * Fetches the full details for a single movie.
 * CACHED: 24 Hours
 */
export async function fetchMovieById(movieId) {
	const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`;
	return fetchWithCache(`tmdb_movie_${movieId}`, url, 24);
}

/**
 * Fetches the video data (trailers, teasers) for a single movie.
 * CACHED: 24 Hours
 */
export async function fetchMovieVideos(movieId) {
	const url = `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`;
	return fetchWithCache(`tmdb_movie_${movieId}_videos`, url, 24);
}

/**
 * Fetches movies from the "discover" endpoint based on filters.
 * NOT CACHED
 */
export async function fetchDiscoverMovies({ genre, year, sort }) {
	const page =
		!genre && !year && !sort ? Math.floor(Math.random() * 10) + 1 : 1;

	let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${page}`;
	if (genre) url += `&with_genres=${genre}`;
	if (year) url += `&primary_release_year=${year}`;
	if (sort) url += `&sort_by=${sort}`;

	// I used direct fetch here because caching random pages or complex filters fills storage too fast
	return fetchDirect(url);
}

/**
 * Fetches movies from the "search" endpoint.
 * NOT CACHED
 */
export async function fetchSearchMovies(query, { year }) {
	let url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
		query
	)}&page=1`;
	if (year) url += `&primary_release_year=${year}`;

	return fetchDirect(url);
}

/**
 * Internal helper for non-cached requests (Discover/Search)
 */
async function fetchDirect(url) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const data = await response.json();
	return data.results;
}
