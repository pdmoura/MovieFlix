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

export function displayMovies(container, movies, genresMap, favoritesSet) {
    if (movies.length === 0) {
        container.innerHTML = '<div class="no-results">No movies found</div>';
        return;
    }
    // We pass genresMap and favoritesSet for later, or simplify for now
    container.innerHTML = movies.map(movie => createMovieCard(movie)).join('');
}