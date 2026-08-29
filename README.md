<div align="center">
  <img src="docs/CircularLogoFinalLightMode.png" alt="Museek Logo" width="120" />
  <h1>Museek</h1>
  <p><strong>A Full-Stack Music Streaming Web Application</strong></p>

  [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Spotify API](https://img.shields.io/badge/Spotify-API-1DB954?logo=spotify&logoColor=white)](https://developer.spotify.com/)
  [![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

  [Live Demo](https://aayush14shah.github.io/musicStreaming-Museek/) &nbsp;·&nbsp; [Report Bug](https://github.com/Aayush14Shah/musicStreaming-Museek/issues) &nbsp;·&nbsp; [Request Feature](https://github.com/Aayush14Shah/musicStreaming-Museek/issues)
</div>

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [API Overview](#api-overview)
- [Admin Panel](#admin-panel)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## About the Project

**Museek** is a feature-rich, full-stack music streaming web application that brings together music from multiple sources — Spotify, Jamendo, and custom uploaded tracks — into one seamless experience. Users can discover new music, create and manage playlists, like songs, and enjoy a beautifully designed player interface with both India and International content modes.

The platform is backed by a Node.js/Express REST API with MongoDB Atlas for data persistence and integrates with the Spotify Web API for metadata, artist information, and track search.

---

## Features

### 🎵 User Features

- **Multi-Source Music Streaming** — Stream music from Spotify previews, Jamendo's royalty-free library, and admin-uploaded custom tracks
- **India / International Modes** — Toggle between curated content modes for regional and global music discovery
- **Real-Time Song Search** — Search across Spotify's catalogue and the local custom song database simultaneously
- **Genre Discovery** — Browse tracks by genre with a dynamic genre browser
- **Hero Banner** — Featured playlists and tracks showcased prominently on the home page
- **Playlist Management** — Create, view, and manage personal playlists; add and remove songs with ease
- **Liked Songs** — Like and collect favourite tracks, accessible at any time from the sidebar
- **Now Playing Sidebar** — Persistent sidebar displaying the currently playing track details
- **Music Player** — Fully featured audio player with play/pause, skip, seek, volume control, and a progress bar
- **User Authentication** — Register, login, forgot password, and OTP-based password reset via email
- **Music Preferences** — Set favourite artists and preferred languages during and after onboarding
- **User Profile** — View and update personal profile details and listening history
- **Account Settings** — Manage password, theme, language preferences, and account information
- **Spotify OAuth** — Connect a Spotify account for enriched artist and track data
- **Responsive Layout** — Fully responsive three-panel design with a left sidebar, main content area, and now-playing panel

### 🛡️ Admin Features

- **Admin Dashboard** — At-a-glance overview of total users, active admins, total songs, and cumulative listening hours
- **Manage Users** — View, search, activate/deactivate, and edit all user accounts
- **Manage Admins** — Add, edit, and remove admin accounts with role-based access
- **Song Management** — Upload custom songs (audio file + cover image), edit metadata, toggle publish/draft status, and soft-delete tracks
- **Analytics** — Visual charts for genre distribution, song status breakdown, and platform activity trends
- **Admin Settings** — Control global platform settings including new user registration
- **Registration Control** — Enable or disable new user registrations platform-wide from the admin panel

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **React Router DOM v7** | Client-side routing |
| **Tailwind CSS 3** | Utility-first styling |
| **Lightswind** | UI components / specific tailored styling |
| **Material UI (MUI) v7** | UI component library |
| **Lucide React** | Icon set |
| **Axios** | HTTP client |
| **Chart.js + react-chartjs-2** | Analytics charts |
| **React Select** | Custom select inputs |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server (ES Modules) |
| **MongoDB Atlas + Mongoose** | Database and ODM |
| **Multer** | Audio and image file upload handling |
| **Nodemailer** | OTP email delivery |
| **Spotify Web API Node** | Spotify API integration |
| **yt-dlp-exec & yt-search** | YouTube audio extraction and search |
| **Jamendo API** | Royalty-free music streaming |
| **dotenv** | Environment variable management |
| **nodemon** | Development auto-restart |

---

## Project Structure

```
musicStreaming-Museek/
├── museek-backend/              # Node.js Express backend
│   ├── config/
│   │   └── db.js                # MongoDB connection setup
│   ├── models/
│   │   ├── Register_user.js     # User schema (name, email, password, preferences)
│   │   ├── admin.js             # Admin schema
│   │   ├── CustomSong.js        # Uploaded song schema (audio, cover, metadata)
│   │   ├── Like.js              # Liked songs schema
│   │   ├── Playlist.js          # Playlist schema
│   │   └── PlaylistSong.js      # Playlist–song relationship schema
│   ├── routes/
│   │   ├── auth.js              # Auth routes (register, login, OTP, password reset)
│   │   ├── spotify.js           # Spotify API proxy (artists, tracks, search)
│   │   └── spotifyAuth.js       # Spotify OAuth flow
│   ├── uploads/                 # Auto-created directory for file uploads
│   │   ├── audio/               # Uploaded audio files
│   │   └── images/              # Uploaded cover images
│   ├── server.js                # Main Express server with all API route definitions
│   ├── .env                     # Environment variables (not committed to version control)
│   └── package.json
│
├── src/                         # React frontend source
│   ├── Component/
│   │   ├── homePage/            # Core home page components
│   │   │   ├── Home.jsx         # Main home page orchestrator
│   │   │   ├── Navbar.jsx       # Top navigation with search and mode toggle
│   │   │   ├── LeftSidebar.jsx  # Left navigation (playlists, liked songs)
│   │   │   ├── MusicPlayer.jsx  # Bottom audio player bar
│   │   │   ├── NowPlayingSidebar.jsx # Right now-playing details panel
│   │   │   ├── HeroBanner.jsx   # Featured content hero section
│   │   │   ├── TrackList.jsx    # Track listing component
│   │   │   ├── CarouselPlaylistRow.jsx
│   │   │   ├── CarouselTrackRow.jsx
│   │   │   ├── Genres.jsx
│   │   │   ├── LikedSongs.jsx
│   │   │   └── PlaylistRow.jsx
│   │   ├── AdminSide/           # Admin panel components
│   │   │   ├── Dashboard.jsx    # Admin overview dashboard
│   │   │   ├── ManageUser.jsx   # User management table
│   │   │   ├── ManageAdmins.jsx # Admin management
│   │   │   ├── ManageSongs.jsx  # Song library management
│   │   │   ├── AddSong.jsx      # Song upload form
│   │   │   ├── Analytics.jsx    # Charts and statistics
│   │   │   └── Settings.jsx     # Global platform settings
│   │   ├── CustomSongs/         # Custom uploaded songs feature
│   │   │   ├── CustomSongsSection.jsx
│   │   │   └── CustomAudioPlayer.jsx
│   │   ├── Playlists/           # User playlist management
│   │   │   ├── PlaylistView.jsx
│   │   │   └── AddToPlaylistModal.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Forgot.jsx
│   │   ├── Preferences.jsx
│   │   ├── UserProfile.jsx
│   │   ├── Settings.jsx
│   │   └── SpotifyAuthSuccess.jsx
│   ├── hooks/                   # Custom React hooks
│   ├── utils/                   # Utility/helper functions
│   ├── App.js                   # Root component with route definitions
│   └── index.js                 # React application entry point
│
├── public/                      # Static public assets
├── docs/                        # Documentation assets and project logo
├── tailwind.config.js           # Tailwind CSS configuration
├── package.json                 # Frontend dependencies and scripts
└── README.md
```

---

## Getting Started

### Prerequisites

Ensure the following are installed on your system:

- **Node.js** v18 or higher
- **npm** v9 or higher
- A **MongoDB Atlas** account (or a local MongoDB instance)
- **Spotify Developer** credentials — [Create an app](https://developer.spotify.com/dashboard)
- **Jamendo API** Client ID — [Register for free](https://developer.jamendo.com/v3.0)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Aayush14Shah/musicStreaming-Museek.git
cd musicStreaming-Museek
```

**2. Install frontend dependencies**

```bash
npm install
```

**3. Install backend dependencies**

```bash
cd museek-backend
npm install
cd ..
```

### Environment Variables

Create a `.env` file inside the `museek-backend/` directory with the following content:

```env
# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/Museek?retryWrites=true&w=majority&appName=Cluster0

# Spotify API
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:5000/auth/spotify/callback

# Jamendo API
JAMENDO_CLIENT_ID=your_jamendo_client_id
JAMENDO_CLIENT_SECRET=your_jamendo_client_secret

# Server
PORT=5000

# Email — used for OTP delivery via Nodemailer
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> **Gmail Note:** Use a [Google App Password](https://support.google.com/accounts/answer/185833) for `EMAIL_PASS` when 2-Step Verification is enabled on your account.

### Running the Application

**Start the backend server** (from the `museek-backend/` directory):

```bash
cd museek-backend
npm run dev      # Development mode with nodemon (auto-restart)
# or
npm start        # Production mode
```

The backend API will be available at `http://localhost:5000`.

**Start the frontend** (from the root directory, in a separate terminal):

```bash
npm start
```

The React app will open at `http://localhost:3000`.

---

## API Overview

The backend exposes REST API endpoints under the `/api` namespace. Key endpoint groups:

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | Register a new user |
| `/api/auth/login` | POST | Login for users and admins |
| `/api/auth/send-otp` | POST | Send OTP to email |
| `/api/auth/verify-otp` | POST | Verify submitted OTP |
| `/api/auth/forgot-password` | POST | Initiate password reset flow |
| `/api/auth/reset-password` | POST | Complete reset with OTP verification |
| `/api/jamendo/tracks` | GET | Fetch royalty-free tracks from Jamendo |
| `/api/custom-songs` | GET | List all custom songs (admin, paginated) |
| `/api/custom-songs` | POST | Upload a new custom song (multipart: audio + cover) |
| `/api/custom-songs/:id` | GET | Fetch a single custom song by ID |
| `/api/custom-songs/:id` | PUT | Update custom song metadata |
| `/api/custom-songs/:id/toggle-status` | PATCH | Activate or deactivate a song |
| `/api/custom-songs/stats/overview` | GET | Song statistics for the admin dashboard |
| `/api/songs/custom` | GET | Public listing of all published custom songs |
| `/api/songs/custom/stream/:id` | GET | Stream a custom song's audio file |
| `/api/spotify/popular-artists` | GET | Fetch popular artists via Spotify API |
| `/api/spotify/search-tracks` | GET | Search for tracks on Spotify |
| `/api/spotify/track` | GET | Get single track details from Spotify |
| `/api/users` | GET | List all registered users (admin) |
| `/api/admins` | GET | List all admin accounts (admin) |
| `/api/listening-hours/total` | GET | Get total platform listening hours |

> Uploaded audio and cover image files are stored in `museek-backend/uploads/` and served as static files at `http://localhost:5000/uploads/`.

---

## Admin Panel

The admin panel is accessible at `/admin/dashboard` after logging in with an admin-role account.

| Route | Description |
|---|---|
| `/admin/dashboard` | Overview stats: users, admins, songs, and listening hours |
| `/admin/manageUser` | View, search, edit, activate, or deactivate user accounts |
| `/admin/manageAdmin` | Add, edit, and remove admin accounts |
| `/admin/songs` | Browse, search, filter, and manage uploaded songs |
| `/admin/songs/add` | Upload a new custom song with audio file and cover image |
| `/admin/analytics` | Visual charts: genre breakdown, song statuses, user trends |
| `/admin/settings` | Global settings (e.g., enable/disable new user registration) |

---

## Available Scripts

### Frontend (root directory)

| Script | Description |
|---|---|
| `npm start` | Run the React app in development mode at `http://localhost:3000` |
| `npm test` | Launch the test runner in interactive watch mode |
| `npm run build` | Create an optimised production build in the `build/` folder |
| `npm run deploy` | Build and publish to GitHub Pages |

### Backend (`museek-backend/` directory)

| Script | Description |
|---|---|
| `npm start` | Start the Express server with Node.js |
| `npm run dev` | Start the server with nodemon (restarts on file changes) |

---

## Deployment

The frontend is configured for **GitHub Pages** deployment via the `gh-pages` package.

```bash
npm run deploy
```

This automatically runs `npm run build` first, then pushes the `build/` folder to the `gh-pages` branch.

**Live application:** [https://aayush14shah.github.io/musicStreaming-Museek/](https://aayush14shah.github.io/musicStreaming-Museek/)

> For production backend deployment, platforms such as **Railway**, **Render**, or **Heroku** are recommended. Ensure all environment variables are configured in the hosting platform's settings dashboard.

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/Aayush14Shah">Aayush Shah</a></p>
</div>
