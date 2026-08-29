import express from "express";
import User from "../models/Register_user.js";
import CustomSong from "../models/CustomSong.js";

const router = express.Router();

// GET /api/analytics/overview — Comprehensive admin analytics
router.get("/overview", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ is_active: 1 });
    const inactiveUsers = await User.countDocuments({ is_active: 0 });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userTrends = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const totalCustomSongs = await CustomSong.countDocuments({});
    const publishedSongs = await CustomSong.countDocuments({ apiStatus: "Published" });
    const draftSongs = await CustomSong.countDocuments({ apiStatus: "Draft" });
    const errorSongs = await CustomSong.countDocuments({ apiStatus: "Error" });

    const popularSongs = await CustomSong.find({}).sort({ playCount: -1 }).limit(10).select("title artist playCount apiStatus is_active");

    const songUploadTrends = await CustomSong.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const songsPerAdmin = await CustomSong.aggregate([
      { $group: { _id: "$uploadedBy", songCount: { $sum: 1 } } },
      { $sort: { songCount: -1 } },
      { $limit: 10 },
    ]);

    const genreDistribution = await CustomSong.aggregate([
      { $group: { _id: "$genre", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUploads = await CustomSong.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    const storageStats = await CustomSong.aggregate([
      { $match: { is_active: 1 } },
      { $group: { _id: null, totalSongs: { $sum: 1 } } },
    ]);

    res.json({
      users: { total: totalUsers, active: activeUsers, inactive: inactiveUsers, trends: userTrends },
      customSongs: { total: totalCustomSongs, published: publishedSongs, draft: draftSongs, error: errorSongs, popular: popularSongs, uploadTrends: songUploadTrends },
      admins: { songsPerAdmin },
      genres: genreDistribution,
      recentActivity: { newSongs: recentUploads, newUsers: recentUsers },
      storage: { totalSongs: storageStats[0]?.totalSongs || 0, estimatedSizeMB: (storageStats[0]?.totalSongs || 0) * 5 },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

// GET /api/analytics/users — Detailed user analytics
router.get("/users", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ is_active: 1 });
    const inactiveUsers = await User.countDocuments({ is_active: 0 });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    res.json({ summary: { total: totalUsers, active: activeUsers, inactive: inactiveUsers }, dailyRegistrations });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    res.status(500).json({ error: "Failed to fetch user analytics" });
  }
});

// GET /api/analytics/songs — Detailed custom songs analytics
router.get("/songs", async (req, res) => {
  try {
    const totalSongs = await CustomSong.countDocuments({});
    const activeSongs = await CustomSong.countDocuments({ is_active: 1 });
    const publishedSongs = await CustomSong.countDocuments({ apiStatus: "Published", is_active: 1 });
    const draftSongs = await CustomSong.countDocuments({ apiStatus: "Draft", is_active: 1 });

    const topSongs = await CustomSong.find({ is_active: 1 }).sort({ playCount: -1 }).limit(10).select("title artist playCount genre");

    const genres = await CustomSong.aggregate([
      { $match: { is_active: 1 } },
      { $group: { _id: "$genre", count: { $sum: 1 }, totalPlays: { $sum: "$playCount" } } },
      { $sort: { count: -1 } },
    ]);

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const uploadTrends = await CustomSong.aggregate([
      { $match: { createdAt: { $gte: threeMonthsAgo } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({ summary: { total: totalSongs, active: activeSongs, published: publishedSongs, draft: draftSongs }, topSongs, genres, uploadTrends });
  } catch (error) {
    console.error("Error fetching songs analytics:", error);
    res.status(500).json({ error: "Failed to fetch songs analytics" });
  }
});

export default router;
