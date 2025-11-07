// Settings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./homePage/Navbar";
import { Link } from "react-router-dom";
import MusicPlayer from "./homePage/MusicPlayer";
import NowPlayingSidebar from "./homePage/NowPlayingSidebar";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
  Box
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
  const [showPassword, setShowPassword] = useState(false);
  // Removed showPassword state
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

  /* ---------- Apply theme on mount ---------- */
  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

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

  // Password validation function
  const validatePassword = (password) => {
    const warnings = [];
    if (password.length < 8) warnings.push('At least 8 characters');
    if (!/[a-z]/.test(password)) warnings.push('At least one lowercase letter');
    if (!/[A-Z]/.test(password)) warnings.push('At least one uppercase letter');
    if (!/[0-9]/.test(password)) warnings.push('At least one digit');
    if (!/[^A-Za-z0-9]/.test(password)) warnings.push('At least one special character');
    return warnings;
  };

  const [passwordWarnings, setPasswordWarnings] = useState([]);

  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords don't match");
      return;
    }
    const warnings = validatePassword(passwordForm.newPassword);
    setPasswordWarnings(warnings);
    if (warnings.length > 0) {
      alert("Password does not meet requirements.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, password: passwordForm.newPassword }),
      });

      if (res.ok) {
        setShowPasswordPopup(true);
        setChangePasswordOpen(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPasswordWarnings([]);
      } else {
        const error = await res.json();
        alert(error.message || "Failed to update password");
      }
    } catch (error) {
      alert("Failed to update password. Please try again.");
    }
  };
      {/* Password Changed Success Popup */}
      {showPasswordPopup && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          {/* Blurred background overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          {/* Popup box */}
          <div className="relative bg-[var(--popup-bg)] backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-[var(--popup-border)]">
            <div className="flex justify-center mb-6">
              <div className="bg-green-500/20 rounded-full p-4">
                <CheckCircleIcon style={{ fontSize: "3rem" }} className="text-green-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Password Changed!</h1>
            <p className="text-[var(--text-secondary)] text-lg mb-6">Your password was updated successfully.</p>
            <button 
              onClick={() => setShowPasswordPopup(false)}
              className="w-full bg-gradient-to-r from-[#CD7F32] to-[#b06f2d] text-white font-bold py-3 px-6 rounded-lg hover:from-[#b06f2d] hover:to-[#CD7F32] transition-colors duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

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
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
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
          <div className="bg-[var(--bg-secondary)] min-h-screen mx-4 rounded-lg shadow-lg mt-4">
            <div className="p-6 md:p-8">
              {/* Back Button */}
              <div className="mb-6">
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors"
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
                <p className="text-[var(--text-secondary)]">Manage your account preferences and security settings.</p>
              </div>

              {/* Settings Sections */}
              <div className="space-y-8">
                {/* Account Settings */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-1 h-8 bg-[var(--accent-primary)] rounded-full mr-4"></div>
                    <h2 className="text-xl font-semibold">Account Settings</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Change Password */}
                    <div className="flex items-center justify-between py-4 px-6 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-primary)] hover:border-[var(--accent-primary)]/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <LockIcon sx={{ color: "var(--accent-primary)", fontSize: 20 }} />
                          <h3 className="text-lg font-semibold">Change Password</h3>
                        </div>
                        <p className="text-[var(--text-secondary)] text-sm">Update your password to keep your account secure.</p>
                      </div>
                      <Button
                        variant="contained"
                        onClick={() => setChangePasswordOpen(true)}
                        startIcon={<ArrowIcon />}
                        sx={{
                          backgroundColor: "var(--accent-primary)",
                          "&:hover": { backgroundColor: "var(--accent-secondary)" },
                          borderRadius: "12px",
                          px: 3,
                          py: 1
                        }}
                      >
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Thin separator line */}
                <div className="border-t border-[var(--border-primary)]"></div>

                {/* Personalization */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-1 h-8 bg-[var(--accent-primary)] rounded-full mr-4"></div>
                    <h2 className="text-xl font-semibold">Personalization</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Theme */}
                    <div className="flex items-center justify-between py-4 px-6 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-primary)] hover:border-[var(--accent-primary)]/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <PaletteIcon sx={{ color: "var(--accent-primary)", fontSize: 20 }} />
                          <h3 className="text-lg font-semibold">Theme</h3>
                        </div>
                        <p className="text-[var(--text-secondary)] text-sm">Switch between light and dark themes.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-[var(--text-secondary)]">Light</span>
                        <Switch
                          checked={theme === "dark"}
                          onChange={handleThemeToggle}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: "var(--accent-primary)",
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                              backgroundColor: "var(--accent-primary)",
                            },
                          }}
                        />
                        <span className="text-sm text-[var(--text-secondary)]">Dark</span>
                      </div>
                    </div>

                    {/* Language */} 
                    <div className="flex items-center justify-between py-4 px-6 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-primary)] hover:border-[var(--accent-primary)]/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <LanguageIcon sx={{ color: "var(--accent-primary)", fontSize: 20 }} />
                          <h3 className="text-lg font-semibold">Language</h3>
                        </div>
                        <p className="text-[var(--text-secondary)] text-sm">Choose the language for the website text.</p>
                      </div>
                      <Select
                        value={language}
                        onChange={handleLanguageChange}
                        sx={{
                          color: "var(--text-primary)",
                          backgroundColor: "var(--bg-primary)",
                          borderRadius: "8px",
                          minWidth: 120,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "var(--border-primary)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "var(--accent-primary)",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "var(--accent-primary)",
                          },
                          "& .MuiSvgIcon-root": {
                            color: "var(--accent-primary)",
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
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-secondary)]/95 text-[var(--text-primary)] shadow-[0_8px_20px_rgba(0,0,0,0.35)] z-40 hover:bg-[var(--bg-tertiary)]/95 transition-colors"
            aria-label="Show Now Playing"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-[#CD7F32]"></span>
            Show Now Playing
          </button>
        </div>
      )}

      {/* Change Password Dialog */}
      <Dialog 
        open={changePasswordOpen} 
        onClose={() => setChangePasswordOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'var(--bg-secondary)',
            color: 'var(--text-primary)'
          }
        }}
      >
        <DialogTitle sx={{ position: "relative" }}>
          Change Password
          <IconButton
            onClick={() => setChangePasswordOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8, color: "var(--text-secondary)" }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: 'var(--border-primary)', display: "flex", flexDirection: "column" }}>
        <div className="space-y-4">
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "var(--text-primary)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--border-secondary)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--accent-primary)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--accent-primary)",
                },
              },
              "& .MuiInputLabel-root": {
                color: "var(--text-secondary)",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "var(--accent-primary)",
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
                color: "var(--text-primary)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--border-secondary)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--accent-primary)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--accent-primary)",
                },
              },
              "& .MuiInputLabel-root": {
                color: "var(--text-secondary)",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "var(--accent-primary)",
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
                color: "var(--text-primary)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--border-secondary)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--accent-primary)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--accent-primary)",
                },
              },
              "& .MuiInputLabel-root": {
                color: "var(--text-secondary)",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "var(--accent-primary)",
              },
            }}
          />
          
        </div>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            onClick={() => navigate('/forgot')}
            variant="contained"
            sx={{ backgroundColor: "var(--accent-primary)", "&:hover": { backgroundColor: "var(--accent-secondary)" } }}
          >
            Forgot Password?
          </Button>
        </Box>
      </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderColor: 'var(--border-primary)' }}>
          <Button
            onClick={() => setChangePasswordOpen(false)}
            sx={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ backgroundColor: "var(--accent-primary)", "&:hover": { backgroundColor: "var(--accent-secondary)" } }}
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Email Dialog */}
      <Dialog 
        open={updateEmailOpen} 
        onClose={() => setUpdateEmailOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'var(--bg-secondary)',
            color: 'var(--text-primary)'
          }
        }}
      >
        <DialogTitle sx={{ position: "relative" }}>
          Update Email
          <IconButton
            onClick={() => setUpdateEmailOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8, color: "var(--text-secondary)" }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: 'var(--border-primary)' }}>
          <div className="space-y-4">
            <TextField
              fullWidth
              type="email"
              label="New Email Address"
              value={emailForm.newEmail}
              onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "var(--text-primary)",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--border-secondary)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--accent-primary)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--accent-primary)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "var(--text-secondary)",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "var(--accent-primary)",
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
                  color: "var(--text-primary)",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--border-secondary)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--accent-primary)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--accent-primary)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "var(--text-secondary)",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "var(--accent-primary)",
                },
              }}
            />
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderColor: 'var(--border-primary)' }}>
          <Button
            onClick={() => setUpdateEmailOpen(false)}
            sx={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEmailUpdate}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ backgroundColor: "var(--accent-primary)", "&:hover": { backgroundColor: "var(--accent-secondary)" } }}
          >
            Update Email
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
