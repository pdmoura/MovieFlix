import { App } from './App.mjs';
import { API_KEY } from './Config.mjs';
import { showApiKeyError } from './Ui.mjs';

document.addEventListener('DOMContentLoaded', () => {
    if (!API_KEY) {
        showApiKeyError();
        return;
    }
    new App();
});