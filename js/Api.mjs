import { API_KEY, BASE_URL } from "./Config.mjs";

export async function fetchTrendingMovies() {
	const url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`;
	const response = await fetch(url);
	const data = await response.json();
	return data.results.slice(0, 10);
}

export async function fetchDiscoverMovies({ genre, year, sort }) {
	let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}`;
	if (genre) url += `&with_genres=${genre}`;
	if (year) url += `&primary_release_year=${year}`;
	if (sort) url += `&sort_by=${sort}`;
	const response = await fetch(url);
	const data = await response.json();
	return data.results;
}
