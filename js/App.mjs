/**
 * app.js
 * * The main application controller.
 * This class manages the application's state, coordinates all user
 * interactions, fetches data via the API module, and updates the
 * display via the UI module.
 */

import * as api from "./Api.mjs";
import * as ui from "./Ui.mjs";
import * as favorites from "./Favorites.mjs";

export class App {
	constructor() {
		// Application state
		this.genresMap = {};
		this.favoritesSet = new Set();
		this.currentFilters = {
			genre: "",
			year: "",
			sort: "",
		};
		this.searchQuery = "";
		this.searchTimeout = null;
		this.currentView = "discover";

		this.init();
	}

	/**
	 * Initializes the application.
	 */
	async init() {
		ui.setupYearFilter();
		this.setupEventListeners();

		this.favoritesSet = favorites.loadFavorites();

		ui.showLoading(
			ui.elements.trendingCarousel,
			"Loading trending movies..."
		);
		ui.showLoading(ui.elements.moviesGrid, "Loading movies...");

		try {
			await this.loadGenres();
			await this.loadTrendingMovies();
			await this.loadDiscoverMovies();
		} catch (error) {
			console.error("Initialization error:", error);
			ui.showError(
				ui.elements.moviesGrid,
				"Failed to initialize app. Please refresh."
			);
		}
	}

	/**
	 * Sets up all event listeners for user interaction.
	 */
	setupEventListeners() {
		// Logo listener to return home
		ui.elements.logo.addEventListener("click", () =>
			this.clearAllFilters()
		);

		ui.elements.searchInput.addEventListener("input", (e) => {
			clearTimeout(this.searchTimeout);
			this.searchTimeout = setTimeout(() => {
				this.handleSearch(e.target.value);
			}, 500);
		});

		ui.elements.genreFilter.addEventListener("change", () =>
			this.handleFilterChange()
		);
		ui.elements.yearFilter.addEventListener("change", () =>
			this.handleFilterChange()
		);
		ui.elements.sortFilter.addEventListener("change", () =>
			this.handleFilterChange()
		);

		ui.elements.clearBtn.addEventListener("click", () =>
			this.clearAllFilters()
		);
		ui.elements.favoritesBtn.addEventListener("click", () =>
			this.showFavorites()
		);

		ui.elements.trendingPrev.addEventListener("click", () =>
			ui.scrollCarousel("prev")
		);
		ui.elements.trendingNext.addEventListener("click", () =>
			ui.scrollCarousel("next")
		);

		// Events for movie cards
		ui.elements.moviesGrid.addEventListener("click", (e) =>
			this.handleGridClick(e)
		);
		ui.elements.trendingCarousel.addEventListener("click", (e) =>
			this.handleGridClick(e)
		);

		// Button event to close the modal
		ui.elements.modalCloseBtn.addEventListener("click", () =>
			ui.hideMovieDetailsModal()
		);
		ui.elements.modalOverlay.addEventListener("click", (e) => {
			// Close if clicking on the overlay
			if (e.target === ui.elements.modalOverlay) {
				ui.hideMovieDetailsModal();
			}
		});

		if (ui.elements.mobileMenuBtn) {
			ui.elements.mobileMenuBtn.addEventListener("click", () => {
				ui.toggleMobileMenu();
			});
		}

		ui.elements.searchInput.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				e.preventDefault();
				ui.elements.searchInput.blur();
				ui.closeMobileMenu();
			}
		});
	}

	/**
	 * Handles clicks within the movie grids (discover and trending).
	 * Uses event delegation to identify what was clicked.
	 * @param {Event} e - The click event.
	 */
	handleGridClick(e) {
		const favBtn = e.target.closest(".favorite-btn");
		const card = e.target.closest(".movie-card, .trending-card");

		if (favBtn) {
			e.stopPropagation(); // Prevent card click from firing
			const movieId = favBtn.dataset.movieId;
			if (movieId) {
				this.toggleFavorite(movieId);
			}
			return;
		}

		if (card) {
			const movieId = card.dataset.movieId;
			if (movieId) {
				this.showMovieDetails(movieId);
			}
		}
	}

	/**
	 * Fetches the genre list, stores it, and populates the genre filter.
	 */
	async loadGenres() {
		try {
			const genres = await api.fetchGenres();
			// Create a map of genre ID -> genre name for easy lookup
			this.genresMap = genres.reduce((acc, genre) => {
				acc[genre.id] = genre.name;
				return acc;
			}, {});
			ui.setupGenreFilter(genres);
		} catch (error) {
			console.error("Error loading genres:", error);
			// Non-critical, app can continue but genres will be missing
		}
	}

	/**
	 * Fetches and displays the top 10 trending movies.
	 */
	async loadTrendingMovies() {
		try {
			const movies = await api.fetchTrendingMovies();
			ui.displayTrendingMovies(movies, this.genresMap, this.favoritesSet);
		} catch (error) {
			console.error("Error loading trending movies:", error);
			ui.showError(
				ui.elements.trendingCarousel,
				"Failed to load trending movies"
			);
		}
	}

	/**
	 * Fetches and displays movies based on current filters (discover mode).
	 */
	async loadDiscoverMovies() {
		this.currentView = "discover";
		ui.showLoading(ui.elements.moviesGrid, "Loading movies...");
		try {
			const movies = await api.fetchDiscoverMovies(this.currentFilters);
			ui.displayMovies(
				ui.elements.moviesGrid,
				movies,
				this.genresMap,
				this.favoritesSet
			);
		} catch (error) {
			console.error("Error loading discover movies:", error);
			ui.showError(ui.elements.moviesGrid, "Failed to load movies");
		}
	}

	/**
	 * Handles the search input logic.
	 * @param {string} query - The user's search query.
	 */
	async handleSearch(query) {
		this.searchQuery = query.trim();

		if (this.searchQuery === "") {
			this.clearAllFilters();
			return;
		}

		this.currentView = "search";
		// Update UI for search results
		ui.updateUIForSearch(this.searchQuery);
		ui.showLoading(
			ui.elements.moviesGrid,
			`Searching for "${this.searchQuery}"...`
		);

		try {
			const movies = await api.fetchSearchMovies(
				this.searchQuery,
				this.currentFilters
			);

			const sortedMovies = this.sortMovies(
				movies,
				this.currentFilters.sort
			);

			ui.displayMovies(
				ui.elements.moviesGrid,
				sortedMovies,
				this.genresMap,
				this.favoritesSet
			);
		} catch (error) {
			console.error("Error searching movies:", error);
			ui.showError(
				ui.elements.moviesGrid,
				"Search failed. Please try again."
			);
		}
	}

	/**
	 * Handles changes from any of the filter dropdowns.
	 */
	handleFilterChange() {
		this.currentFilters = {
			genre: ui.elements.genreFilter.value,
			year: ui.elements.yearFilter.value,
			sort: ui.elements.sortFilter.value,
		};

		const hasFilters = !!(
			this.currentFilters.genre ||
			this.currentFilters.year ||
			this.currentFilters.sort ||
			this.searchQuery
		);
		ui.toggleClearButton(hasFilters);

		if (this.searchQuery) {
			this.currentView = "search";
			this.handleSearch(this.searchQuery);
		} else {
			this.currentView = "discover";
			ui.updateUIDiscoverTitle(hasFilters);
			this.loadDiscoverMovies();
		}
	}

	/**
	 * Resets all filters and the search query, returning to the default discover view.
	 */
	clearAllFilters() {
		this.searchQuery = "";
		this.currentFilters = { genre: "", year: "", sort: "" };
		this.currentView = "discover";

		ui.clearFilters();
		ui.resetUIToDiscover();

		this.loadDiscoverMovies();
	}

	/**
	 * Sorts an array of movie results.
	 * @param {Array} movies - The array of movies to sort.
	 * @param {string} sortBy - The sorting key.
	 * @returns {Array} The sorted array of movies.
	 */
	sortMovies(movies, sortBy) {
		switch (sortBy) {
			case "popularity.desc":
				return movies.sort((a, b) => b.popularity - a.popularity);
			case "vote_average.desc":
				return movies.sort((a, b) => b.vote_average - a.vote_average);
			case "release_date.desc":
				return movies.sort(
					(a, b) =>
						new Date(b.release_date) - new Date(a.release_date)
				);
			case "title.asc":
				return movies.sort((a, b) => a.title.localeCompare(b.title));
			default:
				return movies;
		}
	}

	/**
	 * Toggles a movie's favorite status.
	 * @param {string} movieId - The ID of the movie to toggle.
	 */
	toggleFavorite(movieId) {
		if (this.favoritesSet.has(movieId)) {
			favorites.removeFavorite(movieId);
			this.favoritesSet.delete(movieId);
		} else {
			favorites.addFavorite(movieId);
			this.favoritesSet.add(movieId);
		}

		ui.updateFavoriteButtons(movieId, this.favoritesSet.has(movieId));

		if (this.currentView === "favorites") {
			this.showFavorites();
		}
	}

	/**
	 * Fetches and displays the list of favorited movies.
	 */
	async showFavorites() {
		this.currentView = "favorites";
		ui.updateUIForFavorites();
		ui.showLoading(
			ui.elements.moviesGrid,
			"Loading your favorite movies..."
		);

		if (this.favoritesSet.size === 0) {
			ui.showNoResults(
				ui.elements.moviesGrid,
				"You have no favorites yet",
				"Add some movies to see them here!"
			);
			return;
		}

		try {
			const moviePromises = Array.from(this.favoritesSet).map((id) =>
				api.fetchMovieById(id)
			);
			const favoriteMovies = await Promise.all(moviePromises);

			const sortedMovies = this.sortMovies(
				favoriteMovies,
				this.currentFilters.sort
			);

			ui.displayMovies(
				ui.elements.moviesGrid,
				sortedMovies,
				this.genresMap,
				this.favoritesSet
			);
		} catch (error) {
			console.error("Error loading favorite movies:", error);
			ui.showError(
				ui.elements.moviesGrid,
				"Could not load your favorites."
			);
		}
	}

	/**
	 * Fetches details and videos for a movie and displays the modal.
	 * @param {string} movieId - The ID of the movie to show.
	 */
	async showMovieDetails(movieId) {
		ui.showLoading(
			ui.elements.modalContentContainer,
			"Loading movie details..."
		);
		ui.showMovieDetailsModal();

		try {
			// Fetch details and videos in parallel
			const [details, videosResponse] = await Promise.all([
				api.fetchMovieById(movieId),
				api.fetchMovieVideos(movieId),
			]);

			// Find the official YouTube trailer
			const trailer =
				videosResponse.results.find(
					(video) =>
						video.site === "YouTube" &&
						video.type === "Trailer" &&
						video.official
				) ||
				videosResponse.results.find(
					(video) =>
						video.site === "YouTube" && video.type === "Trailer"
				) ||
				null;

			ui.displayMovieDetails(details, trailer);
		} catch (error) {
			console.error("Error loading movie details:", error);
			ui.showError(
				ui.elements.modalContentContainer,
				"Failed to load movie details."
			);
		}
	}
}
