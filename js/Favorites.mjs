const FAVORITES_KEY = 'movieFlixFavorites';

export function loadFavorites() {
    const json = localStorage.getItem(FAVORITES_KEY);
    return json ? new Set(JSON.parse(json)) : new Set();
}

export function addFavorite(movieId) {
    const set = loadFavorites();
    set.add(String(movieId));
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(set)));
}

export function removeFavorite(movieId) {
    const set = loadFavorites();
    set.delete(String(movieId));
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(set)));
}