import { API_KEY, BASE_URL } from "./Config.mjs";

export async function fetchTrendingMovies() {
	const url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`;
	const response = await fetch(url);
	const data = await response.json();
	return data.results.slice(0, 10);
}
