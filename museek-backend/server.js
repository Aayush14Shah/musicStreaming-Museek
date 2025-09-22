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

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Museek API. Use /api endpoints like /api/new-releases.' });
});

// ==================== CUSTOM SONGS CRUD API ====================

// GET all custom songs (with filtering and pagination) - Shows both active and inactive
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

    console.log(`✅ New song uploaded: "${title}" by ${artist}`);
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

    console.log(`✅ Song updated: "${updatedSong.title}" by ${updatedSong.artist}`);
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

// ==================== END SETTINGS API ====================

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

// PATCH user by id (for editing name or deactivating)
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
