// ============================================================
//  Museek Backend — Entry Point
//  All route logic lives in dedicated files under /routes
// ============================================================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db.js";

// Route modules
import authRoutes from "./routes/auth.js";
import spotifyAuthRouter from "./routes/spotifyAuth.js";
import spotifyRoutes from "./routes/spotify.js";
import jamendoRoutes from "./routes/jamendo.js";
import customSongsRoutes from "./routes/customSongs.js";
import analyticsRoutes from "./routes/analytics.js";
import settingsRoutes from "./routes/settings.js";
import likesRoutes from "./routes/likes.js";
import playlistsRoutes from "./routes/playlists.js";
import usersRoutes from "./routes/users.js";
import adminsRoutes from "./routes/admins.js";
import musicRoutes from "./routes/music.js";

// Models (for initialisation tasks only)
import User from "./models/Register_user.js";

dotenv.config();
await connectDB();

const app = express();

// ── Middleware ───────────────────────────────────────────────
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);
app.use(express.json());

// Serve uploaded audio and cover images as static files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ── Health Check ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Museek API. Use /api/* endpoints." });
});

// ── Route Mounts ─────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/auth/spotify", spotifyAuthRouter);
app.use("/api/spotify", spotifyRoutes);
app.use("/api/jamendo", jamendoRoutes);
app.use("/api/custom-songs", customSongsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api", settingsRoutes);        // /api/settings, /api/audit-logs, /api/registration-status
app.use("/api/likes", likesRoutes);
app.use("/api/playlists", playlistsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/user", usersRoutes);      // /api/user/:id/avatar and /api/user/:id/name
app.use("/api/admins", adminsRoutes);
app.use("/api", musicRoutes);           // Spotify discovery, YouTube, Deezer, Saavn, etc.

// ── Startup Tasks ─────────────────────────────────────────────
// Add sample listening hours to any users who have none yet
const addSampleListeningHours = async () => {
  try {
    const users = await User.find({ listeningHours: { $exists: false } }).limit(10);
    for (const user of users) {
      const randomHours = Math.floor(Math.random() * 100) + 10;
      await User.findByIdAndUpdate(user._id, { listeningHours: randomHours });
    }
    if (users.length > 0) {
      console.log(`📊 Added sample listening hours to ${users.length} users`);
    }
  } catch {
    // Non-critical — silently skip
  }
};
setTimeout(addSampleListeningHours, 2000);

// ── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Museek API running on http://localhost:${PORT}`));
