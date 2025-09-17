// src/utils/spotifyPlayer.js
// Lightweight helper around Spotify Web Playback SDK + token refresh

let player = null;
let deviceId = null;
let initializing = false;

const BACKEND_BASE = "http://localhost:5000";

export const getStoredTokens = () => ({
  accessToken: localStorage.getItem("spotify_access_token"),
  refreshToken: localStorage.getItem("spotify_refresh_token"),
  expiresAt: parseInt(localStorage.getItem("spotify_token_expires") || "0", 10),
});

const refreshAccessToken = async refreshToken => {
  try {
    const res = await fetch(`${BACKEND_BASE}/auth/spotify/refresh?refresh_token=${refreshToken}`);
    if (!res.ok) throw new Error("Token refresh failed");
    const data = await res.json();
    const { access_token, expires_in } = data;
    const expiryTs = Date.now() + expires_in * 1000;
    localStorage.setItem("spotify_access_token", access_token);
    localStorage.setItem("spotify_token_expires", expiryTs.toString());
    return access_token;
  } catch (err) {
    console.error("❌ Spotify token refresh error", err);
    return null;
  }
};

export const getValidAccessToken = async () => {
  const { accessToken, refreshToken, expiresAt } = getStoredTokens();
  if (!accessToken) return null;
  if (Date.now() < expiresAt - 60000) return accessToken; // still valid 60s buffer
  if (refreshToken) return await refreshAccessToken(refreshToken);
  return null;
};

export const initPlayer = async () => {
  if (player || initializing) return player;
  initializing = true;
  const token = await getValidAccessToken();
  if (!token) {
    console.warn("No Spotify access token – cannot init player");
    initializing = false;
    return null;
  }
  await new Promise(resolve => {
    if (window.Spotify && window.Spotify.Player) return resolve();
    window.onSpotifyWebPlaybackSDKReady = () => resolve();
  });

  player = new window.Spotify.Player({
    name: "Museek Web Player",
    getOAuthToken: cb => cb(token),
    volume: 0.8,
  });

  player.addListener("ready", ({ device_id }) => {
    console.log("✅ Spotify Player ready", device_id);
    deviceId = device_id;
  });
  player.addListener("initialization_error", ({ message }) => console.error(message));
  player.addListener("authentication_error", ({ message }) => console.error(message));
  player.addListener("account_error", ({ message }) => console.error(message));
  player.addListener("playback_error", ({ message }) => console.error(message));

  await player.connect();
  initializing = false;
  return player;
};

export const playTrack = async trackUri => {
  const token = await getValidAccessToken();
  if (!token) return false;
  if (!player) await initPlayer();
  if (!deviceId) {
    console.warn("Device ID not ready yet");
    return false;
  }
  try {
    const res = await fetch("https://api.spotify.com/v1/me/player/play?device_id=" + deviceId, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: [trackUri] }),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to start playback", err);
    return false;
  }
};

export const pausePlayback = async () => {
  const token = await getValidAccessToken();
  if (!token || !deviceId) return;
  await fetch("https://api.spotify.com/v1/me/player/pause?device_id=" + deviceId, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
};
