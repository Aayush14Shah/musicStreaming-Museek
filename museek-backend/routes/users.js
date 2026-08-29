import express from "express";
import User from "../models/Register_user.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// GET /api/users — All users sorted by creation date (admin)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET /api/users/:id — Single user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// DELETE /api/users/:id — Soft-delete (deactivate) user
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { is_active: 0 }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    console.log(`🗑️ User deactivated: "${user.name}" (${user.email})`);
    res.json({ message: "User deactivated successfully" });
  } catch (err) {
    console.error("Error deactivating user:", err);
    res.status(500).json({ error: "Failed to deactivate user" });
  }
});

// PATCH /api/users/:id/toggle-status — Toggle user active/inactive
router.patch("/:id/toggle-status", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const newStatus = user.is_active === 1 ? 0 : 1;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { is_active: newStatus }, { new: true });

    const statusText = newStatus === 1 ? "activated" : "deactivated";
    console.log(`🔄 User ${statusText}: "${updatedUser.name}" (${updatedUser.email})`);
    res.json({ message: `User ${statusText} successfully`, user: updatedUser });
  } catch (err) {
    console.error("Error toggling user status:", err);
    res.status(500).json({ error: "Failed to toggle user status" });
  }
});

// PATCH /api/users/:id/activate — Explicitly activate a user
router.patch("/:id/activate", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { is_active: 1 }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/user/:id/avatar — Update user avatar
router.patch("/:id/avatar", async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { avatar }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/user/:id/name — Update user name
router.patch("/:id/name", async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/listening-hours/total — Sum of listening hours across all users
router.get("/listening-hours/total", async (req, res) => {
  try {
    const result = await User.aggregate([{ $group: { _id: null, totalHours: { $sum: "$listeningHours" } } }]);
    const totalHours = result.length > 0 ? result[0].totalHours : 0;
    res.json({ totalHours });
  } catch (error) {
    console.error("Error fetching total listening hours:", error);
    res.status(500).json({ error: "Failed to fetch listening hours" });
  }
});

// POST /api/users/:id/listening-hours — Increment a user's listening hours
router.post("/:id/listening-hours", async (req, res) => {
  try {
    const { hours } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { $inc: { listeningHours: hours } }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Listening hours updated", totalHours: user.listeningHours });
  } catch (error) {
    console.error("Error updating listening hours:", error);
    res.status(500).json({ error: "Failed to update listening hours" });
  }
});

export default router;
