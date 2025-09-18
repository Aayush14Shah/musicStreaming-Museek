// backend/server.js
import express from "express";
import axios from "axios";
import ytSearch from "yt-search";
import ytdlp from "yt-dlp-exec";
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

// Enhanced track details endpoint with multiple fallback sources
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

    // Try to get Spotify preview URL from multiple sources
    if (!data.preview_url || data.preview_url === null || data.preview_url === 'undefined') {
      console.log(`🔄 No Spotify preview for: ${data.name} by ${data.artists?.[0]?.name}`);
      
      // Try alternative preview sources from different markets
      let alternativePreview = null;
      
      try {
        console.log(`🌍 Trying different markets for: ${data.name}`);
        const markets = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE', 'IN', 'BR', 'MX'];
        
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
      
      // If still no Spotify preview, try to find alternative sources
      if (!alternativePreview) {
        console.log(`🔍 Searching for alternative audio sources for: ${data.name}`);
        
        try {
          // Search for the same song on Spotify to find alternative versions
          const searchQuery = `${data.name} ${data.artists?.[0]?.name}`.replace(/[^\w\s]/gi, '');
          const searchResponse = await axios.get(
            `https://api.spotify.com/v1/search`,
            {
              headers: { Authorization: `Bearer ${access_token}` },
              params: { 
                q: searchQuery,
                type: 'track',
                limit: 10,
                market: 'US'
              }
            }
          );
          
          // Look for alternative versions with preview URLs
          const alternativeTracks = searchResponse.data.tracks.items.filter(track => 
            track.preview_url && 
            track.id !== trackId &&
            track.name.toLowerCase().includes(data.name.toLowerCase().split('(')[0].trim().toLowerCase())
          );
          
          if (alternativeTracks.length > 0) {
            const altTrack = alternativeTracks[0];
            console.log(`🎯 Found alternative version with preview: "${altTrack.name}" by ${altTrack.artists[0].name}`);
            data.preview_url = altTrack.preview_url;
            data.fallback_preview = true;
            data.alternative_version = true;
            data.alternative_track_name = altTrack.name;
          }
        } catch (searchError) {
          console.log(`❌ Alternative search failed:`, searchError.message);
        }
      }
      
      // If still no preview found, return the track data anyway (frontend will handle fallback)
      if (!data.preview_url) {
        console.log(`❌ No preview available anywhere for: ${data.name}`);
        data.preview_url = null;
        data.fallback_preview = true;
        data.no_preview_available = true;
      }
    } else {
      data.fallback_preview = false;
      console.log(`✅ Using original Spotify preview: ${data.preview_url}`);
    }

    // Final verification
    console.log(`📤 Final response for "${data.name}":`, {
      preview_url: data.preview_url,
      fallback_preview: data.fallback_preview,
      no_preview_available: data.no_preview_available,
      url_type: typeof data.preview_url
    });

    res.json(data);
  } catch (error) {
    console.error(`❌ Error fetching track ${req.query.trackId}:`, error.message);
    
    // Return basic track info even if API fails
    res.status(200).json({ 
      error: 'Failed to fetch track details from Spotify',
      trackId: req.query.trackId,
      preview_url: null,
      fallback_preview: true,
      no_preview_available: true
    });
  }
});

// New endpoint to search for alternative audio sources
app.get("/api/alternative-audio", async (req, res) => {
  try {
    const { trackName, artistName } = req.query;
    
    if (!trackName || !artistName) {
      return res.status(400).json({ error: "trackName and artistName required" });
    }

    console.log(`🔍 Searching for alternative audio: "${trackName}" by ${artistName}`);
    
    // Try to find the song on YouTube Music using ytmusicapi
    try {
      const YTMusic = require('ytmusic-api').default;
      const ytmusic = new YTMusic();
      await ytmusic.initialize();
      
      const searchQuery = `${trackName} ${artistName}`;
      const searchResults = await ytmusic.search(searchQuery, 'song');
      
      if (searchResults && searchResults.length > 0) {
        const bestMatch = searchResults[0];
        console.log(`🎯 Found YouTube Music match: "${bestMatch.name}" by ${bestMatch.artist?.name}`);
        
        // Get the streaming URL (Note: This is for educational purposes - check YouTube's ToS)
        const videoId = bestMatch.videoId;
        
        return res.json({
          found: true,
          source: 'youtube_music',
          videoId: videoId,
          title: bestMatch.name,
          artist: bestMatch.artist?.name,
          duration: bestMatch.duration,
          thumbnail: bestMatch.thumbnails?.[0]?.url,
          // Note: Actual streaming requires additional processing
          preview_url: `https://www.youtube.com/watch?v=${videoId}`,
          warning: 'YouTube streaming requires proper licensing and ToS compliance'
        });
      }
    } catch (ytError) {
      console.log(`❌ YouTube Music search failed:`, ytError.message);
    }
    
    // Fallback: Try SoundCloud API (if you have API key)
    // This would require SoundCloud API integration
    
    // If no alternative found, return structured response
    res.json({
      found: false,
      message: 'No alternative audio source found',
      trackName,
      artistName
    });
    
  } catch (error) {
    console.error(`❌ Alternative audio search error:`, error.message);
    res.status(500).json({ 
      error: 'Failed to search for alternative audio',
      message: error.message 
    });
  }
});

// YouTube preview endpoint (no auth required)
app.get("/api/youtube/preview", async (req, res) => {
  try {
    const trackName = req.query.trackName;
    const artistName = req.query.artistName || "";
    if (!trackName) return res.status(400).json({ error: "trackName required" });

    const query = `${trackName} ${artistName}`.trim();
    const searchRes = await ytSearch(query);
    const video = searchRes.videos && searchRes.videos.length ? searchRes.videos[0] : null;
    if (!video) return res.json({ found: false, message: "No YouTube result" });

    const info = await ytdlp(`https://www.youtube.com/watch?v=${video.videoId}`, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true
    });

    if (!info || !info.formats) return res.json({ found: false, message: "yt-dlp returned no formats" });
    const audio = info.formats.find(f => f.ext === 'm4a' && f.url);
    if (!audio) return res.json({ found: false, message: "No audio-only format" });

    return res.json({
      found: true,
      source: "youtube",
      title: info.title,
      artist: artistName,
      preview_url: audio.url,
      youtube_video_id: video.videoId,
      duration: info.duration
    });
  } catch (error) {
    console.error("❌ YouTube preview error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Deezer preview endpoint (no auth required)
app.get("/api/deezer/preview", async (req, res) => {
  try {
    const trackName = req.query.trackName;
    const artistName = req.query.artistName || "";
    if (!trackName) return res.status(400).json({ error: "trackName query param required" });

    // --- helper to query Deezer and return first preview url ---
    async function searchDeezer(q, limit = 5) {
      const { data } = await axios.get("https://api.deezer.com/search", { params: { q, limit } });
      if (data && data.data && data.data.length) {
        const hit = data.data.find(t => t.preview);
        if (hit) {
          return {
            found: true,
            title: hit.title,
            artist: hit.artist?.name,
            preview_url: hit.preview,
            deezer_track_id: hit.id,
            album_cover: hit.album?.cover_medium
          };
        }
      }
      return { found: false };
    }

    // 1️⃣ Strict query (exact phrases)
    let qStrict = `track:\"${trackName}\"`;
    if (artistName) qStrict += ` artist:\"${artistName}\"`;
    let result = await searchDeezer(qStrict);

    // 2️⃣ Fuzzy query if strict failed
    if (!result.found) {
      const qFuzzy = `${trackName} ${artistName}`.trim();
      result = await searchDeezer(qFuzzy);
    }

    // 3️⃣ Respond
    if (result.found) {
      return res.json({ found: true, source: "deezer", ...result });
    }
    return res.json({ found: false, message: "No preview found on Deezer" });
  } catch (error) {
    console.error("❌ Deezer preview error:", error.message);
    return res.status(500).json({ error: error.message });
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
// app.get("/api/new-releases", async(req, res) => {
//   try {
//     // 1) Get a fresh token (we’ll add caching in Option B)
//     const {access_token} = await getAppToken();

//     // 2) Build optional query params for Spotify
//     const country = req.query.country || "IN";
//     const limit = parseInt(req.query.limit || "12", 10)

//     // 3) Call Spotify Web API with the Bearer token || axios.get(url, config)
//     /* 
//     config.headers.Authorization = 'Bearer <token>' is required for Spotify.
//     config.params is an object that axios turns into ?key=value query string.
//     */
//     const {data} = await axios.get(
//       "https://api.spotify.com/v1/browse/new-releases",
//       {
//         headers: {Authorization: `Bearer ${access_token}`},
//         params: {country, limit},  // axios turns this into ?country=IN&limit=12
//       }
//     )

//     // 4) Send the Spotify JSON straight back to your React app
//     res.json(data);
//   } catch (error) {
//     // Helpful error reporting
//     const status = error.response?.status || 500;
//     const payload = error.response?.data || {message: error.message};
//     res.status(status).json({error: payload});
//   }
// })

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

    // Smart filtering - prioritize tracks with previews but don't exclude all
    const requestedLimit = parseInt(req.query.limit || "12", 10);
    let finalTracks = [];
    
    if (tracksWithPreview.length >= requestedLimit) {
      // Enough tracks with previews
      finalTracks = tracksWithPreview.slice(0, requestedLimit);
      console.log(`🎯 Using ${finalTracks.length} tracks with previews only`);
    } else if (tracksWithPreview.length > 0) {
      // Some tracks with previews - mix them with others
      finalTracks = [
        ...tracksWithPreview,
        ...tracksWithoutPreview.slice(0, requestedLimit - tracksWithPreview.length)
      ];
      console.log(`🔄 Mixed mode: ${tracksWithPreview.length} with previews + ${finalTracks.length - tracksWithPreview.length} without previews`);
    } else {
      // No tracks with previews - show all (frontend handles fallback)
      finalTracks = data.tracks.slice(0, requestedLimit);
      console.log(`⚠️ No preview tracks found - showing all ${finalTracks.length} tracks (frontend will use fallback)`);
    }

    const filtered = {
      ...data,
      tracks: finalTracks,
      preview_stats: {
        with_preview: tracksWithPreview.length,
        without_preview: tracksWithoutPreview.length,
        total_fetched: data.tracks.length
      }
    };

    console.log(`📤 Sending ${filtered.tracks.length} tracks to frontend`);

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
    const requestedLimit = parseInt(req.query.limit || "50", 10);
    
    // Get more tracks initially to account for filtering
    const fetchLimit = Math.min(requestedLimit * 3, 100);

    console.log(`🎵 Fetching playlist tracks for ${playlistId}, limit: ${fetchLimit}`);

    const { data } = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: { market, limit: fetchLimit },
      }
    );

    console.log(`📊 Spotify returned ${data.items.length} playlist items`);

    // Separate tracks with and without previews
    const tracksWithPreview = data.items.filter(item => {
      const track = item.track;
      return track && track.preview_url;
    });

    const tracksWithoutPreview = data.items.filter(item => {
      const track = item.track;
      return track && !track.preview_url;
    });

    console.log(`✅ Tracks WITH preview: ${tracksWithPreview.length}`);
    console.log(`❌ Tracks WITHOUT preview: ${tracksWithoutPreview.length}`);

    // Smart filtering logic
    let finalTracks = [];
    
    if (tracksWithPreview.length >= requestedLimit) {
      // Enough tracks with previews - use only those
      finalTracks = tracksWithPreview.slice(0, requestedLimit);
      console.log(`🎯 Using ${finalTracks.length} tracks with previews only`);
    } else if (tracksWithPreview.length > 0) {
      // Some tracks with previews - prioritize them, fill with others
      finalTracks = [
        ...tracksWithPreview,
        ...tracksWithoutPreview.slice(0, requestedLimit - tracksWithPreview.length)
      ];
      console.log(`🔄 Mixed mode: ${tracksWithPreview.length} with previews + ${finalTracks.length - tracksWithPreview.length} without previews`);
    } else {
      // No tracks with previews - show all tracks (frontend will handle fallback)
      finalTracks = data.items.slice(0, requestedLimit);
      console.log(`⚠️ No preview tracks found - showing all ${finalTracks.length} tracks (frontend will use fallback)`);
    }

    const filteredData = {
      ...data,
      items: finalTracks,
      total: finalTracks.length,
      preview_stats: {
        with_preview: tracksWithPreview.length,
        without_preview: tracksWithoutPreview.length,
        total_fetched: data.items.length
      }
    };

    console.log(`📤 Sending ${filteredData.items.length} tracks to frontend`);

    res.json(filteredData);
  } catch (error) {
    console.error('❌ Error in playlist-tracks:', error);
    const status = error.response?.status || 500;
    const payload = error.response?.data || { message: error.message };
    res.status(status).json({ error: payload });
  }
});

// Test endpoint to verify Spotify API is working and getting real preview URLs
app.get("/api/test/spotify-preview", async (req, res) => {
  try {
    console.log('🧪 Testing Spotify API for real preview URLs...');
    
    const { access_token } = await getAppToken();
    console.log('✅ Got access token:', access_token ? 'YES' : 'NO');
    
    // Test with known tracks that should have previews
    const testTracks = [
      { id: '3n3Ppam7vgaVa1iaRUc9Lp', name: 'Shape of You - Ed Sheeran' },
      { id: '4iV5W9uYEdYUVa79Axb7Rh', name: 'Blinding Lights - The Weeknd' },
      { id: '7qiZfU4dY1lWllzX7mPBI3', name: 'Shape of You - Ed Sheeran (Alternative)' },
      { id: '0VjIjW4GlULA7QjNFyX15g', name: 'Watermelon Sugar - Harry Styles' }
    ];
    
    const results = [];
    
    for (const testTrack of testTracks) {
      try {
        console.log(`🔍 Testing track: ${testTrack.name} (${testTrack.id})`);
        
        const { data } = await axios.get(
          `https://api.spotify.com/v1/tracks/${testTrack.id}`,
          {
            headers: { Authorization: `Bearer ${access_token}` },
            params: { market: 'US' }
          }
        );
        
        const result = {
          id: testTrack.id,
          name: data.name,
          artist: data.artists?.[0]?.name,
          preview_url: data.preview_url,
          has_preview: !!data.preview_url,
          album: data.album?.name,
          popularity: data.popularity
        };
        
        results.push(result);
        
        if (data.preview_url) {
          console.log(`✅ FOUND PREVIEW: "${data.name}" - ${data.preview_url}`);
        } else {
          console.log(`❌ NO PREVIEW: "${data.name}"`);
        }
        
      } catch (trackError) {
        console.log(`❌ Error testing track ${testTrack.id}:`, trackError.message);
        results.push({
          id: testTrack.id,
          name: testTrack.name,
          error: trackError.message,
          has_preview: false
        });
      }
    }
    
    const summary = {
      total_tested: results.length,
      with_preview: results.filter(r => r.has_preview).length,
      without_preview: results.filter(r => !r.has_preview).length,
      success_rate: `${Math.round((results.filter(r => r.has_preview).length / results.length) * 100)}%`
    };
    
    console.log('📊 Test Summary:', summary);
    
    res.json({
      success: true,
      message: 'Spotify API test completed',
      summary,
      results,
      access_token_working: !!access_token
    });
    
  } catch (error) {
    console.error('❌ Spotify API test failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to test Spotify API'
    });
  }
});

// Test endpoint for fallback generation
app.get("/api/test/fallback", (req, res) => {
  const testTrack = { 
    id: req.query.trackId || '2Fv2injs4qAm8mJBGaxVKU', 
    name: 'Test Track' 
  };
  const fallback = generateFallbackPreview(testTrack);
  res.json({ 
    trackId: testTrack.id, 
    fallbackUrl: fallback,
    message: 'Generated fallback preview URL'
  });
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
