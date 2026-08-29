import express from "express";
import Playlist from "../models/Playlist.js";
import PlaylistSong from "../models/PlaylistSong.js";

const router = express.Router();

// POST /api/playlists — Create a new playlist
router.post("/", async (req, res) => {
  try {
    const { name, description, userId, isPublic } = req.body;
    if (!name || !userId) {
      return res.status(400).json({ error: "Name and userId are required" });
    }

    const existingPlaylist = await Playlist.findOne({ userId, name, is_active: 1 });
    if (existingPlaylist) {
      return res.status(409).json({ error: "Playlist name already exists" });
    }

    const playlist = new Playlist({ name: name.trim(), description: description?.trim() || "", userId, isPublic: isPublic || false });
    await playlist.save();
    console.log(`🎵 User ${userId} created playlist: "${name}"`);
    res.status(201).json({ message: "Playlist created successfully", playlist });
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({ error: "Failed to create playlist" });
  }
});

// GET /api/playlists/stats/overview — Playlist statistics (before /:playlistId)
router.get("/stats/overview", async (req, res) => {
  try {
    const totalPlaylists = await Playlist.countDocuments({ is_active: 1 });
    const publicPlaylists = await Playlist.countDocuments({ is_active: 1, isPublic: true });
    const totalSongs = await PlaylistSong.countDocuments();

    const popularPlaylists = await Playlist.find({ is_active: 1, isPublic: true }).sort({ songCount: -1 }).limit(10).populate("userId", "name");

    const topPlaylistCreators = await Playlist.aggregate([
      { $match: { is_active: 1 } },
      { $group: { _id: "$userId", playlistCount: { $sum: 1 }, totalSongs: { $sum: "$songCount" } } },
      { $sort: { playlistCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: "Registered_Users", localField: "_id", foreignField: "_id", as: "user" } },
      { $project: { userId: "$_id", playlistCount: 1, totalSongs: 1, userName: { $arrayElemAt: ["$user.name", 0] } } },
    ]);

    res.json({ totalPlaylists, publicPlaylists, totalSongs, popularPlaylists, topPlaylistCreators });
  } catch (error) {
    console.error("Error fetching playlist statistics:", error);
    res.status(500).json({ error: "Failed to fetch playlist statistics" });
  }
});

// GET /api/playlists/user/:userId — Get a user's playlists
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const playlists = await Playlist.find({ userId, is_active: 1 }).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const total = await Playlist.countDocuments({ userId, is_active: 1 });
    res.json({ playlists, totalPages: Math.ceil(total / limit), currentPage: page, total });
  } catch (error) {
    console.error("Error fetching user playlists:", error);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

// PUT /api/playlists/:playlistId/songs/reorder — Reorder songs (before /:playlistId/songs/:songId)
router.put("/:playlistId/songs/reorder", async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { songUpdates } = req.body;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist || playlist.is_active === 0) return res.status(404).json({ error: "Playlist not found" });

    for (const update of songUpdates) {
      await PlaylistSong.findOneAndUpdate({ playlistId, songId: update.songId, songType: update.songType }, { position: update.newPosition });
    }
    res.json({ message: "Playlist order updated" });
  } catch (error) {
    console.error("Error reordering playlist:", error);
    res.status(500).json({ error: "Failed to reorder playlist" });
  }
});

// POST /api/playlists/:playlistId/songs — Add song to playlist
router.post("/:playlistId/songs", async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { songId, songType, songTitle, songArtist, songAlbum, songImage, songPreviewUrl, songDuration, spotifyUri, customSongPath, addedBy } = req.body;

    if (!songId || !songType || !songTitle || !songArtist || !addedBy) {
      return res.status(400).json({ error: "Missing required song fields" });
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist || playlist.is_active === 0) return res.status(404).json({ error: "Playlist not found" });

    const existingSong = await PlaylistSong.findOne({ playlistId, songId, songType });
    if (existingSong) return res.status(409).json({ error: "Song already in playlist" });

    const lastSong = await PlaylistSong.findOne({ playlistId }).sort({ position: -1 });
    const position = lastSong ? lastSong.position + 1 : 1;

    const playlistSong = new PlaylistSong({ playlistId, songId, songType, songTitle, songArtist, songAlbum: songAlbum || "Unknown Album", songImage, songPreviewUrl, songDuration: songDuration || 0, spotifyUri, customSongPath, addedBy, position });
    await playlistSong.save();

    playlist.songCount += 1;
    playlist.totalDuration += songDuration || 0;
    await playlist.save();

    console.log(`🎵 Added "${songTitle}" to playlist "${playlist.name}"`);
    res.status(201).json({ message: "Song added to playlist", playlistSong });
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    res.status(500).json({ error: "Failed to add song to playlist" });
  }
});

// DELETE /api/playlists/:playlistId/songs/:songId/:songType — Remove song from playlist
router.delete("/:playlistId/songs/:songId/:songType", async (req, res) => {
  try {
    const { playlistId, songId, songType } = req.params;
    const playlist = await Playlist.findById(playlistId);
    if (!playlist || playlist.is_active === 0) return res.status(404).json({ error: "Playlist not found" });

    const playlistSong = await PlaylistSong.findOneAndDelete({ playlistId, songId, songType });
    if (!playlistSong) return res.status(404).json({ error: "Song not found in playlist" });

    playlist.songCount = Math.max(0, playlist.songCount - 1);
    playlist.totalDuration = Math.max(0, playlist.totalDuration - (playlistSong.songDuration || 0));
    await playlist.save();

    await PlaylistSong.updateMany({ playlistId, position: { $gt: playlistSong.position } }, { $inc: { position: -1 } });

    console.log(`🗑️ Removed "${playlistSong.songTitle}" from playlist "${playlist.name}"`);
    res.json({ message: "Song removed from playlist" });
  } catch (error) {
    console.error("Error removing song from playlist:", error);
    res.status(500).json({ error: "Failed to remove song from playlist" });
  }
});

// GET /api/playlists/:playlistId — Get single playlist with its songs
router.get("/:playlistId", async (req, res) => {
  try {
    const { playlistId } = req.params;
    const playlist = await Playlist.findById(playlistId);
    if (!playlist || playlist.is_active === 0) return res.status(404).json({ error: "Playlist not found" });

    const songs = await PlaylistSong.find({ playlistId }).sort({ position: 1, createdAt: 1 });
    res.json({ playlist, songs });
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({ error: "Failed to fetch playlist" });
  }
});

// PUT /api/playlists/:playlistId — Update a playlist
router.put("/:playlistId", async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { name, description, isPublic } = req.body;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist || playlist.is_active === 0) return res.status(404).json({ error: "Playlist not found" });

    if (name && name !== playlist.name) {
      const existingPlaylist = await Playlist.findOne({ userId: playlist.userId, name: name.trim(), is_active: 1, _id: { $ne: playlistId } });
      if (existingPlaylist) return res.status(409).json({ error: "Playlist name already exists" });
    }

    if (name) playlist.name = name.trim();
    if (description !== undefined) playlist.description = description.trim();
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    await playlist.save();

    res.json({ message: "Playlist updated successfully", playlist });
  } catch (error) {
    console.error("Error updating playlist:", error);
    res.status(500).json({ error: "Failed to update playlist" });
  }
});

// DELETE /api/playlists/:playlistId — Soft-delete a playlist
router.delete("/:playlistId", async (req, res) => {
  try {
    const { playlistId } = req.params;
    const playlist = await Playlist.findById(playlistId);
    if (!playlist || playlist.is_active === 0) return res.status(404).json({ error: "Playlist not found" });

    playlist.is_active = 0;
    await playlist.save();
    await PlaylistSong.deleteMany({ playlistId });

    console.log(`🗑️ Playlist "${playlist.name}" deleted`);
    res.json({ message: "Playlist deleted successfully" });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    res.status(500).json({ error: "Failed to delete playlist" });
  }
});

export default router;
