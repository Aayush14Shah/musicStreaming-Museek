// Settings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./homePage/Navbar";
import MusicPlayer from "./homePage/MusicPlayer";
import NowPlayingSidebar from "./homePage/NowPlayingSidebar";
import {
  Button,
  Switch,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Lock as LockIcon,
  Email as EmailIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

/* Width reserved for the NowPlayingSidebar */
const SIDEBAR_WIDTH_PX = 360;

export default function Settings() {
  const navigate = useNavigate();
  // user id set at login
  const userId = localStorage.getItem("userId");

  // main states
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // layout: whether NowPlayingSidebar is open
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => localStorage.getItem("isPlaying") === "true"
  );

  // last played track
  const [currentTrack, setCurrentTrack] = useState(() => {
    try {
      const raw = localStorage.getItem("lastPlayedTrack");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Settings states
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "en");
  
  // Dialog states
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [updateEmailOpen, setUpdateEmailOpen] = useState(false);
  
  // Form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    confirmEmail: ""
  });

  /* ---------- Load user ---------- */
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingUser(true);
      let fetched = null;

      if (userId) {
        const endpoints = [
          `${API_BASE}/api/user/${userId}`,
          `${API_BASE}/api/users/${userId}`,
          `${API_BASE}/api/user?userId=${userId}`,
        ];
        for (const url of endpoints) {
          try {
            const res = await fetch(url, { credentials: "include" });
            if (!res.ok) continue;
            const data = await res.json();
            fetched = data?.user || data?.data || data;
            break;
          } catch {
            // try next
          }
        }
      }

      if (!fetched) {
        const localUser = JSON.parse(localStorage.getItem("user") || "null");
        if (localUser) fetched = localUser;
        else {
          const name = localStorage.getItem("userName");
          const email = localStorage.getItem("userEmail");
          if (name || email) fetched = { name, email };
        }
      }

      if (!mounted) return;
      setUser(fetched);
      setLoadingUser(false);
    };

    load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  /* ---------- Storage event sync ---------- */
  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      if (e.key === "isPlaying") {
        setIsSidebarOpen(e.newValue === "true");
      }
      if (e.key === "lastPlayedTrack") {
        try {
          setCurrentTrack(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setCurrentTrack(null);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* ---------- Theme toggle ---------- */
  const handleThemeToggle = (event) => {
    const newTheme = event.target.checked ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  /* ---------- Language change ---------- */
  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  /* ---------- Password change ---------- */
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords don't match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/user/${userId}/password`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      });

      if (res.ok) {
        alert("Password updated successfully");
        setChangePasswordOpen(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const error = await res.json();
        alert(error.message || "Failed to update password");
      }
    } catch (error) {
      alert("Failed to update password. Please try again.");
    }
  };

  /* ---------- Email update ---------- */
  const handleEmailUpdate = async () => {
    if (emailForm.newEmail !== emailForm.confirmEmail) {
      alert("Email addresses don't match");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/user/${userId}/email`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: emailForm.newEmail }),
      });

      if (res.ok) {
        alert("Email updated successfully");
        setUpdateEmailOpen(false);
        setEmailForm({ newEmail: "", confirmEmail: "" });
        // Update local storage
        localStorage.setItem("userEmail", emailForm.newEmail);
        setUser(prev => ({ ...prev, email: emailForm.newEmail }));
      } else {
        const error = await res.json();
        alert(error.message || "Failed to update email");
      }
    } catch (error) {
      alert("Failed to update email. Please try again.");
    }
  };

  /* ---------- Sidebar toggle ---------- */
  const toggleSidebar = (open) => {
    setIsSidebarOpen(open);
    localStorage.setItem("isPlaying", open ? "true" : "false");
  };

  /* ---------- Render UI ---------- */
  return (
    <div className="min-h-screen bg-[#181818] text-white">
      <Navbar />

      {/* main area - content starts from left, only right part resizes */}
      <div className="pt-[64px] pb-28">
        <div 
          className="transition-all duration-200"
          style={{ 
            marginRight: isSidebarOpen ? `${SIDEBAR_WIDTH_PX}px` : '0px'
          }}
        >
          {/* Gray background box like sidebars */}
          <div className="bg-[#0f0f0f] min-h-screen mx-4 rounded-lg shadow-lg mt-4">
            <div className="p-6 md:p-8">
              {/* Back Button */}
              <div className="mb-6">
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 text-[#cd7f32] hover:text-[#b06f2d] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Home
                </button>
              </div>

              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Settings</h1>
                <p className="text-gray-400">Manage your account preferences and security settings.</p>
              </div>

              {/* Settings Sections */}
              <div className="space-y-8">
                {/* Account Settings */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-1 h-8 bg-[#cd7f32] rounded-full mr-4"></div>
                    <h2 className="text-xl font-semibold">Account Settings</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Change Password */}
                    <div className="flex items-center justify-between py-4 px-6 bg-[#181818] rounded-lg border border-[#333] hover:border-[#cd7f32]/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <LockIcon sx={{ color: "#cd7f32", fontSize: 20 }} />
                          <h3 className="text-lg font-semibold">Change Password</h3>
                        </div>
                        <p className="text-gray-400 text-sm">Update your password to keep your account secure.</p>
                      </div>
                      <Button
                        variant="contained"
                        onClick={() => setChangePasswordOpen(true)}
                        startIcon={<ArrowIcon />}
                        sx={{
                          backgroundColor: "#cd7f32",
                          "&:hover": { backgroundColor: "#b06f2d" },
                          borderRadius: "12px",
                          px: 3,
                          py: 1
                        }}
                      >
                        Change Password
                      </Button>
                    </div>

                    {/* Update Email */}
                    <div className="flex items-center justify-between py-4 px-6 bg-[#181818] rounded-lg border border-[#333] hover:border-[#cd7f32]/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <EmailIcon sx={{ color: "#cd7f32", fontSize: 20 }} />
                          <h3 className="text-lg font-semibold">Update Email</h3>
                        </div>
                        <p className="text-gray-400 text-sm">Change the email address associated with your account.</p>
                      </div>
                      <Button
                        variant="contained"
                        onClick={() => setUpdateEmailOpen(true)}
                        startIcon={<ArrowIcon />}
                        sx={{
                          backgroundColor: "#cd7f32",
                          "&:hover": { backgroundColor: "#b06f2d" },
                          borderRadius: "12px",
                          px: 3,
                          py: 1
                        }}
                      >
                        Update Email
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Thin separator line */}
                <div className="border-t border-[#333]"></div>

                {/* Personalization */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-1 h-8 bg-[#cd7f32] rounded-full mr-4"></div>
                    <h2 className="text-xl font-semibold">Personalization</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Theme */}
                    <div className="flex items-center justify-between py-4 px-6 bg-[#181818] rounded-lg border border-[#333] hover:border-[#cd7f32]/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <PaletteIcon sx={{ color: "#cd7f32", fontSize: 20 }} />
                          <h3 className="text-lg font-semibold">Theme</h3>
                        </div>
                        <p className="text-gray-400 text-sm">Switch between light and dark themes.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-300">Light</span>
                        <Switch
                          checked={theme === "dark"}
                          onChange={handleThemeToggle}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: "#cd7f32",
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                              backgroundColor: "#cd7f32",
                            },
                          }}
                        />
                        <span className="text-sm text-gray-300">Dark</span>
                      </div>
                    </div>

                    {/* Language */}
                    <div className="flex items-center justify-between py-4 px-6 bg-[#181818] rounded-lg border border-[#333] hover:border-[#cd7f32]/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <LanguageIcon sx={{ color: "#cd7f32", fontSize: 20 }} />
                          <h3 className="text-lg font-semibold">Language</h3>
                        </div>
                        <p className="text-gray-400 text-sm">Choose the language for the website text.</p>
                      </div>
                      <Select
                        value={language}
                        onChange={handleLanguageChange}
                        sx={{
                          color: "white",
                          backgroundColor: "#181818",
                          borderRadius: "8px",
                          minWidth: 120,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#333",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#cd7f32",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#cd7f32",
                          },
                          "& .MuiSvgIcon-root": {
                            color: "#cd7f32",
                          },
                        }}
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="es">Español</MenuItem>
                        <MenuItem value="fr">Français</MenuItem>
                        <MenuItem value="de">Deutsch</MenuItem>
                        <MenuItem value="it">Italiano</MenuItem>
                        <MenuItem value="pt">Português</MenuItem>
                        <MenuItem value="ru">Русский</MenuItem>
                        <MenuItem value="ja">日本語</MenuItem>
                        <MenuItem value="ko">한국어</MenuItem>
                        <MenuItem value="zh">中文</MenuItem>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Music Player */}
      <MusicPlayer
        currentTrack={currentTrack}
        isPlaying={isSidebarOpen}
        onTogglePlay={() => {
          toggleSidebar(!isSidebarOpen);
        }}
      />

      {/* Now Playing Sidebar */}
      <NowPlayingSidebar
        currentTrack={currentTrack}
        isOpen={isSidebarOpen}
        onClose={() => toggleSidebar(false)}
      />

      {/* Floating "Show Now Playing" button */}
      {!isSidebarOpen && (
        <div className="fixed right-1.5 bottom-24 z-50">
          <button
            onClick={() => toggleSidebar(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[#0e0e0e]/95 text-[#F5F5F5] shadow-[0_8px_20px_rgba(0,0,0,0.35)] z-40 hover:bg-[#151515]/95 transition-colors"
            aria-label="Show Now Playing"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-[#CD7F32]"></span>
            Show Now Playing
          </button>
        </div>
      )}

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#121212", color: "#fff", position: "relative" }}>
          Change Password
          <IconButton
            onClick={() => setChangePasswordOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8, color: "#fff" }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ bgcolor: "#0b0b0b" }}>
          <div className="space-y-4">
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#333",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cd7f32",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cd7f32",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#999",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#cd7f32",
                },
              }}
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#333",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cd7f32",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cd7f32",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#999",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#cd7f32",
                },
              }}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#333",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cd7f32",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cd7f32",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#999",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#cd7f32",
                },
              }}
            />
          </div>
        </DialogContent>

        <DialogActions sx={{ bgcolor: "#121212", px: 3, py: 2 }}>
          <Button
            onClick={() => setChangePasswordOpen(false)}
            sx={{ color: "#999" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ backgroundColor: "#cd7f32" }}
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Email Dialog */}
      <Dialog open={updateEmailOpen} onClose={() => setUpdateEmailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#121212", color: "#fff", position: "relative" }}>
          Update Email
          <IconButton
            onClick={() => setUpdateEmailOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8, color: "#fff" }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ bgcolor: "#0b0b0b" }}>
          <div className="space-y-4">
            <TextField
              fullWidth
              type="email"
              label="New Email Address"
              value={emailForm.newEmail}
              onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#333",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cd7f32",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cd7f32",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#999",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#cd7f32",
                },
              }}
            />
            <TextField
              fullWidth
              type="email"
              label="Confirm New Email"
              value={emailForm.confirmEmail}
              onChange={(e) => setEmailForm(prev => ({ ...prev, confirmEmail: e.target.value }))}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#333",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cd7f32",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cd7f32",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#999",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#cd7f32",
                },
              }}
            />
          </div>
        </DialogContent>

        <DialogActions sx={{ bgcolor: "#121212", px: 3, py: 2 }}>
          <Button
            onClick={() => setUpdateEmailOpen(false)}
            sx={{ color: "#999" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEmailUpdate}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ backgroundColor: "#cd7f32" }}
          >
            Update Email
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
