import express from "express";
import { appSettings, auditLogs, logAuditAction } from "../config/appSettings.js";

const router = express.Router();

// GET /api/settings — Get current platform settings
router.get("/", (req, res) => {
  res.json(appSettings);
});

// POST /api/settings — Update platform settings
router.post("/", (req, res) => {
  try {
    const oldSettings = { ...appSettings };
    Object.assign(appSettings, req.body);

    // Log which settings changed
    const changes = Object.keys(req.body)
      .filter((key) => JSON.stringify(oldSettings[key]) !== JSON.stringify(req.body[key]))
      .map((key) => `${key}: ${JSON.stringify(oldSettings[key])} → ${JSON.stringify(req.body[key])}`);

    if (changes.length > 0) {
      logAuditAction("SETTINGS_UPDATED", changes.join(", "));
    }

    console.log("⚙️ Settings updated:", appSettings);
    res.json({ success: true, settings: appSettings });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// GET /api/registration-status — Used by auth routes to gate registrations
router.get("/registration-status", (req, res) => {
  res.json({ allowRegistration: appSettings.allowRegistration });
});

// GET /api/upload-settings — Current file upload constraints
router.get("/upload-settings", (req, res) => {
  res.json({ maxFileSize: appSettings.maxFileSize, allowedFormats: appSettings.allowedFormats });
});

// GET /api/audit-logs — Paginated audit log entries
router.get("/audit-logs", (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const paginatedLogs = auditLogs.slice(offset, offset + limit);
  res.json({ logs: paginatedLogs, total: auditLogs.length, hasMore: offset + limit < auditLogs.length });
});

export default router;
