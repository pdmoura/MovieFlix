# 🎬 MovieFlix - Movie Explorer

**MovieFlix** is a sleek, responsive web application for browsing, searching, and favoriting movies. Built with **pure HTML, CSS, and modern JavaScript (ES Modules)**, it uses **The Movie Database (TMDB) API** to deliver a rich experience.

---

## ✨ Features

- 🎞️ **Discover Movies** – Browse a carousel of trending movies and a grid of discoveries.
- 🔍 **Advanced Search** – Search for any movie available in the TMDB database.
- 🎚️ **Filter & Sort** – Filter by genre, release year, and sort by popularity, rating, or release date.
- 🎥 **Movie Details** – View detailed info, ratings, genres, and watch trailers via YouTube embeds.
- ❤️ **Favorites System** – Add or remove movies from your personal "Favorites" list.
- 💾 **Persistent Storage** – Favorites are saved in your browser’s `localStorage`.
- 📱 **Responsive Design** – A clean, mobile-first UI that looks great on all devices.

---

## 🧰 Tech Stack

| Category | Technology |
|-----------|-------------|
| **Frontend** | HTML5, CSS3 (pure CSS) |
| **JavaScript** | ES6+ (Modules, Fetch API, Async/Await) |
| **API** | [The Movie Database (TMDB)](https://www.themoviedb.org/documentation/api) |
| **Storage** | Browser `localStorage` |

---

## 🚀 Getting Started

### 🔑 Pre-requisites

You’ll need a **free TMDB API key**:

1. Go to [TMDB Sign Up](https://www.themoviedb.org/signup) and create an account.
2. Navigate to your **Account Settings → API**.
3. Request an **API Key (v3 auth)** — approval is usually instant.

---

### ⚙️ Installation Guide

Follow these simple steps to set up **MovieFlix** locally:

#### 1️⃣ Clone the Repository

```bash
# Clone the MovieFlix repository from GitHub
git clone https://github.com/your-username/movieflix.git

# Navigate to the project folder
cd movieflix
```
#### 2️⃣ Add Your TMDB API Key
```bash
# Create a Config.mjs file if it doesn't exist
touch Config.mjs
```
Then open it and paste your TMDB API key:
```bash
// config.js
export const API_KEY = 'YOUR_API_KEY_GOES_HERE';
export const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
```


### 📁 File Structure
```bash 
MovieFlix_Project/
├── index.html             # Main HTML structure
├── css/                   # Styles folder
│   └── styles.css         # Main CSS styles
├── js/                    # JavaScript modules
│   ├── main.js            # Entry point; initializes the app
│   ├── App.mjs             # App controller; handles state & events
│   ├── Api.mjs             # TMDB API communication
│   ├── Ui.mjs              # DOM manipulation and UI updates
│   ├── Favorites.mjs       # localStorage management for favorites
│   └── Config.mjs          # TMDB API key and constants
└── README.md              # Project documentation
```
###  Acknowledgements
This project uses the TMDB API, but it is not endorsed or certified by TMDB.
All movie data and images are provided by [The Movie Database (TMDB).](https://www.themoviedb.org/)
