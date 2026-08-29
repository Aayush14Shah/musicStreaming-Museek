import express from "express";
import Admin from "../models/admin.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// GET /api/admins — All admin accounts
router.get("/", async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});

// PATCH /api/admins/:id — Update admin details (name, role, is_active)
// Hashes password if it is part of the update.
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (!updates.name && Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No update fields provided" });
    }

    // Hash password if it is being updated
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updatedAdmin) return res.status(404).json({ error: "Admin not found" });

    res.json(updatedAdmin);
  } catch (err) {
    console.error("Error updating admin:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/admins/:id — Remove an admin account
router.delete("/:id", async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    console.log(`🗑️ Admin deleted: "${admin.name}" (${admin.email})`);
    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    console.error("Error deleting admin:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
