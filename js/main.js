/**
 * main.js
 * * The main entry point for the MovieFlix application.
 * It checks for a valid API key and initializes the main App controller.
 */

import { App } from './App.mjs';
import { API_KEY } from './Config.mjs';
import { showApiKeyError } from './Ui.mjs';

document.addEventListener('DOMContentLoaded', () => {
    // Check if the API key is provided in config.js
    if (!API_KEY) {
        // If not, display an error message and stop initialization
        showApiKeyError();
        return;
    }
    
    // If API key is present, create a new instance of the App
    new App();
});