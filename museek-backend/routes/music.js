import express from "express";
import axios from "axios";
import ytSearch from "yt-search";
import ytdlp from "yt-dlp-exec";
import { getAppToken } from "../utils/spotifyToken.js";

const router = express.Router();

// ────────────────────────────────────────────────────────────
// Helper: generate a fallback preview URL from royalty-free sources
// ────────────────────────────────────────────────────────────
function generateFallbackPreview(trackData) {
  const fallbackTracks = {
    upbeat: ["https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"],
    calm: ["https://file-examples.com/storage/fe68c1b7c1a9d6c2b2d3b9c/2017/11/file_example_MP3_700KB.mp3"],
    electronic: ["https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"],
    default: [
      "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
      "https://file-examples.com/storage/fe68c1b7c1a9d6c2b2d3b9c/2017/11/file_example_MP3_700KB.mp3",
    ],
  };

  const searchText = `${(trackData.name || "").toLowerCase()} ${(trackData.artists?.[0]?.name || "").toLowerCase()}`;
  let category = "default";
  if (searchText.includes("dance") || searchText.includes("edm")) category = "electronic";
  else if (searchText.includes("calm") || searchText.includes("acoustic")) category = "calm";
  else if (searchText.includes("pop") || searchText.includes("upbeat")) category = "upbeat";

  const selectedTracks = fallbackTracks[category] || fallbackTracks.default;
  const trackId = trackData.id || "default";
  let hash = 0;
  for (let i = 0; i < trackId.length; i++) {
    const char = trackId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return selectedTracks[Math.abs(hash) % selectedTracks.length];
}

// ────────────────────────────────────────────────────────────
// Spotify Discovery Endpoints
// ────────────────────────────────────────────────────────────

// GET /api/featured-playlists
router.get("/featured-playlists", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const country = req.query.country || "IN";
    const limit = parseInt(req.query.limit || "12", 10);
    const locale = req.query.locale || "en_US";
    const { data } = await axios.get("https://api.spotify.com/v1/browse/featured-playlists", { headers: { Authorization: `Bearer ${access_token}` }, params: { country, limit, locale } });
    res.json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || { message: error.message } });
  }
});

// GET /api/top-tracks
router.get("/top-tracks", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const country = req.query.country || "IN";
    const requestedLimit = parseInt(req.query.limit || "12", 10);
    const playlistId = "37i9dQZF1DXcBWIGoYBM5M"; // Today's Top Hits

    const { data } = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, { headers: { Authorization: `Bearer ${access_token}` }, params: { country, limit: 30 } });

    const tracksWithPreview = data.items?.filter((item) => item.track?.preview_url) || [];
    const tracksWithoutPreview = data.items?.filter((item) => !item.track?.preview_url) || [];

    const finalTracks =
      tracksWithPreview.length >= requestedLimit
        ? tracksWithPreview.slice(0, requestedLimit)
        : tracksWithPreview.length > 0
        ? [...tracksWithPreview, ...tracksWithoutPreview.slice(0, requestedLimit - tracksWithPreview.length)]
        : data.items?.slice(0, requestedLimit) || [];

    res.json({ ...data, items: finalTracks });
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || { message: error.message } });
  }
});

// GET /api/genres
router.get("/genres", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const country = req.query.country || "IN";
    const limit = parseInt(req.query.limit || "12", 10);
    const { data } = await axios.get("https://api.spotify.com/v1/browse/categories", { headers: { Authorization: `Bearer ${access_token}` }, params: { country, limit } });
    res.json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || { message: error.message } });
  }
});

// GET /api/mood-booster
router.get("/mood-booster", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const limit = parseInt(req.query.limit || "12", 10);
    const { data } = await axios.get("https://api.spotify.com/v1/search", { headers: { Authorization: `Bearer ${access_token}` }, params: { q: "mood booster", type: "playlist", limit } });
    res.json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || { message: error.message } });
  }
});

// GET /api/popular-playlists
router.get("/popular-playlists", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const limit = parseInt(req.query.limit || "12", 10);
    const { data } = await axios.get("https://api.spotify.com/v1/search", { headers: { Authorization: `Bearer ${access_token}` }, params: { q: "popular", type: "playlist", limit } });
    res.json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || { message: error.message } });
  }
});

// GET /api/top-artists
router.get("/top-artists", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const limit = parseInt(req.query.limit || "15", 10);
    const { data } = await axios.get("https://api.spotify.com/v1/search", { headers: { Authorization: `Bearer ${access_token}` }, params: { q: "a", type: "artist", limit } });
    res.json(data.artists.items);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || { message: error.message } });
  }
});

// GET /api/recommended-tracks
router.get("/recommended-tracks", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const requestedLimit = parseInt(req.query.limit || "12", 10);
    const seed_genres = req.query.seed_genres || "pop,rock";
    const seed_artists = req.query.seed_artists || "";
    const market = req.query.market || "US";

    const { data } = await axios.get("https://api.spotify.com/v1/recommendations", { headers: { Authorization: `Bearer ${access_token}` }, params: { limit: 30, seed_genres, seed_artists, market } });

    const tracksWithPreview = data.tracks.filter((t) => t.preview_url);
    const tracksWithoutPreview = data.tracks.filter((t) => !t.preview_url);

    let finalTracks =
      tracksWithPreview.length >= requestedLimit
        ? tracksWithPreview.slice(0, requestedLimit)
        : tracksWithPreview.length > 0
        ? [...tracksWithPreview, ...tracksWithoutPreview.slice(0, requestedLimit - tracksWithPreview.length)]
        : data.tracks.slice(0, requestedLimit);

    res.json({ ...data, tracks: finalTracks, preview_stats: { with_preview: tracksWithPreview.length, without_preview: tracksWithoutPreview.length, total_fetched: data.tracks.length } });
  } catch (error) {
    console.error("Error in recommended-tracks:", error);
    res.status(error.response?.status || 500).json({ error: error.response?.data || { message: error.message } });
  }
});

// GET /api/playlist-tracks
router.get("/playlist-tracks", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const playlistId = req.query.playlistId;
    if (!playlistId) return res.status(400).json({ error: "playlistId required" });
    const market = req.query.market || "US";
    const requestedLimit = parseInt(req.query.limit || "50", 10);
    const fetchLimit = Math.min(requestedLimit * 3, 100);

    const { data } = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, { headers: { Authorization: `Bearer ${access_token}` }, params: { market, limit: fetchLimit } });

    const tracksWithPreview = data.items.filter((item) => item.track?.preview_url);
    const tracksWithoutPreview = data.items.filter((item) => item.track && !item.track.preview_url);

    const finalTracks =
      tracksWithPreview.length >= requestedLimit
        ? tracksWithPreview.slice(0, requestedLimit)
        : tracksWithPreview.length > 0
        ? [...tracksWithPreview, ...tracksWithoutPreview.slice(0, requestedLimit - tracksWithPreview.length)]
        : data.items.slice(0, requestedLimit);

    res.json({ ...data, items: finalTracks, total: finalTracks.length, preview_stats: { with_preview: tracksWithPreview.length, without_preview: tracksWithoutPreview.length, total_fetched: data.items.length } });
  } catch (error) {
    console.error("Error in playlist-tracks:", error);
    res.status(error.response?.status || 500).json({ error: error.response?.data || { message: error.message } });
  }
});

// GET /api/user-playlists — Personalized playlists based on user's favorite artists
router.get("/user-playlists", async (req, res) => {
  try {
    const { getMongooseModel } = await import("../models/Register_user.js");
    const User = (await import("../models/Register_user.js")).default;
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "userId query required" });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const { favoriteArtists = [] } = user;
    if (!favoriteArtists.length) return res.json({ playlists: [] });

    const { access_token } = await getAppToken();
    const playlists = [];

    for (const artist of favoriteArtists) {
      const { data } = await axios.get("https://api.spotify.com/v1/search", { headers: { Authorization: `Bearer ${access_token}` }, params: { q: artist, type: "playlist", limit: parseInt(req.query.limit || "5", 10) } });
      (data.playlists?.items || []).forEach((pl) => { if (pl && pl.id) playlists.push(pl); });
    }

    const unique = Object.values(playlists.reduce((acc, p) => { acc[p.id] = p; return acc; }, {}));
    res.json({ playlists: unique });
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || { message: error.message } });
  }
});

// GET /api/recently-played — Requires user Spotify OAuth token
router.get("/recently-played", async (req, res) => {
  try {
    const access_token = req.session?.user_token;
    if (!access_token) return res.status(401).json({ error: "User not authenticated" });
    const limit = parseInt(req.query.limit || "12", 10);
    const { data } = await axios.get("https://api.spotify.com/v1/me/player/recently-played", { headers: { Authorization: `Bearer ${access_token}` }, params: { limit } });
    res.json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || { message: error.message } });
  }
});

// GET /api/me/playlists — Requires user Spotify OAuth token
router.get("/me/playlists", async (req, res) => {
  try {
    const access_token = req.session?.user_token;
    if (!access_token) return res.status(401).json({ error: "User not authenticated" });
    const limit = parseInt(req.query.limit || "12", 10);
    const { data } = await axios.get("https://api.spotify.com/v1/me/playlists", { headers: { Authorization: `Bearer ${access_token}` }, params: { limit } });
    res.json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || { message: error.message } });
  }
});

// GET /api/callback — Spotify OAuth callback
router.get("/callback", async (req, res) => {
  const code = req.query.code;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const body = new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri });
  const basic = Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64");
  try {
    const { data } = await axios.post("https://accounts.spotify.com/api/token", body, { headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" } });
    req.session.user_token = data.access_token;
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ────────────────────────────────────────────────────────────
// Spotify Track & Artist Detail Endpoints
// ────────────────────────────────────────────────────────────

// GET /api/spotify/track-detail — Enhanced track details with multi-market fallback
router.get("/spotify/track-detail", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const trackId = req.query.trackId;
    const market = req.query.market || "US";
    if (!trackId) return res.status(400).json({ error: "trackId query parameter required" });

    const { data } = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, { headers: { Authorization: `Bearer ${access_token}` }, params: { market } });

    if (!data.preview_url) {
      const markets = ["US", "GB", "CA", "AU", "DE", "FR", "IN"];
      for (const m of markets) {
        if (m === market) continue;
        try {
          const { data: altData } = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, { headers: { Authorization: `Bearer ${access_token}` }, params: { market: m } });
          if (altData.preview_url) { data.preview_url = altData.preview_url; data.alternative_market = m; break; }
        } catch (_) {}
      }
      if (!data.preview_url) { data.fallback_preview = true; data.no_preview_available = true; }
    } else {
      data.fallback_preview = false;
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching track:", error.message);
    res.status(200).json({ error: "Failed to fetch track details", trackId: req.query.trackId, preview_url: null, fallback_preview: true, no_preview_available: true });
  }
});

// GET /api/artist/:id — Artist details (photo, genres, followers)
router.get("/artist/:id", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const { data } = await axios.get(`https://api.spotify.com/v1/artists/${req.params.id}`, { headers: { Authorization: `Bearer ${access_token}` } });
    res.json({ id: data.id, name: data.name, photo: data.images?.[0]?.url || null, listeners: data.followers?.total || 0, genres: data.genres || [] });
  } catch (error) {
    console.error("Error /api/artist/:id", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch artist details" });
  }
});

// GET /api/artist/search — Search for an artist by name
router.get("/artist/search", async (req, res) => {
  try {
    const name = (req.query.name || "").trim();
    if (!name) return res.status(400).json({ error: "name query required" });
    const { access_token } = await getAppToken();
    const { data } = await axios.get("https://api.spotify.com/v1/search", { headers: { Authorization: `Bearer ${access_token}` }, params: { q: name, type: "artist", limit: 1 } });
    const artist = data.artists?.items?.[0] || null;
    if (!artist) return res.json({ found: false });
    res.json({ found: true, id: artist.id, name: artist.name, photo: artist.images?.[0]?.url || null, listeners: artist.followers?.total || 0, genres: artist.genres || [] });
  } catch (error) {
    console.error("Error /api/artist/search", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to search artist" });
  }
});

// GET /api/track/search — Search for a track by title and optional artist
router.get("/track/search", async (req, res) => {
  try {
    const title = (req.query.title || "").trim();
    if (!title) return res.status(400).json({ error: "title query required" });
    const artist = (req.query.artist || "").trim();
    let q = `track:"${title}"`;
    if (artist) q += ` artist:"${artist}"`;
    const { access_token } = await getAppToken();
    const { data } = await axios.get("https://api.spotify.com/v1/search", { headers: { Authorization: `Bearer ${access_token}` }, params: { q, type: "track", limit: 1, market: "US" } });
    const track = data.tracks?.items?.[0] || null;
    if (!track) return res.json({ found: false });
    res.json({ found: true, id: track.id, name: track.name, artists: track.artists, album: track.album?.name, image: track.album?.images?.[0]?.url || null, preview_url: track.preview_url || null });
  } catch (error) {
    console.error("Error /api/track/search", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to search track" });
  }
});

// ────────────────────────────────────────────────────────────
// Alternative Audio Sources: YouTube, Deezer, Jamendo, JioSaavn
// ────────────────────────────────────────────────────────────

// GET /api/youtube/status — yt-dlp health check
router.get("/youtube/status", async (req, res) => {
  try {
    const version = await ytdlp("--version").catch(() => null);
    res.json({ status: "operational", version, updateInstructions: { npm: "npm update yt-dlp-exec" } });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// GET /api/youtube/preview — Search YouTube and extract audio URL
router.get("/youtube/preview", async (req, res) => {
  try {
    const trackName = req.query.trackName;
    const artistName = req.query.artistName || "";
    if (!trackName) return res.status(400).json({ error: "trackName required" });

    const query = `${trackName} ${artistName}`.trim();
    const searchRes = await ytSearch(query);
    const video = searchRes.videos?.[0] || null;
    if (!video) return res.json({ found: false });

    const formatStrategies = ["bestaudio/best", "bestaudio[ext=m4a]/bestaudio", "worstaudio/worst", "best", "worst"];
    for (const format of formatStrategies) {
      try {
        const info = await ytdlp(`https://www.youtube.com/watch?v=${video.videoId}`, { dumpSingleJson: true, noWarnings: true, format });
        const audioUrl = info?.url || (info?.requested_formats?.find((f) => f.acodec !== "none")?.url) || (info?.formats?.find((f) => f.acodec !== "none" && f.url)?.url);
        if (audioUrl) return res.json({ found: true, title: video.title, artist: artistName, preview_url: audioUrl, duration: info.duration || video.duration?.seconds || 180 });
      } catch (_) { continue; }
    }

    return res.json({ found: false, message: "No audio available from YouTube" });
  } catch (error) {
    console.error("YouTube preview error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/alternative-audio — YouTube Music search fallback
router.get("/alternative-audio", async (req, res) => {
  try {
    const { trackName, artistName } = req.query;
    if (!trackName || !artistName) return res.status(400).json({ error: "trackName and artistName required" });

    try {
      const { default: YTMusic } = await import("ytmusic-api");
      const ytmusic = new YTMusic();
      await ytmusic.initialize();
      const results = await ytmusic.search(`${trackName} ${artistName}`, "song");
      if (results?.length > 0) {
        const best = results[0];
        return res.json({ found: true, source: "youtube_music", videoId: best.videoId, title: best.name, artist: best.artist?.name, duration: best.duration, thumbnail: best.thumbnails?.[0]?.url });
      }
      return res.json({ found: false, message: "No alternative audio source found" });
    } catch (error) {
      console.error("Alternative audio search error:", error.message);
      res.status(500).json({ error: "Failed to search for alternative audio", message: error.message });
    }
  } catch (error) {
    console.error("Alternative-audio endpoint error:", error.message);
    res.status(500).json({ error: "Failed to search for alternative audio", message: error.message });
  }
});

// GET /api/deezer/preview — Search Deezer for 30-second preview
router.get("/deezer/preview", async (req, res) => {
  try {
    const trackName = req.query.trackName;
    const artistName = req.query.artistName || "";
    if (!trackName) return res.status(400).json({ error: "trackName query param required" });

    async function searchDeezer(q, limit = 5) {
      const { data } = await axios.get("https://api.deezer.com/search", { params: { q, limit } });
      if (data?.data?.length) {
        const hit = data.data.find((t) => t.preview);
        if (hit) return { found: true, title: hit.title, artist: hit.artist?.name, preview_url: hit.preview, deezer_track_id: hit.id, album_cover: hit.album?.cover_medium };
      }
      return { found: false };
    }

    let result = await searchDeezer(`track:"${trackName}"${artistName ? ` artist:"${artistName}"` : ""}`);
    if (!result.found) result = await searchDeezer(`${trackName} ${artistName}`.trim());

    if (result.found) return res.json({ found: true, source: "deezer", ...result });
    return res.json({ found: false, message: "No preview found on Deezer" });
  } catch (error) {
    console.error("Deezer preview error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/jamendo/preview — Search Jamendo with fuzzy matching
router.get("/jamendo/preview", async (req, res) => {
  try {
    const trackName = req.query.trackName;
    const artistName = req.query.artistName || "";
    if (!trackName) return res.status(400).json({ error: "trackName query param required" });
    if (!process.env.JAMENDO_CLIENT_ID) return res.status(503).json({ found: false, message: "Jamendo client ID not configured" });

    const params = { client_id: process.env.JAMENDO_CLIENT_ID, format: "json", limit: 10, search: `${trackName} ${artistName}`.trim(), audioformat: "mp32", include: "musicinfo", order: "popularity_total_desc" };
    if (process.env.JAMENDO_CLIENT_SECRET) params.client_secret = process.env.JAMENDO_CLIENT_SECRET;

    const { data } = await axios.get("https://api.jamendo.com/v3.0/tracks", { params });
    const results = data?.results || [];
    if (!results.length) return res.json({ found: false, message: "No tracks returned by Jamendo" });

    const normalize = (v) => (v ? v.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim() : "");
    const normalizedTrackName = normalize(trackName);
    const normalizedArtist = normalize(artistName);

    const playable = results.find((t) => {
      if (!t?.audio && !t?.audiodownload) return false;
      const cTitle = normalize(t.name || t.title);
      if (normalizedTrackName && cTitle.includes(normalizedTrackName)) return true;
      const tokenCoverage = normalizedTrackName.split(" ").filter(Boolean).filter((tok) => cTitle.split(" ").includes(tok)).length / (normalizedTrackName.split(" ").filter(Boolean).length || 1);
      const artistMatches = normalizedArtist && (normalize(t.artist_name).includes(normalizedArtist) || normalizedArtist.includes(normalize(t.artist_name)));
      return tokenCoverage >= 0.6 && artistMatches;
    });

    if (playable) return res.json({ found: true, source: "jamendo", title: playable.name, artist: playable.artist_name, preview_url: playable.audio || playable.audiodownload, duration: playable.duration, jamendo_track_id: playable.id, album_cover: playable.image, license: playable.license_ccurl });
    return res.json({ found: false, message: "No closely matching audio found on Jamendo" });
  } catch (error) {
    console.error("Jamendo preview error:", error.message);
    return res.status(error.response?.status || 500).json({ error: "Failed to fetch preview from Jamendo", message: error.message });
  }
});

// GET /api/saavn/preview — JioSaavn unofficial API
router.get("/saavn/preview", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "query required" });

    const SAAVN_BASES = ["https://saavn.dev/api", "https://saavncloud.grey.software/api"];
    const saavnRequest = async (path, params = {}) => {
      for (const base of SAAVN_BASES) {
        try {
          const response = await axios.get(`${base}/${path}`, { params, timeout: 10000 });
          return response.data;
        } catch (err) {
          console.log(`Saavn mirror ${base} failed:`, err.code || err.message);
        }
      }
      throw new Error("All Saavn mirrors unreachable");
    };

    let search;
    try { search = await saavnRequest("search", { query, type: "song" }); }
    catch (_) { search = await saavnRequest("search/songs", { query, page: 0, limit: 1 }); }

    const song = search?.data?.results?.[0];
    if (!song) return res.json({ found: false, message: "No Saavn result" });

    let details;
    try { details = await saavnRequest("songs", { id: song.id }); }
    catch (_) { details = await saavnRequest("song", { id: song.id }); }

    const link = details?.data?.downloadUrl?.[2]?.url || details?.data?.downloadUrl?.[0]?.link;
    if (link) return res.json({ found: true, source: "jiosaavn", title: song.name, artist: song.primaryArtists, preview_url: link, duration: song.duration, saavn_song_id: song.id });
    return res.json({ found: false, message: "Saavn song has no streamable link" });
  } catch (error) {
    console.error("Saavn preview error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ────────────────────────────────────────────────────────────
// Test / Debug Endpoints
// ────────────────────────────────────────────────────────────

// GET /api/test/fallback
router.get("/test/fallback", (req, res) => {
  const testTrack = { id: req.query.trackId || "2Fv2injs4qAm8mJBGaxVKU", name: "Test Track" };
  const fallback = generateFallbackPreview(testTrack);
  res.json({ trackId: testTrack.id, fallbackUrl: fallback, message: "Generated fallback preview URL" });
});

// GET /api/test/spotify-preview
router.get("/test/spotify-preview", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const testTracks = [
      { id: "3n3Ppam7vgaVa1iaRUc9Lp", name: "Shape of You - Ed Sheeran" },
      { id: "4iV5W9uYEdYUVa79Axb7Rh", name: "Blinding Lights - The Weeknd" },
    ];

    const results = await Promise.all(
      testTracks.map(async (t) => {
        try {
          const { data } = await axios.get(`https://api.spotify.com/v1/tracks/${t.id}`, { headers: { Authorization: `Bearer ${access_token}` }, params: { market: "US" } });
          return { id: t.id, name: data.name, artist: data.artists?.[0]?.name, preview_url: data.preview_url, has_preview: !!data.preview_url };
        } catch (err) {
          return { id: t.id, name: t.name, error: err.message, has_preview: false };
        }
      })
    );

    res.json({ success: true, results, access_token_working: !!access_token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/debug/track-previews
router.get("/debug/track-previews", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const { data } = await axios.get(`https://api.spotify.com/v1/playlists/37i9dQZF1DXcBWIGoYBM5M/tracks`, { headers: { Authorization: `Bearer ${access_token}` }, params: { limit: 10 } });
    const trackInfo = data.items.map((item) => ({ name: item.track.name, artist: item.track.artists[0]?.name, hasPreview: !!item.track.preview_url, previewUrl: item.track.preview_url, id: item.track.id }));
    res.json({ total: trackInfo.length, withPreview: trackInfo.filter((t) => t.hasPreview).length, withoutPreview: trackInfo.filter((t) => !t.hasPreview).length, tracks: trackInfo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
