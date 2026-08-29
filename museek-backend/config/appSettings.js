/**
 * Shared in-memory application settings and audit log store.
 * The settings object is mutated in-place so all importing modules
 * always read the latest values without re-importing.
 */

export const appSettings = {
  maxFileSize: 50,
  allowedFormats: ["MP3", "WAV", "FLAC"],
  allowRegistration: true,
  maxPlaylistsPerUser: 50,
  sessionTimeout: 24,
  enableAuditLogs: true,
};

export const auditLogs = [];

export const logAuditAction = (action, details, adminId = "system") => {
  if (!appSettings.enableAuditLogs) return;

  const logEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    adminId,
    action,
    details,
    ip: "localhost",
  };

  auditLogs.unshift(logEntry);

  // Keep only the last 1000 log entries to prevent memory overflow
  if (auditLogs.length > 1000) {
    auditLogs.splice(1000);
  }

  console.log("📋 Audit Log:", action, details);
};

// Initialise with two startup log entries
const initializeSampleLogs = () => {
  auditLogs.push(
    {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      adminId: "system",
      action: "SERVER_STARTED",
      details: "Museek server started successfully",
      ip: "localhost",
    },
    {
      id: (Date.now() - 60000).toString(),
      timestamp: new Date(Date.now() - 60000).toISOString(),
      adminId: "system",
      action: "SETTINGS_INITIALIZED",
      details: "Default settings loaded",
      ip: "localhost",
    }
  );
};

initializeSampleLogs();
