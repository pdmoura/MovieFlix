import * as ui from './Ui.mjs';
import * as api from './Api.mjs';

export class App {
    constructor() {
        this.searchTimeout = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('searchInput').addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 500);
        });
    }

    async handleSearch(query) {
        if (!query) return;
        const movies = await api.fetchSearchMovies(query, {});
        ui.displayMovies(ui.elements.moviesGrid, movies);
    }
}