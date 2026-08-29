import express from "express";
import axios from "axios";

const router = express.Router();

/**
 * GET /api/jamendo/tracks
 * Fetches playable royalty-free tracks from the Jamendo API.
 * Query params: limit, order
 */
router.get("/tracks", async (req, res) => {
  try {
    const { limit = 12, order = "popularity_total" } = req.query;
    const clientId = process.env.JAMENDO_CLIENT_ID || "440e3aa7";

    const jamUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&include=musicinfo&audioformat=mp32&limit=${limit}&order=${order}`;
    const { data } = await axios.get(jamUrl, { timeout: 8000 });

    const mapped = (data.results || [])
      .map((t) => ({
        id: t.id,
        name: t.name,
        artist: t.artist_name,
        album: t.album_name,
        duration: t.duration,
        image: t.image,
        audio_url: t.audio || t.audio_download,
      }))
      .filter((t) => t.audio_url);

    res.json({ tracks: mapped });
  } catch (err) {
    console.error("Jamendo proxy failed", err.message);
    res.status(500).json({ error: "Jamendo fetch failed" });
  }
});

export default router;
