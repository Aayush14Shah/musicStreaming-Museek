import express from "express";
import axios from "axios";
import querystring from "querystring";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const {
  SPOTIFY_CLIENT_ID: clientId,
  SPOTIFY_CLIENT_SECRET: clientSecret,
  SPOTIFY_REDIRECT_URI: redirectUri = "http://localhost:5000/api/spotify/callback",
} = process.env;

const generateRandomString = length => {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Step 1: redirect user to Spotify authorize URL
router.get("/login", (req, res) => {
  const state = generateRandomString(16);
  const scope = [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-modify-playback-state",
    "user-read-playback-state",
  ].join(" ");

  const params = querystring.stringify({
    response_type: "code",
    client_id: clientId,
    scope,
    redirect_uri: redirectUri,
    state,
  });
  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

// Step 2: handle callback and exchange code for tokens
router.get("/callback", async (req, res) => {
  const { code, state, error } = req.query;
  if (error) return res.status(400).json({ error });
  if (!code) return res.status(400).json({ error: "Missing code" });
  try {
    const tokenRes = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenRes.data;

    // For simplicity send tokens back in query params to the frontend page
    const frontendRedirect = `http://localhost:3000/spotify-auth-success?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`;
    res.redirect(frontendRedirect);
  } catch (err) {
    console.error("Spotify token exchange error", err.response?.data || err.message);
    res.status(500).json({ error: "Token exchange failed" });
  }
});

// Step 3: refresh token endpoint
router.get("/refresh", async (req, res) => {
  const { refresh_token } = req.query;
  if (!refresh_token) return res.status(400).json({ error: "Missing refresh_token" });
  try {
    const tokenRes = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        },
      }
    );
    res.json(tokenRes.data);
  } catch (err) {
    console.error("Spotify token refresh error", err.response?.data || err.message);
    res.status(500).json({ error: "Refresh token failed" });
  }
});

export default router;
