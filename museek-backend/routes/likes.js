import express from "express";
import Like from "../models/Like.js";

const router = express.Router();

// POST /api/likes — Like a song
router.post("/", async (req, res) => {
  try {
    const {
      userId, songId, songType, songTitle, songArtist,
      songAlbum, songImage, songPreviewUrl, spotifyUri, customSongPath,
    } = req.body;

    if (!userId || !songId || !songType || !songTitle || !songArtist) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingLike = await Like.findOne({ userId, songId, songType });
    if (existingLike) {
      return res.status(409).json({ error: "Song already liked" });
    }

    const like = new Like({
      userId, songId, songType, songTitle, songArtist,
      songAlbum: songAlbum || "Unknown Album",
      songImage, songPreviewUrl, spotifyUri, customSongPath,
    });

    await like.save();
    console.log(`❤️ User ${userId} liked: "${songTitle}" by ${songArtist}`);
    res.status(201).json({ message: "Song liked successfully", like });
  } catch (error) {
    console.error("Error liking song:", error);
    res.status(500).json({ error: "Failed to like song" });
  }
});

// DELETE /api/likes — Unlike a song
router.delete("/", async (req, res) => {
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
    console.error("Error unliking song:", error);
    res.status(500).json({ error: "Failed to unlike song" });
  }
});

// GET /api/likes/stats/overview — Like statistics (must be before /:userId)
router.get("/stats/overview", async (req, res) => {
  try {
    const totalLikes = await Like.countDocuments();
    const spotifyLikes = await Like.countDocuments({ songType: "spotify" });
    const customLikes = await Like.countDocuments({ songType: "custom" });

    const mostLikedSongs = await Like.aggregate([
      { $group: { _id: { songId: "$songId", songType: "$songType" }, count: { $sum: 1 }, songTitle: { $first: "$songTitle" }, songArtist: { $first: "$songArtist" }, songAlbum: { $first: "$songAlbum" }, songImage: { $first: "$songImage" } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const topUsers = await Like.aggregate([
      { $group: { _id: "$userId", likeCount: { $sum: 1 } } },
      { $sort: { likeCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: "Registered_Users", localField: "_id", foreignField: "_id", as: "user" } },
      { $project: { userId: "$_id", likeCount: 1, userName: { $arrayElemAt: ["$user.name", 0] } } },
    ]);

    res.json({ totalLikes, spotifyLikes, customLikes, mostLikedSongs, topUsers });
  } catch (error) {
    console.error("Error fetching like statistics:", error);
    res.status(500).json({ error: "Failed to fetch like statistics" });
  }
});

// GET /api/likes/check/:userId/:songId/:songType — Check if a song is liked
router.get("/check/:userId/:songId/:songType", async (req, res) => {
  try {
    const { userId, songId, songType } = req.params;
    const like = await Like.findOne({ userId, songId, songType });
    res.json({ isLiked: !!like });
  } catch (error) {
    console.error("Error checking like status:", error);
    res.status(500).json({ error: "Failed to check like status" });
  }
});

// GET /api/likes/:userId — Get a user's liked songs
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, songType } = req.query;

    const query = { userId };
    if (songType) query.songType = songType;

    const likes = await Like.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Like.countDocuments(query);
    res.json({ likes, totalPages: Math.ceil(total / limit), currentPage: page, total });
  } catch (error) {
    console.error("Error fetching liked songs:", error);
    res.status(500).json({ error: "Failed to fetch liked songs" });
  }
});

export default router;
