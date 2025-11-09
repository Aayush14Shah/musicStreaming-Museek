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
import Admin from "./models/admin.js";
import CustomSong from "./models/CustomSong.js";
import Like from "./models/Like.js";
import Playlist from "./models/Playlist.js";
import PlaylistSong from "./models/PlaylistSong.js";
import multer from "multer";
import path from "path";
import fs from "fs";

dotenv.config();
await connectDB();

// Initializing app
const app = express();

app.use(cors()); // lets your React app call this API
app.use(express.json()); // parse JSON bodies if you send POST/PUT later

// Create uploads directories if they don't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
const audioDir = path.join(uploadsDir, 'audio');
const imagesDir = path.join(uploadsDir, 'images');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir);
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audioFile') {
      cb(null, audioDir);
    } else if (file.fieldname === 'coverImage') {
      cb(null, imagesDir);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audioFile') {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed for audioFile'), false);
    }
  } else if (file.fieldname === 'coverImage') {
    // Accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for coverImage'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for audio files
  }
});

console.log("CLIENT ID:", process.env.SPOTIFY_CLIENT_ID);
console.log("CLIENT SECRET:", process.env.SPOTIFY_CLIENT_SECRET);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: 'Welcome to Museek API. Use /api endpoints like /api/new-releases.' });
});

// ==================== CUSTOM SONGS CRUD API ====================

// Search custom songs for audio playback
app.get("/api/custom-songs/search", async (req, res) => {
  try {
    const { query, limit = 5 } = req.query;
    
    if (!query) {
      return res.json({ songs: [] });
    }
    
    // Create search regex for title and artist
    const searchRegex = new RegExp(query.split(' ').join('|'), 'i');
    
    const songs = await CustomSong.find({
      is_active: 1,
      apiStatus: 'Published',
      $or: [
        { title: searchRegex },
        { artist: searchRegex },
        { album: searchRegex }
      ]
    })
    .select('title artist album audioFileName coverImageName duration')
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });
    
    // Add full URLs for audio files
    const songsWithUrls = songs.map(song => ({
      ...song.toObject(),
      audioUrl: `/uploads/audio/${song.audioFileName}`,
      coverUrl: song.coverImageName ? `/uploads/images/${song.coverImageName}` : null
    }));
    
    console.log(`🔍 Custom song search for "${query}": ${songsWithUrls.length} results`);
    res.json({ songs: songsWithUrls });
  } catch (error) {
    console.error('Error searching custom songs:', error);
    res.status(500).json({ error: "Failed to search custom songs" });
  }
});

// Get all custom songs with pagination and search
app.get("/api/custom-songs", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const genre = req.query.genre || '';

    // Build filter object - no is_active filter, show all songs
    let filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } },
        { album: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.apiStatus = status;
    }

    if (genre) {
      filter.genre = { $regex: genre, $options: 'i' };
    }

    const songs = await CustomSong.find(filter)
      .populate('uploadedBy', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CustomSong.countDocuments(filter);

    res.json({
      songs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching custom songs:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// GET single custom song by ID
app.get("/api/custom-songs/:id", async (req, res) => {
  try {
    const song = await CustomSong.findOne({ 
      _id: req.params.id, 
      is_active: 1 
    }).populate('uploadedBy', 'email');

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json(song);
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({ error: 'Failed to fetch song' });
  }
});

// POST create new custom song
app.post("/api/custom-songs", upload.fields([
  { name: 'audioFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      title,
      artist,
      album,
      genre,
      releaseDate,
      duration,
      description,
      uploadedBy
    } = req.body;

    // Check if audio file was uploaded
    if (!req.files || !req.files.audioFile) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const audioFile = req.files.audioFile[0];
    const coverImage = req.files.coverImage ? req.files.coverImage[0] : null;

    // Create new song document
    const newSong = new CustomSong({
      title,
      artist,
      album,
      genre,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
      duration,
      description,
      audioFilePath: audioFile.path,
      audioFileName: audioFile.filename,
      coverImagePath: coverImage ? coverImage.path : null,
      coverImageName: coverImage ? coverImage.filename : null,
      fileSize: audioFile.size,
      mimeType: audioFile.mimetype,
      uploadedBy: uploadedBy || '507f1f77bcf86cd799439011', // Default admin ID (you should pass real admin ID)
      apiStatus: 'Published' // Set as published by default
    });

    const savedSong = await newSong.save();
    
    // Populate the uploadedBy field for response
    await savedSong.populate('uploadedBy', 'email');

    console.log(` New song uploaded: "${title}" by ${artist}`);
    res.status(201).json(savedSong);
  } catch (error) {
    console.error('Error creating song:', error);
    
    // Clean up uploaded files if database save failed
    if (req.files) {
      if (req.files.audioFile) {
        fs.unlink(req.files.audioFile[0].path, () => {});
      }
      if (req.files.coverImage) {
        fs.unlink(req.files.coverImage[0].path, () => {});
      }
    }
    
    res.status(500).json({ error: 'Failed to create song' });
  }
});

// PUT update custom song
app.put("/api/custom-songs/:id", async (req, res) => {
  try {
    const {
      title,
      artist,
      album,
      genre,
      releaseDate,
      duration,
      description,
      apiStatus
    } = req.body;

    const updateData = {
      title,
      artist,
      album,
      genre,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
      duration,
      description,
      apiStatus
    };

    const updatedSong = await CustomSong.findOneAndUpdate(
      { _id: req.params.id, is_active: 1 },
      updateData,
      { new: true }
    ).populate('uploadedBy', 'email');

    if (!updatedSong) {
      return res.status(404).json({ error: 'Song not found' });
    }

    console.log(` Song updated: "${updatedSong.title}" by ${updatedSong.artist}`);
    res.json(updatedSong);
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ error: 'Failed to update song' });
  }
});

// PATCH toggle song active status (activate/deactivate)
app.patch("/api/custom-songs/:id/toggle-status", async (req, res) => {
  try {
    const song = await CustomSong.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Toggle the is_active status
    const newStatus = song.is_active === 1 ? 0 : 1;
    
    const updatedSong = await CustomSong.findByIdAndUpdate(
      req.params.id,
      { is_active: newStatus },
      { new: true }
    ).populate('uploadedBy', 'email');

    const statusText = newStatus === 1 ? 'activated' : 'deactivated';
    console.log(`🔄 Song ${statusText}: "${updatedSong.title}" by ${updatedSong.artist}`);
    
    res.json({ 
      message: `Song ${statusText} successfully`,
      song: updatedSong 
    });
  } catch (error) {
    console.error('Error toggling song status:', error);
    res.status(500).json({ error: 'Failed to toggle song status' });
  }
});

// GET song statistics for admin dashboard
app.get("/api/custom-songs/stats/overview", async (req, res) => {
  try {
    // Count ALL songs in custom_songs table (for dashboard total)
    const totalSongs = await CustomSong.countDocuments({});
    
    // Count active songs only (for detailed stats)
    const activeSongs = await CustomSong.countDocuments({ is_active: 1 });
    const inactiveSongs = await CustomSong.countDocuments({ is_active: 0 });
    
    // Count by API status (active songs only)
    const publishedSongs = await CustomSong.countDocuments({ is_active: 1, apiStatus: 'Published' });
    const draftSongs = await CustomSong.countDocuments({ is_active: 1, apiStatus: 'Draft' });
    const errorSongs = await CustomSong.countDocuments({ is_active: 1, apiStatus: 'Error' });

    // Get genre distribution (all songs)
    const genreStats = await CustomSong.aggregate([
      { $match: {} }, // Include all songs for genre distribution
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalSongs, // All songs in custom_songs table
      activeSongs,
      inactiveSongs,
      publishedSongs,
      draftSongs,
      errorSongs,
      genreDistribution: genreStats
    });
  } catch (error) {
    console.error('Error fetching song stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ==================== USER-FACING CUSTOM SONGS API ====================

// GET all active custom songs for users (public endpoint)
app.get("/api/songs/custom", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const genre = req.query.genre || '';

    // Build filter - only show active songs to users
    let filter = { is_active: 1, apiStatus: 'Published' };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } },
        { album: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre) {
      filter.genre = { $regex: genre, $options: 'i' };
    }

    const songs = await CustomSong.find(filter)
      .select('title artist album genre releaseDate duration description coverImagePath audioFilePath playCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CustomSong.countDocuments(filter);

    // Add full URLs for file access
    const songsWithUrls = songs.map(song => ({
      ...song.toObject(),
      audioUrl: `${req.protocol}://${req.get('host')}/api/songs/custom/stream/${song._id}`,
      coverUrl: song.coverImagePath ? `${req.protocol}://${req.get('host')}/api/songs/custom/cover/${song._id}` : null
    }));

    res.json({
      songs: songsWithUrls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching custom songs for users:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// GET single custom song for users
app.get("/api/songs/custom/:id", async (req, res) => {
  try {
    const song = await CustomSong.findOne({ 
      _id: req.params.id, 
      is_active: 1, 
      apiStatus: 'Published' 
    }).select('title artist album genre releaseDate duration description coverImagePath audioFilePath playCount');

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Add full URLs
    const songWithUrls = {
      ...song.toObject(),
      audioUrl: `${req.protocol}://${req.get('host')}/api/songs/custom/stream/${song._id}`,
      coverUrl: song.coverImagePath ? `${req.protocol}://${req.get('host')}/api/songs/custom/cover/${song._id}` : null
    };

    res.json(songWithUrls);
  } catch (error) {
    console.error('Error fetching custom song:', error);
    res.status(500).json({ error: 'Failed to fetch song' });
  }
});

// Stream audio file for users
app.get("/api/songs/custom/stream/:id", async (req, res) => {
  try {
    const song = await CustomSong.findOne({ 
      _id: req.params.id, 
      is_active: 1, 
      apiStatus: 'Published' 
    });

    if (!song || !song.audioFilePath) {
      return res.status(404).json({ error: 'Audio file not found' });
    }

    // Handle both relative and absolute paths
    const audioPath = path.isAbsolute(song.audioFilePath) 
      ? song.audioFilePath 
      : path.join(__dirname, song.audioFilePath);
    
    console.log('🎵 Streaming request for:', {
      songId: req.params.id,
      title: song.title,
      audioPath: audioPath,
      fileExists: fs.existsSync(audioPath)
    });
    
    // Check if file exists
    if (!fs.existsSync(audioPath)) {
      console.error('❌ Audio file not found:', audioPath);
      return res.status(404).json({ error: 'Audio file not found on server' });
    }

    // Get file stats for streaming
    const stat = fs.statSync(audioPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Determine content type based on file extension
    const ext = path.extname(audioPath).toLowerCase();
    let contentType = 'audio/mpeg';
    if (ext === '.wav') contentType = 'audio/wav';
    if (ext === '.flac') contentType = 'audio/flac';
    if (ext === '.ogg') contentType = 'audio/ogg';
    if (ext === '.m4a') contentType = 'audio/mp4';

    if (range) {
      // Handle range requests for audio streaming
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(audioPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Range'
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Send entire file
      const head = {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Range'
      };
      res.writeHead(200, head);
      fs.createReadStream(audioPath).pipe(res);
    }

    // Increment play count
    await CustomSong.findByIdAndUpdate(req.params.id, { 
      $inc: { playCount: 1 },
      lastPlayed: new Date()
    });

  } catch (error) {
    console.error('Error streaming audio:', error);
    res.status(500).json({ error: 'Failed to stream audio' });
  }
});

// Get cover image for users
app.get("/api/songs/custom/cover/:id", async (req, res) => {
  try {
    const song = await CustomSong.findOne({ 
      _id: req.params.id, 
      is_active: 1, 
      apiStatus: 'Published' 
    });

    if (!song || !song.coverImagePath) {
      return res.status(404).json({ error: 'Cover image not found' });
    }

    // Handle both relative and absolute paths
    const imagePath = path.isAbsolute(song.coverImagePath) 
      ? song.coverImagePath 
      : path.join(__dirname, song.coverImagePath);
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Cover image not found on server' });
    }

    // Set appropriate content type based on file extension
    const ext = path.extname(imagePath).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    if (ext === '.webp') contentType = 'image/webp';

    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
    });

    fs.createReadStream(imagePath).pipe(res);
  } catch (error) {
    console.error('Error serving cover image:', error);
    res.status(500).json({ error: 'Failed to serve cover image' });
  }
});

// Get custom songs by genre for users
app.get("/api/songs/custom/genre/:genre", async (req, res) => {
  try {
    const { genre } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const songs = await CustomSong.find({ 
      genre: { $regex: genre, $options: 'i' },
      is_active: 1, 
      apiStatus: 'Published' 
    })
    .select('title artist album genre coverImagePath')
    .limit(limit)
    .sort({ playCount: -1 });

    const songsWithUrls = songs.map(song => ({
      ...song.toObject(),
      audioUrl: `${req.protocol}://${req.get('host')}/api/songs/custom/stream/${song._id}`,
      coverUrl: song.coverImagePath ? `${req.protocol}://${req.get('host')}/api/songs/custom/cover/${song._id}` : null
    }));

    res.json(songsWithUrls);
  } catch (error) {
    console.error('Error fetching songs by genre:', error);
    res.status(500).json({ error: 'Failed to fetch songs by genre' });
  }
});

// Get trending custom songs for users
app.get("/api/songs/custom/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const songs = await CustomSong.find({ 
      is_active: 1, 
      apiStatus: 'Published' 
    })
    .select('title artist album genre coverImagePath playCount')
    .sort({ playCount: -1, createdAt: -1 })
    .limit(limit);

    const songsWithUrls = songs.map(song => ({
      ...song.toObject(),
      audioUrl: `${req.protocol}://${req.get('host')}/api/songs/custom/stream/${song._id}`,
      coverUrl: song.coverImagePath ? `${req.protocol}://${req.get('host')}/api/songs/custom/cover/${song._id}` : null
    }));

    res.json(songsWithUrls);
  } catch (error) {
    console.error('Error fetching trending songs:', error);
    res.status(500).json({ error: 'Failed to fetch trending songs' });
  }
});

// Debug endpoint to check if songs exist
app.get("/api/debug/custom-songs", async (req, res) => {
  try {
    const allSongs = await CustomSong.find({});
    const activeSongs = await CustomSong.find({ is_active: 1 });
    const publishedSongs = await CustomSong.find({ is_active: 1, apiStatus: 'Published' });
    
    console.log('📊 Custom Songs Debug:', {
      total: allSongs.length,
      active: activeSongs.length,
      published: publishedSongs.length
    });

    if (allSongs.length > 0) {
      console.log('📝 Sample song:', {
        title: allSongs[0].title,
        audioFilePath: allSongs[0].audioFilePath,
        is_active: allSongs[0].is_active,
        apiStatus: allSongs[0].apiStatus
      });
    }

    res.json({
      total: allSongs.length,
      active: activeSongs.length,
      published: publishedSongs.length,
      songs: publishedSongs.slice(0, 3).map(song => ({
        id: song._id,
        title: song.title,
        artist: song.artist,
        audioFilePath: song.audioFilePath,
        is_active: song.is_active,
        apiStatus: song.apiStatus,
        audioUrl: `${req.protocol}://${req.get('host')}/api/songs/custom/stream/${song._id}`,
        coverUrl: song.coverImagePath ? `${req.protocol}://${req.get('host')}/api/songs/custom/cover/${song._id}` : null
      }))
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ANALYTICS API ENDPOINTS ====================

// Get comprehensive analytics data for admin dashboard
app.get("/api/analytics/overview", async (req, res) => {
  try {
    // User Analytics
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ is_active: 1 });
    const inactiveUsers = await User.countDocuments({ is_active: 0 });
    
    // User registration trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const userTrends = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Custom Songs Analytics - More inclusive queries
    const totalCustomSongs = await CustomSong.countDocuments({});
    const publishedSongs = await CustomSong.countDocuments({ apiStatus: 'Published' });
    const draftSongs = await CustomSong.countDocuments({ apiStatus: 'Draft' });
    const errorSongs = await CustomSong.countDocuments({ apiStatus: 'Error' });
    
    // Most popular custom songs - include all songs, not just active ones
    const popularSongs = await CustomSong.find({})
      .sort({ playCount: -1 })
      .limit(10)
      .select('title artist playCount apiStatus is_active');

    // Songs upload trends (last 6 months)
    const songUploadTrends = await CustomSong.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Admin Activity Analytics - include all songs
    const songsPerAdmin = await CustomSong.aggregate([
      { $match: {} }, // Include all songs
      {
        $group: {
          _id: "$uploadedBy",
          songCount: { $sum: 1 }
        }
      },
      { $sort: { songCount: -1 } },
      { $limit: 10 }
    ]);

    // Genre distribution - include all songs
    const genreDistribution = await CustomSong.aggregate([
      { $match: {} }, // Include all songs
      {
        $group: {
          _id: "$genre",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUploads = await CustomSong.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo }
    });
    
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });

    // Storage analytics
    const storageStats = await CustomSong.aggregate([
      { $match: { is_active: 1 } },
      {
        $group: {
          _id: null,
          totalSongs: { $sum: 1 },
          // Estimate average file size (you can make this more accurate by storing actual file sizes)
          estimatedStorage: { $sum: 1 } // This will be multiplied by average file size in frontend
        }
      }
    ]);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        trends: userTrends
      },
      customSongs: {
        total: totalCustomSongs,
        published: publishedSongs,
        draft: draftSongs,
        error: errorSongs,
        popular: popularSongs,
        uploadTrends: songUploadTrends
      },
      admins: {
        songsPerAdmin: songsPerAdmin
      },
      genres: genreDistribution,
      recentActivity: {
        newSongs: recentUploads,
        newUsers: recentUsers
      },
      storage: {
        totalSongs: storageStats[0]?.totalSongs || 0,
        estimatedSizeMB: (storageStats[0]?.totalSongs || 0) * 5 // Assuming 5MB average per song
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get detailed user analytics
app.get("/api/analytics/users", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ is_active: 1 });
    const inactiveUsers = await User.countDocuments({ is_active: 0 });
    
    // Daily user registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    res.json({
      summary: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers
      },
      dailyRegistrations
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// Get detailed custom songs analytics
app.get("/api/analytics/songs", async (req, res) => {
  try {
    const totalSongs = await CustomSong.countDocuments({});
    const activeSongs = await CustomSong.countDocuments({ is_active: 1 });
    const publishedSongs = await CustomSong.countDocuments({ apiStatus: 'Published', is_active: 1 });
    const draftSongs = await CustomSong.countDocuments({ apiStatus: 'Draft', is_active: 1 });
    
    // Top 10 most played songs
    const topSongs = await CustomSong.find({ is_active: 1 })
      .sort({ playCount: -1 })
      .limit(10)
      .select('title artist playCount genre');

    // Genre distribution
    const genres = await CustomSong.aggregate([
      { $match: { is_active: 1 } },
      {
        $group: {
          _id: "$genre",
          count: { $sum: 1 },
          totalPlays: { $sum: "$playCount" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Upload trends (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const uploadTrends = await CustomSong.aggregate([
      { $match: { createdAt: { $gte: threeMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({
      summary: {
        total: totalSongs,
        active: activeSongs,
        published: publishedSongs,
        draft: draftSongs
      },
      topSongs,
      genres,
      uploadTrends
    });
  } catch (error) {
    console.error('Error fetching songs analytics:', error);
    res.status(500).json({ error: 'Failed to fetch songs analytics' });
  }
});

// ==================== SETTINGS API ====================

// In-memory settings store (in production, use database)
let appSettings = {
  maxFileSize: 50,
  allowedFormats: ['MP3', 'WAV', 'FLAC'],
  allowRegistration: true,
  maxPlaylistsPerUser: 50,
  sessionTimeout: 24,
  enableAuditLogs: true
};

// Audit logs storage (in production, use database)
let auditLogs = [];

// Initialize with some sample logs for demonstration
const initializeSampleLogs = () => {
  const sampleLogs = [
    {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      adminId: 'admin_001',
      action: 'SERVER_STARTED',
      details: 'Museek server started successfully',
      ip: 'localhost'
    },
    {
      id: (Date.now() - 60000).toString(),
      timestamp: new Date(Date.now() - 60000).toISOString(),
      adminId: 'admin_001',
      action: 'SETTINGS_INITIALIZED',
      details: 'Default settings loaded',
      ip: 'localhost'
    }
  ];
  
  auditLogs.push(...sampleLogs);
};

// Initialize sample logs
initializeSampleLogs();

// Add sample listening hours to existing users (for demonstration)
const addSampleListeningHours = async () => {
  try {
    const users = await User.find({ listeningHours: { $exists: false } }).limit(10);
    
    for (const user of users) {
      const randomHours = Math.floor(Math.random() * 100) + 10; // 10-110 hours
      await User.findByIdAndUpdate(user._id, { listeningHours: randomHours });
    }
    
    if (users.length > 0) {
      console.log(`📊 Added sample listening hours to ${users.length} users`);
    }
  } catch (error) {
    console.log('Sample listening hours initialization skipped');
  }
};

// Initialize sample data after a short delay
setTimeout(addSampleListeningHours, 2000);

// Get current settings
app.get("/api/settings", (req, res) => {
  res.json(appSettings);
});

// Helper function to log admin actions
const logAuditAction = (action, details, adminId = 'system') => {
  if (appSettings.enableAuditLogs) {
    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      adminId,
      action,
      details,
      ip: 'localhost' // In production, get from req.ip
    };
    
    auditLogs.unshift(logEntry); // Add to beginning
    
    // Keep only last 1000 logs (prevent memory overflow)
    if (auditLogs.length > 1000) {
      auditLogs = auditLogs.slice(0, 1000);
    }
    
    console.log('📋 Audit Log:', action, details);
  }
};

// Update settings
app.post("/api/settings", (req, res) => {
  try {
    const oldSettings = { ...appSettings };
    appSettings = { ...appSettings, ...req.body };
    
    // Log the settings change
    const changes = [];
    Object.keys(req.body).forEach(key => {
      if (JSON.stringify(oldSettings[key]) !== JSON.stringify(req.body[key])) {
        changes.push(`${key}: ${JSON.stringify(oldSettings[key])} → ${JSON.stringify(req.body[key])}`);
      }
    });
    
    if (changes.length > 0) {
      logAuditAction('SETTINGS_UPDATED', changes.join(', '));
    }
    
    console.log('⚙️ Settings updated:', appSettings);
    
    // Apply file upload settings immediately
    if (req.body.maxFileSize) {
      console.log(`📁 Max file size updated to: ${req.body.maxFileSize}MB`);
    }
    if (req.body.allowedFormats) {
      console.log(`🎵 Allowed formats updated to: ${req.body.allowedFormats.join(', ')}`);
    }
    
    res.json({ success: true, settings: appSettings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Check if registration is allowed (used by signup endpoint)
app.get("/api/registration-status", (req, res) => {
  res.json({ 
    allowRegistration: appSettings.allowRegistration
  });
});

// Get current file upload settings (for validation)
app.get("/api/upload-settings", (req, res) => {
  res.json({
    maxFileSize: appSettings.maxFileSize,
    allowedFormats: appSettings.allowedFormats
  });
});

// Get audit logs
app.get("/api/audit-logs", (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  
  const paginatedLogs = auditLogs.slice(offset, offset + limit);
  
  res.json({
    logs: paginatedLogs,
    total: auditLogs.length,
    hasMore: offset + limit < auditLogs.length
  });
});

// Get total listening hours across all users
app.get("/api/listening-hours/total", async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $group: {
          _id: null,
          totalHours: { $sum: "$listeningHours" }
        }
      }
    ]);
    
    const totalHours = result.length > 0 ? result[0].totalHours : 0;
    res.json({ totalHours });
  } catch (error) {
    console.error('Error fetching total listening hours:', error);
    res.status(500).json({ error: 'Failed to fetch listening hours' });
  }
});

// Update user listening hours (for future use when tracking actual listening)
app.post("/api/users/:id/listening-hours", async (req, res) => {
  try {
    const { hours } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $inc: { listeningHours: hours } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ message: "Listening hours updated", totalHours: user.listeningHours });
  } catch (error) {
    console.error('Error updating listening hours:', error);
    res.status(500).json({ error: "Failed to update listening hours" });
  }
});

// ==================== LIKES API ====================

// Like a song
app.post("/api/likes", async (req, res) => {
  try {
    const { userId, songId, songType, songTitle, songArtist, songAlbum, songImage, songPreviewUrl, spotifyUri, customSongPath } = req.body;
    
    // Validate required fields
    if (!userId || !songId || !songType || !songTitle || !songArtist) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Check if already liked
    const existingLike = await Like.findOne({ userId, songId, songType });
    if (existingLike) {
      return res.status(409).json({ error: "Song already liked" });
    }
    
    const like = new Like({
      userId,
      songId,
      songType,
      songTitle,
      songArtist,
      songAlbum: songAlbum || 'Unknown Album',
      songImage,
      songPreviewUrl,
      spotifyUri,
      customSongPath
    });
    
    await like.save();
    console.log(`❤️ User ${userId} liked: "${songTitle}" by ${songArtist}`);
    
    res.status(201).json({ message: "Song liked successfully", like });
  } catch (error) {
    console.error('Error liking song:', error);
    res.status(500).json({ error: "Failed to like song" });
  }
});

// Unlike a song
app.delete("/api/likes", async (req, res) => {
  try {
    const { userId, songId, songType } = req.body;
    
    if (!userId || !songId || !songType) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const like = await Like.findOneAndDelete({ userId, songId, songType });
    
    if (!like) {
      return res.status(404).json({ error: "Like not found" });
    }
    
    console.log(`💔 User ${userId} unliked: "${like.songTitle}" by ${like.songArtist}`);
    res.json({ message: "Song unliked successfully" });
  } catch (error) {
    console.error('Error unliking song:', error);
    res.status(500).json({ error: "Failed to unlike song" });
  }
});

// Get user's liked songs
app.get("/api/likes/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, songType } = req.query;
    
    const query = { userId };
    if (songType) {
      query.songType = songType;
    }
    
    const likes = await Like.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Like.countDocuments(query);
    
    res.json({
      likes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching liked songs:', error);
    res.status(500).json({ error: "Failed to fetch liked songs" });
  }
});

// Check if a song is liked by user
app.get("/api/likes/check/:userId/:songId/:songType", async (req, res) => {
  try {
    const { userId, songId, songType } = req.params;
    
    const like = await Like.findOne({ userId, songId, songType });
    
    res.json({ isLiked: !!like });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ error: "Failed to check like status" });
  }
});

// Get like statistics
app.get("/api/likes/stats/overview", async (req, res) => {
  try {
    const totalLikes = await Like.countDocuments();
    const spotifyLikes = await Like.countDocuments({ songType: 'spotify' });
    const customLikes = await Like.countDocuments({ songType: 'custom' });
    
    // Most liked songs
    const mostLikedSongs = await Like.aggregate([
      {
        $group: {
          _id: { songId: "$songId", songType: "$songType" },
          count: { $sum: 1 },
          songTitle: { $first: "$songTitle" },
          songArtist: { $first: "$songArtist" },
          songAlbum: { $first: "$songAlbum" },
          songImage: { $first: "$songImage" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Users with most likes
    const topUsers = await Like.aggregate([
      {
        $group: {
          _id: "$userId",
          likeCount: { $sum: 1 }
        }
      },
      { $sort: { likeCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "Registered_Users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $project: {
          userId: "$_id",
          likeCount: 1,
          userName: { $arrayElemAt: ["$user.name", 0] }
        }
      }
    ]);
    
    res.json({
      totalLikes,
      spotifyLikes,
      customLikes,
      mostLikedSongs,
      topUsers
    });
  } catch (error) {
    console.error('Error fetching like statistics:', error);
    res.status(500).json({ error: "Failed to fetch like statistics" });
  }
});

// ==================== PLAYLIST API ====================

// Create a new playlist
app.post("/api/playlists", async (req, res) => {
  try {
    const { name, description, userId, isPublic } = req.body;
    
    if (!name || !userId) {
      return res.status(400).json({ error: "Name and userId are required" });
    }
    
    // Check if playlist name already exists for this user
    const existingPlaylist = await Playlist.findOne({ userId, name, is_active: 1 });
    if (existingPlaylist) {
      return res.status(409).json({ error: "Playlist name already exists" });
    }
    
    const playlist = new Playlist({
      name: name.trim(),
      description: description?.trim() || '',
      userId,
      isPublic: isPublic || false
    });
    
    await playlist.save();
    console.log(`🎵 User ${userId} created playlist: "${name}"`);
    
    res.status(201).json({ message: "Playlist created successfully", playlist });
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: "Failed to create playlist" });
  }
});

// Get user's playlists
app.get("/api/playlists/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const playlists = await Playlist.find({ userId, is_active: 1 })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Playlist.countDocuments({ userId, is_active: 1 });
    
    res.json({
      playlists,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching user playlists:', error);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

// Get single playlist with songs
app.get("/api/playlists/:playlistId", async (req, res) => {
  try {
    const { playlistId } = req.params;
    
    const playlist = await Playlist.findById(playlistId);
    if (!playlist || playlist.is_active === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    
    const songs = await PlaylistSong.find({ playlistId })
      .sort({ position: 1, createdAt: 1 });
    
    res.json({ playlist, songs });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({ error: "Failed to fetch playlist" });
  }
});

// Update playlist
app.put("/api/playlists/:playlistId", async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { name, description, isPublic } = req.body;
    
    const playlist = await Playlist.findById(playlistId);
    if (!playlist || playlist.is_active === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    
    // Check if new name conflicts with existing playlists
    if (name && name !== playlist.name) {
      const existingPlaylist = await Playlist.findOne({ 
        userId: playlist.userId, 
        name: name.trim(), 
        is_active: 1,
        _id: { $ne: playlistId }
      });
      if (existingPlaylist) {
        return res.status(409).json({ error: "Playlist name already exists" });
      }
    }
    
    if (name) playlist.name = name.trim();
    if (description !== undefined) playlist.description = description.trim();
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    
    await playlist.save();
    
    res.json({ message: "Playlist updated successfully", playlist });
  } catch (error) {
    console.error('Error updating playlist:', error);
    res.status(500).json({ error: "Failed to update playlist" });
  }
});

// Delete playlist
app.delete("/api/playlists/:playlistId", async (req, res) => {
  try {
    const { playlistId } = req.params;
    
    const playlist = await Playlist.findById(playlistId);
    if (!playlist || playlist.is_active === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    
    // Soft delete playlist
    playlist.is_active = 0;
    await playlist.save();
    
    // Also remove all songs from playlist
    await PlaylistSong.deleteMany({ playlistId });
    
    console.log(`🗑️ Playlist "${playlist.name}" deleted`);
    res.json({ message: "Playlist deleted successfully" });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ error: "Failed to delete playlist" });
  }
});

// Add song to playlist
app.post("/api/playlists/:playlistId/songs", async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { songId, songType, songTitle, songArtist, songAlbum, songImage, songPreviewUrl, songDuration, spotifyUri, customSongPath, addedBy } = req.body;
    
    if (!songId || !songType || !songTitle || !songArtist || !addedBy) {
      return res.status(400).json({ error: "Missing required song fields" });
    }
    
    const playlist = await Playlist.findById(playlistId);
    if (!playlist || playlist.is_active === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    
    // Check if song already exists in playlist
    const existingSong = await PlaylistSong.findOne({ playlistId, songId, songType });
    if (existingSong) {
      return res.status(409).json({ error: "Song already in playlist" });
    }
    
    // Get next position
    const lastSong = await PlaylistSong.findOne({ playlistId }).sort({ position: -1 });
    const position = lastSong ? lastSong.position + 1 : 1;
    
    const playlistSong = new PlaylistSong({
      playlistId,
      songId,
      songType,
      songTitle,
      songArtist,
      songAlbum: songAlbum || 'Unknown Album',
      songImage,
      songPreviewUrl,
      songDuration: songDuration || 0,
      spotifyUri,
      customSongPath,
      addedBy,
      position
    });
    
    await playlistSong.save();
    
    // Update playlist stats
    playlist.songCount += 1;
    playlist.totalDuration += (songDuration || 0);
    await playlist.save();
    
    console.log(`🎵 Added "${songTitle}" to playlist "${playlist.name}"`);
    res.status(201).json({ message: "Song added to playlist", playlistSong });
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(500).json({ error: "Failed to add song to playlist" });
  }
});

// Remove song from playlist
app.delete("/api/playlists/:playlistId/songs/:songId/:songType", async (req, res) => {
  try {
    const { playlistId, songId, songType } = req.params;
    
    const playlist = await Playlist.findById(playlistId);
    if (!playlist || playlist.is_active === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    
    const playlistSong = await PlaylistSong.findOneAndDelete({ playlistId, songId, songType });
    if (!playlistSong) {
      return res.status(404).json({ error: "Song not found in playlist" });
    }
    
    // Update playlist stats
    playlist.songCount = Math.max(0, playlist.songCount - 1);
    playlist.totalDuration = Math.max(0, playlist.totalDuration - (playlistSong.songDuration || 0));
    await playlist.save();
    
    // Reorder remaining songs
    await PlaylistSong.updateMany(
      { playlistId, position: { $gt: playlistSong.position } },
      { $inc: { position: -1 } }
    );
    
    console.log(`🗑️ Removed "${playlistSong.songTitle}" from playlist "${playlist.name}"`);
    res.json({ message: "Song removed from playlist" });
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    res.status(500).json({ error: "Failed to remove song from playlist" });
  }
});

// Reorder songs in playlist
app.put("/api/playlists/:playlistId/songs/reorder", async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { songUpdates } = req.body; // Array of {songId, songType, newPosition}
    
    const playlist = await Playlist.findById(playlistId);
    if (!playlist || playlist.is_active === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    
    // Update positions
    for (const update of songUpdates) {
      await PlaylistSong.findOneAndUpdate(
        { playlistId, songId: update.songId, songType: update.songType },
        { position: update.newPosition }
      );
    }
    
    res.json({ message: "Playlist order updated" });
  } catch (error) {
    console.error('Error reordering playlist:', error);
    res.status(500).json({ error: "Failed to reorder playlist" });
  }
});

// Get playlists containing a specific song
app.get("/api/songs/:songId/:songType/playlists", async (req, res) => {
  try {
    const { songId, songType } = req.params;
    const { userId } = req.query;
    
    let query = { songId, songType };
    if (userId) {
      // Get user's playlists containing this song
      const userPlaylists = await Playlist.find({ userId, is_active: 1 }).select('_id');
      const playlistIds = userPlaylists.map(p => p._id);
      query.playlistId = { $in: playlistIds };
    }
    
    const playlistSongs = await PlaylistSong.find(query).populate('playlistId');
    const playlists = playlistSongs.map(ps => ps.playlistId).filter(p => p && p.is_active === 1);
    
    res.json({ playlists });
  } catch (error) {
    console.error('Error fetching song playlists:', error);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

// Get playlist statistics
app.get("/api/playlists/stats/overview", async (req, res) => {
  try {
    const totalPlaylists = await Playlist.countDocuments({ is_active: 1 });
    const publicPlaylists = await Playlist.countDocuments({ is_active: 1, isPublic: true });
    const totalSongs = await PlaylistSong.countDocuments();
    
    // Most popular playlists (by song count)
    const popularPlaylists = await Playlist.find({ is_active: 1, isPublic: true })
      .sort({ songCount: -1 })
      .limit(10)
      .populate('userId', 'name');
    
    // Users with most playlists
    const topPlaylistCreators = await Playlist.aggregate([
      { $match: { is_active: 1 } },
      {
        $group: {
          _id: "$userId",
          playlistCount: { $sum: 1 },
          totalSongs: { $sum: "$songCount" }
        }
      },
      { $sort: { playlistCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "Registered_Users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $project: {
          userId: "$_id",
          playlistCount: 1,
          totalSongs: 1,
          userName: { $arrayElemAt: ["$user.name", 0] }
        }
      }
    ]);
    
    res.json({
      totalPlaylists,
      publicPlaylists,
      totalSongs,
      popularPlaylists,
      topPlaylistCreators
    });
  } catch (error) {
    console.error('Error fetching playlist statistics:', error);
    res.status(500).json({ error: "Failed to fetch playlist statistics" });
  }
});

// ==================== END PLAYLIST API ====================

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
            console.log(` Found preview in ${market} market: ${altData.preview_url}`);
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
      console.log(` Using original Spotify preview: ${data.preview_url}`);
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
          thumbnail: bestMatch.thumbnails?.[0]?.url
        });
      }
      // No alternative found in YouTube Music
      return res.json({
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
   
    // outer catch
  } catch (error) {
    console.error("❌ Alternative-audio endpoint error:", error.message);
    res.status(500).json({
      error: "Failed to search for alternative audio (outer)",
      message: error.message
    });
  }
});

// Helper function to check yt-dlp version and provide update instructions
const checkYtDlpVersion = async () => {
  try {
    const versionInfo = await ytdlp('--version');
    console.log('📦 yt-dlp version:', versionInfo);
    return versionInfo;
  } catch (error) {
    console.log('❌ Could not get yt-dlp version:', error.message);
    return null;
  }
};

// Endpoint to check yt-dlp status and provide update instructions
app.get("/api/youtube/status", async (req, res) => {
  try {
    const version = await checkYtDlpVersion();
    
    res.json({
      status: 'operational',
      version: version,
      updateInstructions: {
        windows: 'pip install --upgrade yt-dlp',
        linux: 'pip install --upgrade yt-dlp',
        mac: 'pip install --upgrade yt-dlp',
        npm: 'npm update yt-dlp-exec'
      },
      troubleshooting: [
        'YouTube frequently updates their API, requiring yt-dlp updates',
        'Try updating yt-dlp to the latest version',
        'Some videos may be geo-blocked or have restricted access',
        'Consider using custom songs for offline functionality'
      ]
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      recommendation: 'Update yt-dlp or use custom songs for reliable audio'
    });
  }
});

// YouTube preview endpoint - 
app.get("/api/youtube/preview", async (req, res) => {
  try {
    const trackName = req.query.trackName;
    const artistName = req.query.artistName || "";
    if (!trackName) return res.status(400).json({ error: "trackName required" });

    const query = `${trackName} ${artistName}`.trim();
    console.log('🔍 YouTube search query:', query);
    
    const searchRes = await ytSearch(query);
    const video = searchRes.videos && searchRes.videos.length ? searchRes.videos[0] : null;
    
    if (!video) {
      return res.json({ found: false });
    }

    console.log('🎵 Found:', video.title);

    // Try multiple format strategies to get audio
    const formatStrategies = [
      'bestaudio/best',           // Best audio available
      'bestaudio[ext=m4a]/bestaudio', // M4A audio
      'worstaudio/worst',         // Lowest quality (more likely to work)
      'best',                     // Best overall (video+audio)
      'worst'                     // Worst overall (last resort)
    ];

    for (const format of formatStrategies) {
      try {
        console.log(`🔄 Trying format: ${format}`);
        const info = await ytdlp(`https://www.youtube.com/watch?v=${video.videoId}`, {
          dumpSingleJson: true,
          noWarnings: true,
          format: format
        });

        if (info && (info.url || info.requested_formats)) {
          // Get the audio URL from info
          const audioUrl = info.url || 
                         (info.requested_formats && info.requested_formats.find(f => f.acodec !== 'none')?.url) ||
                         (info.formats && info.formats.find(f => f.acodec !== 'none' && f.url)?.url);

          if (audioUrl) {
            console.log(`✅ SUCCESS - Got audio URL with format: ${format}`);
            return res.json({
              found: true,
              title: video.title,
              artist: artistName,
              preview_url: audioUrl,
              duration: info.duration || video.duration?.seconds || 180
            });
          }
        }
      } catch (error) {
        // Try next format if this one fails
        console.log(`❌ Format ${format} failed:`, error?.message?.substring(0, 100));
        continue;
      }
    }

    // If all yt-dlp format strategies failed, try Piped as a last resort
    try {
      console.log('🔍 All yt-dlp formats failed, trying Piped API fallback...');
      const pipedResponse = await axios.get(`https://piped.video/watch`, {
        params: { v: video.videoId, local: true, hl: 'en' },
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const audioStreams = pipedResponse.data?.audioStreams || [];
      if (audioStreams.length) {
        // choose highest bitrate
        const best = audioStreams.sort((a,b)=> (b.bitrate||0)-(a.bitrate||0))[0];
        if (best?.url) {
          console.log('✅ Piped fallback succeeded');
          return res.json({
            found: true,
            source: 'piped',
            title: video.title,
            artist: artistName,
            preview_url: best.url,
            duration: video.duration?.seconds || 180
          });
        }
      }
      console.log('❌ Piped fallback returned no usable audio streams');
    } catch (pipedErr) {
      console.log('❌ Piped fallback failed:', pipedErr.message);
    }

    // If everything failed, log and return failure
    console.error('❌ All YouTube extraction methods failed for:', video.videoId);
    return res.json({ found: false, message: 'No audio available from YouTube (SABR streaming restriction)' });
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

// Jamendo preview endpoint (requires API credentials)
app.get("/api/jamendo/preview", async (req, res) => {
  try {
    const trackName = req.query.trackName;
    const artistName = req.query.artistName || "";

    if (!trackName) {
      return res.status(400).json({ error: "trackName query param required" });
    }

    if (!process.env.JAMENDO_CLIENT_ID) {
      return res.status(503).json({ found: false, message: "Jamendo client ID not configured" });
    }

    const query = `${trackName} ${artistName}`.trim();
    console.log('🔎 Jamendo search query:', query);

    const params = {
      client_id: process.env.JAMENDO_CLIENT_ID,
      format: "json",
      limit: 10,
      search: query,
      audioformat: "mp32",
      include: "musicinfo",
      order: "popularity_total_desc"
    };

    if (process.env.JAMENDO_CLIENT_SECRET) {
      params.client_secret = process.env.JAMENDO_CLIENT_SECRET;
    }

    const { data } = await axios.get("https://api.jamendo.com/v3.0/tracks", { params });
    const results = data?.results || [];

    if (!results.length) {
      return res.json({ found: false, message: "No tracks returned by Jamendo" });
    }

    const normalize = (value) =>
      value ? value.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim() : "";

    const normalizedTrackName = normalize(trackName);
    const normalizedTrackArtists = normalize(artistName);

    const matchesRequestedTrack = (candidate) => {
      if (!candidate) return false;
      const candidateTitle = normalize(candidate.name || candidate.title);
      const candidateArtist = normalize(candidate.artist_name || candidate.artist);

      if (!candidateTitle) return false;

      if (normalizedTrackName && candidateTitle.includes(normalizedTrackName)) {
        return true;
      }

      const trackTokens = normalizedTrackName.split(" ").filter(Boolean);
      const candidateTokens = candidateTitle.split(" ").filter(Boolean);
      const sharedTokens = trackTokens.filter((token) => candidateTokens.includes(token));
      const tokenCoverage = trackTokens.length ? sharedTokens.length / trackTokens.length : 0;

      const artistMatches =
        candidateArtist && normalizedTrackArtists && (
          candidateArtist.includes(normalizedTrackArtists) || normalizedTrackArtists.includes(candidateArtist)
        );

      return tokenCoverage >= 0.6 && artistMatches;
    };

    const playable = results.find(
      (track) => (track?.audio || track?.audiodownload) && matchesRequestedTrack(track)
    );

    if (playable) {
      return res.json({
        found: true,
        source: "jamendo",
        title: playable.name,
        artist: playable.artist_name,
        preview_url: playable.audio || playable.audiodownload,
        duration: playable.duration,
        jamendo_track_id: playable.id,
        album_cover: playable.image || playable.album_image,
        license: playable.license_ccurl
      });
    }

    return res.json({ found: false, message: "No closely matching audio found on Jamendo" });
  } catch (error) {
    console.error("❌ Jamendo preview error:", error.message);
    return res.status(error.response?.status || 500).json({
      error: "Failed to fetch preview from Jamendo",
      message: error.message
    });
  }
});

// ==================== JioSaavn preview endpoint (unofficial) ====================
// Example: /api/saavn/preview?query=apna%20bana%20le
// Returns {found:true, preview_url:'http://...', title, artist, duration}
app.get("/api/saavn/preview", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "query required" });

    // Mirrors in case one domain fails to resolve
    const SAAVN_BASES = [
      "https://saavn.dev/api",
      "https://saavncloud.grey.software/api"
    ];

    const saavnRequest = async (path, params = {}) => {
      for (const base of SAAVN_BASES) {
        try {
          const res = await axios.get(`${base}/${path}`, {
            params,
            timeout: 10000,
          });
          return res.data;
        } catch (err) {
          console.log(`Saavn mirror ${base} failed:`, err.code || err.message);
        }
      }
      throw new Error("All Saavn mirrors unreachable");
    };

    // 1) search for songs (different proxies use different paths)
    let search;
    try {
      search = await saavnRequest("search", { query, type: "song" });
    } catch (ignore) {
      // try alternate path used by sumit.co proxy
      search = await saavnRequest("search/songs", { query, page: 0, limit: 1 });
    }
    const song = search?.data?.results?.[0];
    if (!song) return res.json({ found: false, message: "No Saavn result" });

    // 2) fetch details
    let details;
    try {
      details = await saavnRequest("songs", { id: song.id });
    } catch (ignore) {
      details = await saavnRequest("song", { id: song.id });
    }

    const link = details?.data?.downloadUrl?.[2]?.url // may be array of objects
              || details?.data?.download_links?.[2]    // legacy field
              || details?.data?.downloadUrl?.[4]?.link
              || details?.data?.downloadUrl?.[0]?.link;

    if (link) {
      return res.json({
        found: true,
        source: "jiosaavn",
        title: song.name,
        artist: song.primaryArtists,
        preview_url: link,
        duration: song.duration,
        saavn_song_id: song.id,
      });
    }
    return res.json({ found: false, message: "Saavn song has no streamable link" });
  } catch (error) {
    console.error("❌ Saavn preview error:", error.message);
    res.status(500).json({ error: error.message });
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
    
    console.log(` Tracks WITH preview: ${tracksWithPreview.length}`);
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
    
    console.log(` Tracks WITH preview: ${tracksWithPreview.length}`);
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

    console.log(` Tracks WITH preview: ${tracksWithPreview.length}`);
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
    console.log(' Got access token:', access_token ? 'YES' : 'NO');
    
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
          console.log(` FOUND PREVIEW: "${data.name}" - ${data.preview_url}`);
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

// GET artist details (photo, followers, description/genres)
app.get("/api/artist/:id", async (req, res) => {
  try {
    const { access_token } = await getAppToken();
    const artistId = req.params.id;
    const { data } = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    return res.json({
      id: data.id,
      name: data.name,
      photo: data.images?.[0]?.url || null,
      listeners: data.followers?.total || 0,
      genres: data.genres || []
    });
  } catch (error) {
    console.error("Error /api/artist/:id", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch artist details" });
  }
});

app.get("/api/artist/search", async (req, res) => {
  try {
    const name = (req.query.name || "").trim();
    if (!name) return res.status(400).json({ error: "name query required" });

    const { access_token } = await getAppToken();
    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${access_token}` },
      params: { q: name, type: "artist", limit: 1 }
    });

    const artist = data.artists?.items?.[0] || null;
    if (!artist) return res.json({ found: false });

    return res.json({
      found: true,
      id: artist.id,
      name: artist.name,
      photo: artist.images?.[0]?.url || null,
      listeners: artist.followers?.total || 0,
      genres: artist.genres || []
    });
  } catch (error) {
    console.error("Error /api/artist/search", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to search artist" });
  }
});

app.get("/api/track/search", async (req, res) => {
  try {
    const title = (req.query.title || "").trim();
    if (!title) return res.status(400).json({ error: "title query required" });

    const artist = (req.query.artist || "").trim();
    // Build spotify search query. Use exact phrase qualifiers where possible.
    let q = `track:"${title}"`;
    if (artist) q += ` artist:"${artist}"`;

    const { access_token } = await getAppToken();
    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${access_token}` },
      params: { q, type: "track", limit: 1, market: "US" }
    });

    const track = data.tracks?.items?.[0] || null;
    if (!track) return res.json({ found: false });

    return res.json({
      found: true,
      id: track.id,
      name: track.name,
      artists: track.artists,
      album: track.album?.name,
      image: track.album?.images?.[0]?.url || null,
      preview_url: track.preview_url || null
    });
  } catch (error) {
    console.error("Error /api/track/search", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to search track" });
  }
});


// PATCH user avatar
app.patch("/api/user/:id/avatar", async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatar },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH user name
app.patch("/api/user/:id/name", async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    // Get all users (both active and inactive) - sorted by creation date
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET single user by id (for details view only)
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// DELETE user (soft delete - set is_active to 0)
app.delete("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { is_active: 0 },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`🗑️ User deactivated: "${user.name}" (${user.email})`);
    res.json({ message: "User deactivated successfully" });
  } catch (err) {
    console.error('Error deactivating user:', err);
    res.status(500).json({ error: "Failed to deactivate user" });
  }
});

// PATCH toggle user active status
app.patch("/api/users/:id/toggle-status", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Toggle the is_active status
    const newStatus = user.is_active === 1 ? 0 : 1;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { is_active: newStatus },
      { new: true }
    );

    const statusText = newStatus === 1 ? 'activated' : 'deactivated';
    console.log(`🔄 User ${statusText}: "${updatedUser.name}" (${updatedUser.email})`);
    
    res.json({ 
      message: `User ${statusText} successfully`,
      user: updatedUser 
    });
  } catch (err) {
    console.error('Error toggling user status:', err);
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
});

app.get("/api/admins", async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.patch("/api/admins/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; 

    const updatedAdmin = await Admin.findByIdAndUpdate(id, updates, {
      new: true,
    });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

app.patch("/api/admins/:id", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true } // return updated document
    );

    if (!updatedAdmin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json(updatedAdmin);
  } catch (err) {
    console.error("Error updating admin:", err);
    res.status(500).json({ error: "Server error" });
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
