// backend/server.js
import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import os from "os";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import spotifyAuthRouter from "./routes/spotifyAuth.js";
import spotifyRoutes from "./routes/spotify.js";
import User from "./models/Register_user.js";

dotenv.config();
await connectDB();

// Initializing app
const app = express();

app.use(cors()); // lets your React app call this API
app.use(express.json()); // parse JSON bodies if you send POST/PUT later

console.log("CLIENT ID:", process.env.SPOTIFY_CLIENT_ID);
console.log("CLIENT SECRET:", process.env.SPOTIFY_CLIENT_SECRET);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Museek API. Use /api endpoints like /api/new-releases.' });
});

/**
 * getAppToken()
 * - Gets an app-level access token from Spotify (Client Credentials Flow).
 * - Returns an object like: { access_token: "...", token_type: "Bearer", expires_in: 3600 }
 */

async function getAppToken(params) {
  const now = Date.now();
  if (tokenCache.access_token && tokenCache.expires_at > now + 60000) {
    return { access_token: tokenCache.access_token };
  }
  // 1) body must be x-www-form-urlencoded for Spotify's token endpoint
  const body = new URLSearchParams({grant_type: "client_credentials"})

  // 2) Build the "Basic base64(clientId:clientSecret)" header
  const basic = Buffer
  .from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET)
  .toString("base64")

  //  axios.post(url, data, config)
  /* 
    url: String.
    data: Body (here, URLSearchParams).
    config.headers: Object with HTTP headers.
  */
  const {data} = await axios.post(
    "https://accounts.spotify.com/api/token",
    body, // <- URLSearchParams instance is auto-encoded as form data
    {
      headers: {
        "Authorization": `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
    }
  )
  tokenCache = {
    access_token: data.access_token,
    expires_at: now + (data.expires_in * 1000),
  };
  return { access_token: data.access_token }; // includes access_token and expires_in
}

// My comment: Adding token caching to reduce frequent token requests and improve performance.
let tokenCache = {
  access_token: null,
  expires_at: null,
};


/**
 * GET /api/new-releases
 * Calls Spotify's "Browse New Releases" with an app token.
 * Query params supported: ?country=IN&limit=12
 */
// Personalized playlists by user
app.get("/api/user-playlists", async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "userId query required" });
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const { favoriteArtists = [], languages = [] } = user;
    if (!favoriteArtists.length) return res.json({ playlists: [] });

    const { access_token } = await getAppToken();

    const playlists = [];
    for (const artist of favoriteArtists) {
      const { data } = await axios.get("https://api.spotify.com/v1/search", {
        headers: { Authorization: `Bearer ${access_token}` },
        params: {
          q: artist,
          type: "playlist",
          limit: parseInt(req.query.limit || "5", 10),
        },
      });
      (data.playlists?.items || []).forEach((pl) => {
        if (pl && pl.id) playlists.push(pl);
      });
    }
    // deduplicate by id
    const unique = Object.values(
      playlists.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {})
    );

    res.json({ playlists: unique });
  } catch (error) {
    const status = error.response?.status || 500;
    const payload = error.response?.data || { message: error.message };
    res.status(status).json({ error: payload });
  }
});

// Individual track details endpoint with guaranteed fallback preview
app.get("/api/spotify/track", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const trackId = req.query.trackId;
    const market = req.query.market || "US";
    
    if (!trackId) {
      return res.status(400).json({ error: "trackId query parameter required" });
    }

    console.log(`🎵 Fetching track details for: ${trackId}`);

    const { data } = await axios.get(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { market },
      }
    );

    console.log(`📊 Track "${data.name}" original preview: ${data.preview_url || 'NONE'}`);

    // Only return tracks with actual Spotify preview URLs
    if (!data.preview_url || data.preview_url === null || data.preview_url === 'undefined') {
      console.log(`🔄 No Spotify preview for: ${data.name} by ${data.artists?.[0]?.name}`);
      
      // Try alternative preview sources from different markets
      let alternativePreview = null;
      
      try {
        console.log(`🌍 Trying different markets for: ${data.name}`);
        const markets = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE'];
        
        for (const market of markets) {
          if (market === (req.query.market || "US")) continue; // Skip already tried market
          
          const { data: altData } = await axios.get(
            `https://api.spotify.com/v1/tracks/${trackId}`,
            {
              headers: { Authorization: `Bearer ${access_token}` },
              params: { market },
            }
          );
          
          if (altData.preview_url) {
            console.log(`✅ Found preview in ${market} market: ${altData.preview_url}`);
            alternativePreview = altData.preview_url;
            data.preview_url = alternativePreview;
            data.fallback_preview = false;
            data.alternative_market = market;
            break;
          }
        }
      } catch (marketError) {
        console.log(`❌ Market search failed:`, marketError.message);
      }
      
      // If no preview found in any market, return error
      if (!alternativePreview) {
        console.log(`❌ No preview available in any market for: ${data.name}`);
        return res.status(404).json({ 
          error: 'No preview available for this track',
          track: {
            id: data.id,
            name: data.name,
            artists: data.artists
          }
        });
      }
    } else {
      data.fallback_preview = false;
      console.log(`✅ Using original Spotify preview: ${data.preview_url}`);
    }

    // Final verification
    console.log(`📤 Final response for "${data.name}":`, {
      preview_url: data.preview_url,
      fallback_preview: data.fallback_preview,
      url_type: typeof data.preview_url
    });

    res.json(data);
  } catch (error) {
    console.error(`❌ Error fetching track ${req.query.trackId}:`, error.message);
    
    // Return error instead of fallback audio
    res.status(500).json({ 
      error: 'Failed to fetch track details from Spotify',
      trackId: req.query.trackId 
    });
  }
});

// Helper function to generate fallback preview with more variety
function generateFallbackPreview(trackData) {
  // Collection of diverse royalty-free preview tracks categorized by mood/genre
  const fallbackTracks = {
    // Upbeat/Pop tracks
    upbeat: [
      "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
      "https://sample-videos.com/zip/10/mp3/SampleAudio_0.4mb_mp3.mp3"
    ],
    // Calm/Acoustic tracks  
    calm: [
      "https://file-examples.com/storage/fe68c1b7c1a9d6c2b2d3b9c/2017/11/file_example_MP3_700KB.mp3",
      "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
    ],
    // Electronic/Dance
    electronic: [
      "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"
    ],
    // Default fallbacks
    default: [
      "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
      "https://sample-videos.com/zip/10/mp3/SampleAudio_0.4mb_mp3.mp3",
      "https://file-examples.com/storage/fe68c1b7c1a9d6c2b2d3b9c/2017/11/file_example_MP3_700KB.mp3"
    ]
  };
  
  // Try to categorize based on track name/artist
  const trackName = (trackData.name || '').toLowerCase();
  const artistName = (trackData.artists?.[0]?.name || '').toLowerCase();
  const searchText = `${trackName} ${artistName}`;
  
  let category = 'default';
  if (searchText.includes('dance') || searchText.includes('electronic') || searchText.includes('edm')) {
    category = 'electronic';
  } else if (searchText.includes('calm') || searchText.includes('acoustic') || searchText.includes('chill')) {
    category = 'calm';
  } else if (searchText.includes('pop') || searchText.includes('upbeat') || searchText.includes('happy')) {
    category = 'upbeat';
  }
  
  const selectedTracks = fallbackTracks[category] || fallbackTracks.default;
  
  // Use track ID to consistently assign the same fallback
  const trackId = trackData.id || 'default';
  let hash = 0;
  for (let i = 0; i < trackId.length; i++) {
    const char = trackId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % selectedTracks.length;
  
  console.log(`🎲 Fallback for "${trackData.name}" (${category}): ${selectedTracks[index]}`);
  return selectedTracks[index];
}

// app.get(path, handler)
app.get("/api/new-releases", async(req, res) => {
  try {
    // 1) Get a fresh token (we’ll add caching in Option B)
    const {access_token} = await getAppToken();

    // 2) Build optional query params for Spotify
    const country = req.query.country || "IN";
    const limit = parseInt(req.query.limit || "12", 10)

    // 3) Call Spotify Web API with the Bearer token || axios.get(url, config)
    /* 
    config.headers.Authorization = 'Bearer <token>' is required for Spotify.
    config.params is an object that axios turns into ?key=value query string.
    */
    const {data} = await axios.get(
      "https://api.spotify.com/v1/browse/new-releases",
      {
        headers: {Authorization: `Bearer ${access_token}`},
        params: {country, limit},  // axios turns this into ?country=IN&limit=12
      }
    )

    // 4) Send the Spotify JSON straight back to your React app
    res.json(data);
  } catch (error) {
    // Helpful error reporting
    const status = error.response?.status || 500;
    const payload = error.response?.data || {message: error.message};
    res.status(status).json({error: payload});
  }
})

/**
 * GET /api/featured-playlists
 * Calls Spotify's "Featured Playlists" endpoint.
 * Query params supported: ?country=IN&limit=12&locale=en_US
 */
app.get("/api/featured-playlists", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const country = req.query.country || "IN";
    const limit = parseInt(req.query.limit || "12", 10);
    const locale = req.query.locale || "en_US";

    const { data } = await axios.get(
      "https://api.spotify.com/v1/browse/featured-playlists",
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { country, limit, locale },
      }
    );

    res.json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    const payload = error.response?.data || { message: error.message };
    res.status(status).json({ error: payload });
  }
});

/**
 * GET /api/top-tracks
 * Calls Spotify's playlist tracks endpoint with a public "Top Hits" playlist.
 * Query params supported: ?country=IN&limit=12
 * My comment: Using a public playlist ID (e.g., "Today’s Top Hits") as a workaround since top tracks require user auth with Client Credentials Flow.
 */
app.get("/api/top-tracks", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const country = req.query.country || "IN";
    const limit = parseInt(req.query.limit || "12", 10);
    const playlistId = "37i9dQZF1DXcBWIGoYBM5M"; // Today’s Top Hits playlist ID

    console.log(`🎵 Fetching top tracks from playlist: ${playlistId}, country: ${country}`);

    const { data } = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { country, limit: 30 }, // Get more to filter
      }
    );

    console.log(`📊 Playlist returned ${data.items?.length || 0} tracks`);

    // Filter tracks with preview_url and limit to requested amount
    const tracksWithPreview = data.items?.filter(item => item.track?.preview_url) || [];
    const tracksWithoutPreview = data.items?.filter(item => !item.track?.preview_url) || [];
    
    console.log(`✅ Tracks WITH preview: ${tracksWithPreview.length}`);
    console.log(`❌ Tracks WITHOUT preview: ${tracksWithoutPreview.length}`);
    
    if (tracksWithoutPreview.length > 0) {
      console.log(`🚫 Top tracks without preview:`, tracksWithoutPreview.map(item => `"${item.track?.name}" by ${item.track?.artists[0]?.name}`));
    }

    const requestedLimit = parseInt(req.query.limit || "12", 10);
    const filteredData = {
      ...data,
      items: tracksWithPreview.slice(0, requestedLimit)
    };

    console.log(`📤 Sending ${filteredData.items.length} top tracks with previews to frontend`);

    res.json(filteredData);
  } catch (error) {
    const status = error.response?.status || 500;
    const payload = error.response?.data || { message: error.message };
    res.status(status).json({ error: payload });
  }
});

// My comment: Endpoint for genres/categories, used for "Explore Genres" section in frontend.
app.get("/api/genres", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const country = req.query.country || "IN";
    const limit = parseInt(req.query.limit || "12", 10);

    const { data } = await axios.get(
      "https://api.spotify.com/v1/browse/categories",
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { country, limit },
      }
    );

    res.json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    const payload = error.response?.data || { message: error.message };
    res.status(status).json({ error: payload });
  }
});

// My comment: Endpoint for mood booster playlists, using search for "mood booster". For "Mood Booster" carousel in frontend.
app.get("/api/mood-booster", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const limit = parseInt(req.query.limit || "12", 10);

    const { data } = await axios.get(
      "https://api.spotify.com/v1/search",
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { q: "mood booster", type: "playlist", limit },
      }
    );

    res.json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    const payload = error.response?.data || { message: error.message };
    res.status(status).json({ error: payload });
  }
});

// My comment: Endpoint for popular playlists, using search for "popular". For "Popular Playlists" carousel in frontend.
app.get("/api/popular-playlists", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const limit = parseInt(req.query.limit || "12", 10);

    const { data } = await axios.get(
      "https://api.spotify.com/v1/search",
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { q: "popular", type: "playlist", limit },
      }
    );

    res.json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    const payload = error.response?.data || { message: error.message };
    res.status(status).json({ error: payload });
  }
});

// My comment: Endpoint for recommended tracks, using recommendations with seed genres/artists. Frontend can pass seed_genres or seed_artists as query params. For "Recommended Tracks" section.
app.get("/api/top-artists", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const limit = parseInt(req.query.limit || "15", 10);
    // Using a broad search query 'a' to get popular artists list as Spotify lacks a direct top-artists endpoint in client-credential scope.
    const { data } = await axios.get(
      "https://api.spotify.com/v1/search",
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { q: "a", type: "artist", limit },
      }
    );
    res.json(data.artists.items);
  } catch (error) {
    const status = error.response?.status || 500;
    const payload = error.response?.data || { message: error.message };
    res.status(status).json({ error: payload });
  }
});

app.get("/api/recommended-tracks", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const limit = parseInt(req.query.limit || "30", 10); // Get more to filter
    const seed_genres = req.query.seed_genres || "pop,rock"; // Default seeds
    const seed_artists = req.query.seed_artists || "";
    const market = req.query.market || "US";

    console.log(`🎵 Fetching recommended tracks with limit: ${limit}, genres: ${seed_genres}, market: ${market}`);

    const { data } = await axios.get(
      "https://api.spotify.com/v1/recommendations",
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { limit, seed_genres, seed_artists, market },
      }
    );

    console.log(`📊 Spotify returned ${data.tracks.length} tracks`);
    
    // Log preview availability
    const tracksWithPreview = data.tracks.filter(t => t.preview_url);
    const tracksWithoutPreview = data.tracks.filter(t => !t.preview_url);
    
    console.log(`✅ Tracks WITH preview: ${tracksWithPreview.length}`);
    console.log(`❌ Tracks WITHOUT preview: ${tracksWithoutPreview.length}`);
    
    if (tracksWithoutPreview.length > 0) {
      console.log(`🚫 Tracks without preview:`, tracksWithoutPreview.map(t => `"${t.name}" by ${t.artists[0]?.name}`));
    }

    // Filter out tracks without preview_url and limit to requested amount
    const requestedLimit = parseInt(req.query.limit || "12", 10);
    const filtered = {
      ...data,
      tracks: tracksWithPreview.slice(0, requestedLimit),
    };

    console.log(`📤 Sending ${filtered.tracks.length} tracks with previews to frontend`);

    res.json(filtered);
  } catch (error) {
    console.error('❌ Error in recommended-tracks:', error);
    const status = error.response?.status || 500;
    const payload = error.response?.data || { message: error.message };
    res.status(status).json({ error: payload });
  }
});

app.get("/api/callback", async (req, res) => {
  const code = req.query.code;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

  const basic = Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64');

  try {
    const { data } = await axios.post(
      'https://accounts.spotify.com/api/token',
      body,
      {
        headers: {
          'Authorization': `Basic ${basic}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    req.session.user_token = data.access_token;
    res.redirect('/'); // Redirect to frontend home
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// My comment: Endpoint for recently played (user-specific, requires auth). For "Recently Played" carousel.
app.get("/api/recently-played", async (req, res) => {
  try {
    const access_token = req.session.user_token;
    if (!access_token) return res.status(401).json({ error: 'User not authenticated' });

    const limit = parseInt(req.query.limit || "12", 10);

    const { data } = await axios.get(
      "https://api.spotify.com/v1/me/player/recently-played",
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { limit },
      }
    );

    res.json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    const payload = error.response?.data || { message: error.message };
    res.status(status).json({ error: payload });
  }
});

// My comment: Endpoint for authenticated user playlists (user-specific). For "Made for You" or personalized sections.
app.get("/api/me/playlists", async (req, res) => {
  try {
    const access_token = req.session.user_token;
    if (!access_token) return res.status(401).json({ error: 'User not authenticated' });

    const limit = parseInt(req.query.limit || "12", 10);

    const { data } = await axios.get(
      "https://api.spotify.com/v1/me/playlists",
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { limit },
      }
    );

    res.json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    const payload = error.response?.data || { message: error.message };
    res.status(status).json({ error: payload });
  }
});

app.get("/api/playlist-tracks", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const playlistId = req.query.playlistId;
    if (!playlistId) return res.status(400).json({ error: 'playlistId required' });
    const market = req.query.market || "US";
    const limit = parseInt(req.query.limit || "50", 10);

    const { data } = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { market, limit },
      }
    );

    // Keep all items; frontend will fetch preview_url if missing
    res.json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    const payload = error.response?.data || { message: error.message };
    res.status(status).json({ error: payload });
  }
});

// Test endpoint for fallback generation
app.get("/api/test/fallback", (req, res) => {
  const testTrack = { 
    id: req.query.trackId || '2Fv2injs4qAm8mJBGaxVKU', 
    name: 'Test Track' 
  };
  
  try {
    const fallbackUrl = generateFallbackPreview(testTrack);
    res.json({
      trackId: testTrack.id,
      fallbackUrl: fallbackUrl,
      success: true
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

// Debug endpoint to check track preview availability
app.get("/api/debug/track-previews", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const playlistId = "37i9dQZF1DXcBWIGoYBM5M"; // Today's Top Hits
    
    const { data } = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { limit: 10 },
      }
    );

    const trackInfo = data.items.map(item => ({
      name: item.track.name,
      artist: item.track.artists[0]?.name,
      hasPreview: !!item.track.preview_url,
      previewUrl: item.track.preview_url,
      id: item.track.id
    }));

    res.json({
      total: trackInfo.length,
      withPreview: trackInfo.filter(t => t.hasPreview).length,
      withoutPreview: trackInfo.filter(t => !t.hasPreview).length,
      tracks: trackInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use("/auth", authRoutes);
app.use("/auth/spotify", spotifyAuthRouter);
app.use("/api/spotify", spotifyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));

/*
URLSearchParams (why we used it)
---> Spotify’s token endpoint requires Content-Type: application/x-www-form-urlencoded.
---> new URLSearchParams({ grant_type: "client_credentials" }) produces exactly that encoding.
---> If you send JSON instead, Spotify will reject it.

Buffer + Base64 (why we used it)
---> Spotify expects Authorization: Basic base64(client_id:client_secret).
---> Buffer.from("id:secret").toString("base64") creates that Base64 string.
---> Without this header, the token request fails with 401.

req / res (Express request & response)
---> req.query → gets query string values (e.g., ?limit=12&country=IN).
---> res.json(data) → sends JSON to the browser.
---> res.status(code).json(obj) → sends JSON with a specific HTTP status.
*/
