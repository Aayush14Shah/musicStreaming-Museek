import express from "express";
import CustomSong from "../models/CustomSong.js";
import upload from "../middleware/upload.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// ==================== ADMIN CUSTOM SONGS CRUD ====================

// GET /api/custom-songs/search — Search published custom songs for audio playback
router.get("/search", async (req, res) => {
  try {
    const { query, limit = 5 } = req.query;
    if (!query) return res.json({ songs: [] });

    const searchRegex = new RegExp(query.split(" ").join("|"), "i");
    const songs = await CustomSong.find({
      is_active: 1,
      apiStatus: "Published",
      $or: [{ title: searchRegex }, { artist: searchRegex }, { album: searchRegex }],
    })
      .select("title artist album audioFileName coverImageName duration")
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const songsWithUrls = songs.map((song) => ({
      ...song.toObject(),
      audioUrl: `/uploads/audio/${song.audioFileName}`,
      coverUrl: song.coverImageName ? `/uploads/images/${song.coverImageName}` : null,
    }));

    console.log(`🔍 Custom song search for "${query}": ${songsWithUrls.length} results`);
    res.json({ songs: songsWithUrls });
  } catch (error) {
    console.error("Error searching custom songs:", error);
    res.status(500).json({ error: "Failed to search custom songs" });
  }
});

// GET /api/custom-songs/stats/overview — Statistics for admin dashboard
router.get("/stats/overview", async (req, res) => {
  try {
    const totalSongs = await CustomSong.countDocuments({});
    const activeSongs = await CustomSong.countDocuments({ is_active: 1 });
    const inactiveSongs = await CustomSong.countDocuments({ is_active: 0 });
    const publishedSongs = await CustomSong.countDocuments({ is_active: 1, apiStatus: "Published" });
    const draftSongs = await CustomSong.countDocuments({ is_active: 1, apiStatus: "Draft" });
    const errorSongs = await CustomSong.countDocuments({ is_active: 1, apiStatus: "Error" });

    const genreStats = await CustomSong.aggregate([
      { $group: { _id: "$genre", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({ totalSongs, activeSongs, inactiveSongs, publishedSongs, draftSongs, errorSongs, genreDistribution: genreStats });
  } catch (error) {
    console.error("Error fetching song stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// GET /api/custom-songs — All songs with pagination, search, status, genre filters
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const genre = req.query.genre || "";

    let filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { artist: { $regex: search, $options: "i" } },
        { album: { $regex: search, $options: "i" } },
      ];
    }
    if (status) filter.apiStatus = status;
    if (genre) filter.genre = { $regex: genre, $options: "i" };

    const songs = await CustomSong.find(filter).populate("uploadedBy", "email").sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await CustomSong.countDocuments(filter);

    res.json({ songs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Error fetching custom songs:", error);
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

// GET /api/custom-songs/:id — Single song by ID
router.get("/:id", async (req, res) => {
  try {
    const song = await CustomSong.findOne({ _id: req.params.id, is_active: 1 }).populate("uploadedBy", "email");
    if (!song) return res.status(404).json({ error: "Song not found" });
    res.json(song);
  } catch (error) {
    console.error("Error fetching song:", error);
    res.status(500).json({ error: "Failed to fetch song" });
  }
});

// POST /api/custom-songs — Upload a new custom song (multipart: audioFile + coverImage)
router.post("/", upload.fields([{ name: "audioFile", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]), async (req, res) => {
  try {
    const { title, artist, album, genre, releaseDate, duration, description, uploadedBy } = req.body;
    if (!req.files || !req.files.audioFile) return res.status(400).json({ error: "Audio file is required" });

    const audioFile = req.files.audioFile[0];
    const coverImage = req.files.coverImage ? req.files.coverImage[0] : null;

    const newSong = new CustomSong({
      title, artist, album, genre,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
      duration, description,
      audioFilePath: audioFile.path,
      audioFileName: audioFile.filename,
      coverImagePath: coverImage ? coverImage.path : null,
      coverImageName: coverImage ? coverImage.filename : null,
      fileSize: audioFile.size,
      mimeType: audioFile.mimetype,
      uploadedBy: uploadedBy || "507f1f77bcf86cd799439011",
      apiStatus: "Published",
    });

    const savedSong = await newSong.save();
    await savedSong.populate("uploadedBy", "email");

    console.log(`✅ New song uploaded: "${title}" by ${artist}`);
    res.status(201).json(savedSong);
  } catch (error) {
    console.error("Error creating song:", error);
    if (req.files) {
      if (req.files.audioFile) fs.unlink(req.files.audioFile[0].path, () => {});
      if (req.files.coverImage) fs.unlink(req.files.coverImage[0].path, () => {});
    }
    res.status(500).json({ error: "Failed to create song" });
  }
});

// PUT /api/custom-songs/:id — Update song metadata
router.put("/:id", async (req, res) => {
  try {
    const { title, artist, album, genre, releaseDate, duration, description, apiStatus } = req.body;
    const updateData = { title, artist, album, genre, releaseDate: releaseDate ? new Date(releaseDate) : null, duration, description, apiStatus };

    const updatedSong = await CustomSong.findOneAndUpdate({ _id: req.params.id, is_active: 1 }, updateData, { new: true }).populate("uploadedBy", "email");
    if (!updatedSong) return res.status(404).json({ error: "Song not found" });

    console.log(`✅ Song updated: "${updatedSong.title}" by ${updatedSong.artist}`);
    res.json(updatedSong);
  } catch (error) {
    console.error("Error updating song:", error);
    res.status(500).json({ error: "Failed to update song" });
  }
});

// PATCH /api/custom-songs/:id/toggle-status — Activate or deactivate a song
router.patch("/:id/toggle-status", async (req, res) => {
  try {
    const song = await CustomSong.findById(req.params.id);
    if (!song) return res.status(404).json({ error: "Song not found" });

    const newStatus = song.is_active === 1 ? 0 : 1;
    const updatedSong = await CustomSong.findByIdAndUpdate(req.params.id, { is_active: newStatus }, { new: true }).populate("uploadedBy", "email");

    const statusText = newStatus === 1 ? "activated" : "deactivated";
    console.log(`🔄 Song ${statusText}: "${updatedSong.title}" by ${updatedSong.artist}`);
    res.json({ message: `Song ${statusText} successfully`, song: updatedSong });
  } catch (error) {
    console.error("Error toggling song status:", error);
    res.status(500).json({ error: "Failed to toggle song status" });
  }
});

// ==================== USER-FACING SONGS API ====================

// GET /api/songs/custom — Public listing of published songs
router.get("/songs/custom", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const genre = req.query.genre || "";

    let filter = { is_active: 1, apiStatus: "Published" };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { artist: { $regex: search, $options: "i" } },
        { album: { $regex: search, $options: "i" } },
      ];
    }
    if (genre) filter.genre = { $regex: genre, $options: "i" };

    const songs = await CustomSong.find(filter).select("title artist album genre releaseDate duration description coverImagePath audioFilePath playCount").sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await CustomSong.countDocuments(filter);

    const songsWithUrls = songs.map((song) => ({
      ...song.toObject(),
      audioUrl: `${req.protocol}://${req.get("host")}/api/songs/custom/stream/${song._id}`,
      coverUrl: song.coverImagePath ? `${req.protocol}://${req.get("host")}/api/songs/custom/cover/${song._id}` : null,
    }));

    res.json({ songs: songsWithUrls, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Error fetching custom songs for users:", error);
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

// GET /api/songs/custom/stream/:id — Stream audio file
router.get("/songs/custom/stream/:id", async (req, res) => {
  try {
    const song = await CustomSong.findOne({ _id: req.params.id, is_active: 1, apiStatus: "Published" });
    if (!song || !song.audioFilePath) return res.status(404).json({ error: "Audio file not found" });

    const audioPath = path.isAbsolute(song.audioFilePath)
      ? song.audioFilePath
      : path.join(process.cwd(), song.audioFilePath);

    if (!fs.existsSync(audioPath)) return res.status(404).json({ error: "Audio file not found on server" });

    const stat = fs.statSync(audioPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    const ext = path.extname(audioPath).toLowerCase();
    let contentType = "audio/mpeg";
    if (ext === ".wav") contentType = "audio/wav";
    else if (ext === ".flac") contentType = "audio/flac";
    else if (ext === ".ogg") contentType = "audio/ogg";
    else if (ext === ".m4a") contentType = "audio/mp4";

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(audioPath, { start, end });
      res.writeHead(206, { "Content-Range": `bytes ${start}-${end}/${fileSize}`, "Accept-Ranges": "bytes", "Content-Length": chunksize, "Content-Type": contentType, "Cache-Control": "public, max-age=3600" });
      file.pipe(res);
    } else {
      res.writeHead(200, { "Content-Length": fileSize, "Content-Type": contentType, "Accept-Ranges": "bytes", "Cache-Control": "public, max-age=3600" });
      fs.createReadStream(audioPath).pipe(res);
    }

    await CustomSong.findByIdAndUpdate(req.params.id, { $inc: { playCount: 1 }, lastPlayed: new Date() });
  } catch (error) {
    console.error("Error streaming audio:", error);
    res.status(500).json({ error: "Failed to stream audio" });
  }
});

// GET /api/songs/custom/cover/:id — Serve cover image
router.get("/songs/custom/cover/:id", async (req, res) => {
  try {
    const song = await CustomSong.findOne({ _id: req.params.id, is_active: 1, apiStatus: "Published" });
    if (!song || !song.coverImagePath) return res.status(404).json({ error: "Cover image not found" });

    const imagePath = path.isAbsolute(song.coverImagePath)
      ? song.coverImagePath
      : path.join(process.cwd(), song.coverImagePath);

    if (!fs.existsSync(imagePath)) return res.status(404).json({ error: "Cover image not found on server" });

    const ext = path.extname(imagePath).toLowerCase();
    let contentType = "image/jpeg";
    if (ext === ".png") contentType = "image/png";
    else if (ext === ".webp") contentType = "image/webp";

    res.set({ "Content-Type": contentType, "Cache-Control": "public, max-age=86400" });
    fs.createReadStream(imagePath).pipe(res);
  } catch (error) {
    console.error("Error serving cover image:", error);
    res.status(500).json({ error: "Failed to serve cover image" });
  }
});

// GET /api/songs/custom/genre/:genre — Songs by genre
router.get("/songs/custom/genre/:genre", async (req, res) => {
  try {
    const { genre } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const songs = await CustomSong.find({ genre: { $regex: genre, $options: "i" }, is_active: 1, apiStatus: "Published" })
      .select("title artist album genre coverImagePath")
      .limit(limit)
      .sort({ playCount: -1 });

    const songsWithUrls = songs.map((song) => ({
      ...song.toObject(),
      audioUrl: `${req.protocol}://${req.get("host")}/api/songs/custom/stream/${song._id}`,
      coverUrl: song.coverImagePath ? `${req.protocol}://${req.get("host")}/api/songs/custom/cover/${song._id}` : null,
    }));

    res.json(songsWithUrls);
  } catch (error) {
    console.error("Error fetching songs by genre:", error);
    res.status(500).json({ error: "Failed to fetch songs by genre" });
  }
});

// GET /api/songs/custom/trending — Trending songs by play count
router.get("/songs/custom/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const songs = await CustomSong.find({ is_active: 1, apiStatus: "Published" })
      .select("title artist album genre coverImagePath playCount")
      .sort({ playCount: -1, createdAt: -1 })
      .limit(limit);

    const songsWithUrls = songs.map((song) => ({
      ...song.toObject(),
      audioUrl: `${req.protocol}://${req.get("host")}/api/songs/custom/stream/${song._id}`,
      coverUrl: song.coverImagePath ? `${req.protocol}://${req.get("host")}/api/songs/custom/cover/${song._id}` : null,
    }));

    res.json(songsWithUrls);
  } catch (error) {
    console.error("Error fetching trending songs:", error);
    res.status(500).json({ error: "Failed to fetch trending songs" });
  }
});

// GET /api/songs/custom/:id — Single song for users
router.get("/songs/custom/:id", async (req, res) => {
  try {
    const song = await CustomSong.findOne({ _id: req.params.id, is_active: 1, apiStatus: "Published" }).select("title artist album genre releaseDate duration description coverImagePath audioFilePath playCount");
    if (!song) return res.status(404).json({ error: "Song not found" });

    const songWithUrls = {
      ...song.toObject(),
      audioUrl: `${req.protocol}://${req.get("host")}/api/songs/custom/stream/${song._id}`,
      coverUrl: song.coverImagePath ? `${req.protocol}://${req.get("host")}/api/songs/custom/cover/${song._id}` : null,
    };
    res.json(songWithUrls);
  } catch (error) {
    console.error("Error fetching custom song:", error);
    res.status(500).json({ error: "Failed to fetch song" });
  }
});

// GET /api/debug/custom-songs — Debug endpoint
router.get("/debug/custom-songs", async (req, res) => {
  try {
    const allSongs = await CustomSong.find({});
    const activeSongs = await CustomSong.find({ is_active: 1 });
    const publishedSongs = await CustomSong.find({ is_active: 1, apiStatus: "Published" });

    res.json({
      total: allSongs.length,
      active: activeSongs.length,
      published: publishedSongs.length,
      songs: publishedSongs.slice(0, 3).map((song) => ({
        id: song._id,
        title: song.title,
        artist: song.artist,
        audioFilePath: song.audioFilePath,
        is_active: song.is_active,
        apiStatus: song.apiStatus,
        audioUrl: `${req.protocol}://${req.get("host")}/api/songs/custom/stream/${song._id}`,
        coverUrl: song.coverImagePath ? `${req.protocol}://${req.get("host")}/api/songs/custom/cover/${song._id}` : null,
      })),
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
