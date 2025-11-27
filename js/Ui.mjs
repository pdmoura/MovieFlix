/**
 * ui.js
 * * This module is responsible for all DOM manipulation.
 * It selects elements, creates HTML strings, and updates the page.
 * It does not contain any application logic (state management) or API calls.
 */

import { IMAGE_BASE_URL, FALLBACK_IMAGE } from './Config.mjs';

// Centralize all DOM element selections
export const elements = {
    logo: document.getElementById('logo'), // Added logo element
    mainContent: document.getElementById('mainContent'),
    searchInput: document.getElementById('searchInput'),
    genreFilter: document.getElementById('genreFilter'),
    yearFilter: document.getElementById('yearFilter'),
    sortFilter: document.getElementById('sortFilter'),
    clearBtn: document.getElementById('clearBtn'),
    favoritesBtn: document.getElementById('favoritesBtn'),
    trendingSection: document.getElementById('trendingSection'),
    trendingCarousel: document.getElementById('trendingCarousel'),
    trendingPrev: document.getElementById('trendingPrev'),
    trendingNext: document.getElementById('trendingNext'),
    randomSectionTitle: document.getElementById('randomSectionTitle'),
    moviesGrid: document.getElementById('moviesGrid'),
    modalOverlay: document.getElementById('movieDetailsModal'),
    modalContentContainer: document.getElementById('modalContentContainer'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    searchContainer: document.getElementById('searchContainer'),
};

/**
 * SVG icon for the favorite button.
 * @param {boolean} isFavorite - Whether the movie is favorited.
 * @param {string} movieId - The movie ID.
 * @returns {string} HTML string for the SVG icon.
 */
const getFavoriteIcon = (isFavorite, movieId) => `
    <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-movie-id="${movieId}" aria-label="Add to favorites">
        <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
    </button>
`;

/**
 * Creates the HTML for a single trending movie card.
 * @param {object} movie - The movie data.
 * @param {number} rank - The trending rank.
 * @param {object} genresMap - A map of genre IDs to names.
 * @param {Set<string>} favoritesSet - A set of favorite movie IDs.
 * @returns {string} The HTML string for the card.
 */
function createTrendingCard(movie, rank, genresMap, favoritesSet) {

    // CRITICAL PERFORMANCE FIX: Eager load the first image (LCP candidate)
    const isTopItem = rank === 1;
    const loadingStrategy = isTopItem ? 'eager' : 'lazy';
    const fetchPriority = isTopItem ? 'high' : 'auto';

    const posterPath = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : FALLBACK_IMAGE;
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA';
    const genres = movie.genre_ids
        ? movie.genre_ids.slice(0, 2).map(id => genresMap[id]).filter(Boolean).join(', ')
        : 'N/A';
    const isFavorite = favoritesSet.has(String(movie.id));

    return `
        <div class="trending-card base-card" data-movie-id="${movie.id}">
            ${getFavoriteIcon(isFavorite, movie.id)}
            <img src="${posterPath}" alt="${movie.title}" class="movie-poster" 
            width="342" height="513" onerror="this.src='${FALLBACK_IMAGE}'" loading="${loadingStrategy}" fetchpriority="${fetchPriority}">
            <div class="trending-rank">${rank}</div>
            <div class="trending-overlay">
                <div class="trending-title">${movie.title}</div>
                <div class="trending-details">
                    <span class="trending-year">${year}</span>
                    <span class="trending-rating">★ ${rating}</span>
                </div>
                <div class="trending-genres">${genres}</div>
            </div>
        </div>
    `;
}

/**
 * Creates the HTML for a single movie card.
 * @param {object} movie - The movie data.
 * @param {object} genresMap - A map of genre IDs to names.
 * @param {Set<string>} favoritesSet - A set of favorite movie IDs.
 * @returns {string} The HTML string for the card.
 */
function createMovieCard(movie, genresMap, favoritesSet) {
    const posterPath = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : FALLBACK_IMAGE;
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA';
    const description = movie.overview || 'No description available.';
    const genres = (movie.genre_ids || movie.genres?.map(g => g.id))
        ? (movie.genre_ids || movie.genres.map(g => g.id)).slice(0, 2).map(id => genresMap[id]).filter(Boolean).join(', ')
        : 'N/A';
    const isFavorite = favoritesSet.has(String(movie.id));

    return `
        <div class="movie-card base-card" data-movie-id="${movie.id}">
            ${getFavoriteIcon(isFavorite, movie.id)}
            <img src="${posterPath}" alt="${movie.title}" class="movie-poster" loading="lazy"
            width="342" height="513"  onerror="this.src='${FALLBACK_IMAGE}'">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-details">
                    <span class="movie-year">${year}</span>
                    <span class="movie-rating">★ ${rating}</span>
                </div>
                <div class="movie-genres">${genres}</div>
                <div class="movie-description">${description}</div>
            </div>
        </div>
    `;
}

/**
 * Renders a list of movies to the main movie grid.
 * @param {HTMLElement} container - The grid container.
 * @param {Array} movies - The list of movies to display.
 * @param {object} genresMap - A map of genre IDs to names.
 * @param {Set<string>} favoritesSet - A set of favorite movie IDs.
 */
export function displayMovies(container, movies, genresMap, favoritesSet) {
    const validMovies = movies.filter(movie => movie.poster_path);
    if (validMovies.length === 0) {
        showNoResults(container);
        return;
    }
    container.innerHTML = validMovies.map(movie => createMovieCard(movie, genresMap, favoritesSet)).join('');
}

/**
 * Renders a list of trending movies to the carousel.
 * @param {Array} movies - The list of movies to display.
 * @param {object} genresMap - A map of genre IDs to names.
 * @param {Set<string>} favoritesSet - A set of favorite movie IDs.
 */
export function displayTrendingMovies(movies, genresMap, favoritesSet) {
    if (movies.length === 0) {
        elements.trendingCarousel.innerHTML = '<div class="error">No trending movies found.</div>';
        return;
    }
    elements.trendingCarousel.innerHTML = movies.map((movie, index) => 
        createTrendingCard(movie, index + 1, genresMap, favoritesSet)
    ).join('');
}

/**
 * Populates the genre filter dropdown.
 * @param {Array} genres - The list of genre objects.
 */
export function setupGenreFilter(genres) {
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre.id;
        option.textContent = genre.name;
        elements.genreFilter.appendChild(option);
    });
}

/**
 * Populates the year filter dropdown.
 */
export function setupYearFilter() {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1990; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        elements.yearFilter.appendChild(option);
    }
}

/**
 * Displays a loading message in a container.
 * @param {HTMLElement} container - The container element.
 * @param {string} message - The message to display.
 */
export function showLoading(container, message) {
    container.innerHTML = `<div class="loading">${message}</div>`;
}

/**
 * Displays an error message in a container.
 * @param {HTMLElement} container - The container element.
 * @param {string} message - The message to display.
 */
export function showError(container, message) {
    container.innerHTML = `<div class="error">${message}</div>`;
}

/**
 * Displays a "no results" message in a container.
 * @param {HTMLElement} container - The container element.
 * @param {string} [title='🔍 No movies found'] - The main title.
 * @param {string} [text='Try adjusting your search criteria or filters'] - The subtext.
 */
export function showNoResults(container, title = '🔍 No movies found', text = 'Try adjusting your search criteria or filters') {
    container.innerHTML = `
        <div class="no-results">
            <h2>${title}</h2>
            <p>${text}</p>
        </div>
    `;
}

/**
 * Displays an error if the API key is missing.
 */
export function showApiKeyError() {
    elements.mainContent.innerHTML = `
        <div class="error" style="padding: 60px 20px; text-align: center;">
            <h2>⚠️ API Key Required</h2>
            <p>To use this app, you need to:</p>
            <ol style="text-align: left; max-width: 600px; margin: 20px auto; list-style-position: inside;">
                <li>Go to <a href="https://www.themoviedb.org/settings/api" target="_blank" style="color: #e50914;">https://www.themoviedb.org/settings/api</a></li>
                <li>Create a free TMDB account and get your API key</li>
                <li>Add your key to the <strong>config.js</strong> file</li>
            </ol>
            <p style="margin-top: 30px; color: #999;">Once you add your API key, the app will work!</p>
        </div>
    `;
    // Hide the header as it's not functional
    document.querySelector('.header').style.display = 'none';
}

/**
 * Updates the UI to show search results (hides trending, changes title).
 * @param {string} query - The search query.
 */
export function updateUIForSearch(query) {
    elements.trendingSection.style.display = 'none';
    elements.randomSectionTitle.textContent = `🔍 Search Results for "${query}"`;
    elements.clearBtn.classList.add('show');
}

/**
 * Updates the UI to show the "My Favorites" view.
 */
export function updateUIForFavorites() {
    elements.trendingSection.style.display = 'none';
    elements.randomSectionTitle.textContent = '❤️ My Favorite Movies';
    elements.clearBtn.classList.add('show'); // Show clear to allow user to exit
}

/**
 * Updates the Discover section title based on filters.
 * @param {boolean} hasFilters - Whether any filters are active.
 */
export function updateUIDiscoverTitle(hasFilters) {
    if (hasFilters) {
        elements.randomSectionTitle.textContent = '🎬 Filtered Movies';
        elements.trendingSection.style.display = 'none';
        elements.clearBtn.classList.add('show');
    } else {
        elements.randomSectionTitle.textContent = '🎬 Discover Movies';
        elements.trendingSection.style.display = 'block';
        elements.clearBtn.classList.remove('show');
    }
}

/**
 * Resets the UI back to the default "discover" state.
 */
export function resetUIToDiscover() {
    elements.trendingSection.style.display = 'block';
    elements.randomSectionTitle.textContent = '🎬 Discover Movies';
    elements.clearBtn.classList.remove('show');
}

/**
 * Resets the filter input fields to their default values.
 */
export function clearFilters() {
    elements.searchInput.value = '';
    elements.genreFilter.value = '';
    elements.yearFilter.value = '';
    elements.sortFilter.value = '';
}

/**
 * Toggles the visibility of the "Clear All" button.
 * @param {boolean} show - Whether to show the button.
 */
export function toggleClearButton(show) {
    elements.clearBtn.classList.toggle('show', show);
}

/**
 * Scrolls the trending carousel.
 * @param {string} direction - 'prev' or 'next'.
 */
export function scrollCarousel(direction) {
    const scrollAmount = 320; // Width of a card + gap
    if (direction === 'prev') {
        elements.trendingCarousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        elements.trendingCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

/**
 * Updates all favorite buttons for a specific movie ID.
 * @param {string} movieId - The ID of the movie.
 * @param {boolean} isFavorite - The new favorite status.
 */
export function updateFavoriteButtons(movieId, isFavorite) {
    const buttons = document.querySelectorAll(`.favorite-btn[data-movie-id="${movieId}"]`);
    buttons.forEach(btn => {
        btn.classList.toggle('active', isFavorite);
    });
}

/**
 * Shows the movie details modal.
 */
export function showMovieDetailsModal() {
    elements.modalOverlay.style.display = 'flex';
    document.body.classList.add('no-scroll');
}

/**
 * Hides the movie details modal and stops any playing video.
 */
export function hideMovieDetailsModal() {
    elements.modalOverlay.style.display = 'none';
    // Clear content to stop video from playing
    elements.modalContentContainer.innerHTML = '';
    document.body.classList.remove('no-scroll');
}

/**
 * Injects the movie details content into the modal.
 * @param {object} movie - The full movie details.
 * @param {object | null} trailer - The trailer video object, or null.
 */
export function displayMovieDetails(movie, trailer) {
    const posterPath = movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : FALLBACK_IMAGE;
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA';
    const genres = movie.genres.map(g => g.name).join(', ');
    
    let trailerHtml = '';
    if (trailer && trailer.key) {
        trailerHtml = `
            <div class="modal-trailer-container">
                <iframe 
                    src="https://www.youtube.com/embed/${trailer.key}" 
                    title="${trailer.name}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
    } else {
        trailerHtml = `<div class="modal-no-trailer">No trailer available</div>`;
    }
    
    const modalContent = `
        <div class="modal-header">
            <img src="${posterPath}" alt="${movie.title}" class="modal-poster" onerror="this.src='${FALLBACK_IMAGE}'">
            <div class="modal-poster-overlay"></div>
            <h2 class="modal-title">${movie.title}</h2>
        </div>
        <div class="modal-body">
            <div class="modal-details">
                <span class="modal-rating">★ ${rating}</span>
                <span>•</span>
                <span class="modal-year">${year}</span>
                <span>•</span>
                <span class="modal-genres">${genres}</span>
            </div>
            <p class="modal-overview">${movie.overview || 'No description available.'}</p>
            <h3>Trailer</h3>
            ${trailerHtml}
        </div>
    `;
    elements.modalContentContainer.innerHTML = modalContent;
}

export function toggleMobileMenu() {
    elements.searchContainer.classList.toggle('active');
    elements.mobileMenuBtn.classList.toggle('active');
}

export function closeMobileMenu() {
    if (elements.searchContainer.classList.contains('active')) {
        elements.searchContainer.classList.remove('active');
        elements.mobileMenuBtn.classList.remove('active');
    }
}