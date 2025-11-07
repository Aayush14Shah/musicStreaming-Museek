// UserProfile.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./homePage/Navbar";
import MusicPlayer from "./homePage/MusicPlayer";
import NowPlayingSidebar from "./homePage/NowPlayingSidebar";

import {
  Button,
  IconButton,
  TextField,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

/**
 * Layout notes:
 * - When the NowPlayingSidebar is open, the main content uses a right padding equal to SIDEBAR_WIDTH
 *   so the profile resizes correctly and doesn't get overlapped.
 * - Floating "Show Now Playing" is a text-style rounded button (no icon) as you requested.
 * - Avatar modal is simple/dark, consistent with your previous theme: close icon top-right, Save button.
 */

/* Width reserved for the NowPlayingSidebar (adjust if your sidebar width differs) */
const SIDEBAR_WIDTH_PX = 360;

/**
 * Beautiful gradient avatars for music streaming app
 * Using CSS gradients with bright, vibrant colors
 * 12 unique gradient styles that look modern and professional
 */

// 12 beautiful gradient combinations with bright colors (2 rows × 6 columns)
const GRADIENT_AVATARS = [
  {
    id: 0,
    name: 'Sunset Vibes',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    theme: 'Purple Sunset'
  },
  {
    id: 1,
    name: 'Ocean Waves',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    theme: 'Pink Coral'
  },
  {
    id: 2,
    name: 'Golden Hour',
    gradient: 'linear-gradient(135deg, #fad961 0%, #f76b1c 100%)',
    theme: 'Golden Orange'
  },
  {
    id: 3,
    name: 'Electric Blue',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    theme: 'Cyan Blue'
  },
  {
    id: 4,
    name: 'Forest Green',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    theme: 'Emerald Green'
  },
  {
    id: 5,
    name: 'Royal Purple',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    theme: 'Pink Yellow'
  },
  {
    id: 6,
    name: 'Sunset Orange',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    theme: 'Rose Pink'
  },
  {
    id: 7,
    name: 'Ocean Deep',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    theme: 'Mint Rose'
  },
  {
    id: 8,
    name: 'Fire Red',
    gradient: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)',
    theme: 'Red Pink'
  },
  {
    id: 9,
    name: 'Cosmic Blue',
    gradient: 'linear-gradient(135deg, #2e3192 0%, #1bffff 100%)',
    theme: 'Neon Blue'
  },
  {
    id: 10,
    name: 'Lime Fresh',
    gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    theme: 'Lime Blue'
  },
  {
    id: 11,
    name: 'Violet Dreams',
    gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    theme: 'Violet Sky'
  }
];

/**
 * Generate gradient avatar with user's first letter in center
 * Returns avatar data with gradient and style
 */
const generateGradientAvatar = (avatarData) => {
  return {
    id: avatarData.id,
    gradient: avatarData.gradient,
    name: avatarData.name,
    theme: avatarData.theme,
    style: {
      background: avatarData.gradient,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };
};

/* Generate 12 beautiful gradient avatars */
const AVATARS = GRADIENT_AVATARS.map(avatar => generateGradientAvatar(avatar));

const safeParse = (s, fallback) => {
  if (!s) return fallback;
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
};

export default function UserProfile() {
  const navigate = useNavigate();
  // user id set at login
  const userId = localStorage.getItem("userId");

  // main states
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // layout: whether NowPlayingSidebar is open (read/write to localStorage so other pages sync)
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => localStorage.getItem("isPlaying") === "true"
  );

  // last played track (keeps MusicPlayer working with minimal change)
  const [currentTrack, setCurrentTrack] = useState(() => {
    try {
      const raw = localStorage.getItem("lastPlayedTrack");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // playlists created by user (try DB then localStorage)
  const [playlists, setPlaylists] = useState([]);

  // favorite artists (array of strings per your schema)
  const [favoriteArtists, setFavoriteArtists] = useState([]);

  // recently played (exactly from localStorage.recentlyPlayed using your format)
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  // total listening hours (computed from recentlyPlayed; integer hours)
  const totalListeningHours = useMemo(() => {
    // compute total seconds; fallback per-item 180s when no duration
    const totalSeconds = (recentlyPlayed || []).reduce((acc, item) => {
      const durMs = item.duration_ms ?? item.track?.duration_ms ?? null;
      if (typeof durMs === "number") return acc + Math.max(0, Math.round(durMs / 1000));
      // fallback: 180s (3 min)
      return acc + 180;
    }, 0);
    return Math.round(totalSeconds / 3600); // integer hours
  }, [recentlyPlayed]);

  // Edit name inline
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const nameRef = useRef(null);

  // Avatar modal
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [avatarIndex, setAvatarIndex] = useState(() => {
    const v = localStorage.getItem("avatarIndex");
    const index = v ? Number(v) : 0;
    // Clamp to valid range (0 to AVATARS.length - 1)
    return Math.max(0, Math.min(index, AVATARS.length - 1));
  });
  // temp selection inside modal (discard on cancel)
  const [tempAvatarIndex, setTempAvatarIndex] = useState(avatarIndex);

  /* ---------- Get current avatar style and user initial ---------- */
  const getCurrentAvatarStyle = useMemo(() => {
    if (avatarIndex >= 0 && avatarIndex < AVATARS.length) {
      return AVATARS[avatarIndex].style;
    }
    // Fallback to first avatar if index is invalid
    return AVATARS[0].style;
  }, [avatarIndex]);

  // Get user's first letter for avatar
  const userInitial = useMemo(() => {
    const name = user?.name || localStorage.getItem("userName") || "";
    return name ? name.charAt(0).toUpperCase() : "U";
  }, [user]);

  /* ---------- Load user ---------- */
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingUser(true);
      let fetched = null;

      // Try a likely API endpoint; if not present, fallback to localStorage
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
        const localUser = safeParse(localStorage.getItem("user"), null);
        if (localUser) fetched = localUser;
        else {
          const name = localStorage.getItem("userName");
          const email = localStorage.getItem("userEmail");
          if (name || email) fetched = { name, email };
        }
      }

      if (!mounted) return;
      setUser(fetched);
      setNameInput(fetched?.name || localStorage.getItem("userName") || "");
      setFavoriteArtists(fetched?.favoriteArtists || fetched?.favorite_artists || []);
      // if server returned avatar index, use it (clamp to valid range 0-11 for 12 avatars)
      const av = Number(fetched?.avatarIndex ?? fetched?.avatar ?? localStorage.getItem("avatarIndex") ?? 0);
      if (!Number.isNaN(av)) {
        const validIndex = Math.max(0, Math.min(av, AVATARS.length - 1));
        setAvatarIndex(validIndex);
        setTempAvatarIndex(validIndex);
      }
      setLoadingUser(false);
    };

    load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  /* ---------- Load playlists (user-created) ---------- */
  useEffect(() => {
    // try user-level playlists first
    if (user?.playlists && Array.isArray(user.playlists) && user.playlists.length) {
      setPlaylists(user.playlists);
      return;
    }

    // try typical localStorage keys
    const keys = ["userPlaylists", "museek.playlists", "user_playlists", "playlists"];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setPlaylists(parsed);
          return;
        }
        if (Array.isArray(parsed?.items)) {
          setPlaylists(parsed.items);
          return;
        }
      } catch {
        // ignore
      }
    }
    setPlaylists([]);
  }, [user]);

  /* ---------- Load recentlyPlayed from localStorage ---------- */
  useEffect(() => {
    const raw = localStorage.getItem("recentlyPlayed");
    if (!raw) {
      setRecentlyPlayed([]);
      return;
    }
    const parsed = safeParse(raw, []);
    if (!Array.isArray(parsed)) {
      setRecentlyPlayed([]);
      return;
    }
    setRecentlyPlayed(parsed);
  }, []);

  /* ---------- Storage event sync (other tab updates) ---------- */
  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      if (e.key === "recentlyPlayed") {
        try {
          const parsed = JSON.parse(e.newValue || "[]");
          setRecentlyPlayed(parsed);
        } catch {
          setRecentlyPlayed([]);
        }
      }
      if (e.key === "avatarIndex") {
        const idx = Number(e.newValue ?? 0);
        if (!Number.isNaN(idx)) {
          // Clamp to valid range (0 to AVATARS.length - 1)
          const validIndex = Math.max(0, Math.min(idx, AVATARS.length - 1));
          setAvatarIndex(validIndex);
          setTempAvatarIndex(validIndex);
        }
      }
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

  /* ---------- Inline name save ---------- */
  const saveName = async () => {
    const value = (nameInput || "").trim();
    if (!value) return;
    let saved = false;
    // try PATCH endpoint
    const endpoints = [
      `${API_BASE}/api/user/${userId}/name`,
      `${API_BASE}/api/user/${userId}`,
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: value }),
        });
        if (res.ok) {
          const d = await res.json();
          setUser((u) => ({ ...(u || {}), name: d?.name || value }));
          saved = true;
          break;
        }
      } catch {
        // try next
      }
    }
    if (!saved) {
      // fallback to localStorage only
      localStorage.setItem("userName", value);
      setUser((u) => ({ ...(u || {}), name: value }));
    }
    setEditingName(false);
  };

  /* ---------- Avatar modal handlers ---------- */
  const openAvatarModal = () => {
    setTempAvatarIndex(avatarIndex); // load current
    setAvatarOpen(true);
  };
  const cancelAvatarModal = () => {
    // discard selection
    setTempAvatarIndex(avatarIndex);
    setAvatarOpen(false);
  };
  const confirmAvatarModal = async () => {
    // persist locally
    localStorage.setItem("avatarIndex", String(tempAvatarIndex));
    setAvatarIndex(tempAvatarIndex);
    
    // Dispatch custom event to notify Navbar and other components
    window.dispatchEvent(new CustomEvent('avatarChanged', { 
      detail: { avatarIndex: tempAvatarIndex } 
    }));
    
    // attempt server update (best-effort)
    try {
      await fetch(`${API_BASE}/api/user/${userId}/avatar`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarIndex: tempAvatarIndex }),
      });
    } catch {
      // ignore
    }
    setAvatarOpen(false);
  };

  /* ---------- Sidebar toggle ---------- */
  const toggleSidebar = (open) => {
    setIsSidebarOpen(open);
    localStorage.setItem("isPlaying", open ? "true" : "false");
  };

  /* ---------- Focus name Input when switching to edit ---------- */
  useEffect(() => {
    if (editingName && nameRef.current) {
      nameRef.current.focus();
    }
  }, [editingName]);

  /* ---------- Helper small components ---------- */
  const FriendlyJoined = ({ u }) => {
    const ds = u?.createdAt || u?.created_at || u?.created || u?.joined;
    if (!ds) return <span className="text-xs text-gray-400">Joined: —</span>;
    try {
      const txt = new Date(ds).toLocaleDateString();
      return <span className="text-xs text-gray-400">Joined: {txt}</span>;
    } catch {
      return <span className="text-xs text-gray-400">Joined: {String(ds).split("T")[0]}</span>;
    }
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

          {/* Header Section - Professional Layout */}
          <div className="flex items-start gap-8 mb-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-[#cd7f32] bg-[#111] shadow-lg">
                <div
                  style={getCurrentAvatarStyle}
                  className="w-full h-full"
                  role="img"
                  aria-label="User avatar"
                >
                  <span className="text-white font-bold text-4xl md:text-5xl drop-shadow-lg">
                    {userInitial}
                  </span>
                </div>
              </div>

              {/* edit pen icon: properly positioned circular button */}
              <Tooltip title="Change avatar">
                <button
                  onClick={openAvatarModal}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#cd7f32] border-2 border-[#0f0f0f] rounded-full shadow-lg hover:bg-[#b06f2d] transition-colors flex items-center justify-center"
                  aria-label="Edit avatar"
                >
                  <EditIcon sx={{ color: "#fff", fontSize: 16 }} />
                </button>
              </Tooltip>
            </div>

            {/* Name / email / joined */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  {!editingName ? (
                    <div className="flex items-center gap-3 mb-3">
                      <h1
                        className="text-3xl md:text-4xl font-bold truncate cursor-text"
                        onClick={() => setEditingName(true)}
                        title="Click to edit name"
                      >
                        {user?.name || localStorage.getItem("userName") || "No name"}
                      </h1>
                      <Tooltip title="Edit name">
                        <IconButton
                          size="small"
                          onClick={() => setEditingName(true)}
                          aria-label="Edit name"
                          sx={{ color: "#cd7f32" }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mb-3">
                      <TextField
                        inputRef={nameRef}
                        variant="filled"
                        size="small"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        InputProps={{
                          style: { background: "#181818", color: "#fff", borderRadius: 8 },
                        }}
                      />
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={saveName}
                        sx={{ backgroundColor: "#cd7f32" }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="text"
                        onClick={() => {
                          setEditingName(false);
                          setNameInput(user?.name || localStorage.getItem("userName") || "");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 mb-4">
                    <div className="text-base text-gray-300 truncate">{user?.email || localStorage.getItem("userEmail") || "—"}</div>
                    <FriendlyJoined u={user} />
                  </div>

                  <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
                    Welcome back. Manage your profile, favorites, and recent activity here.
                  </p>
                </div>

                {/* Active summary (only total hours) */}
                <div className="flex-shrink-0">
                  <div className="bg-[#181818] px-6 py-5 rounded-xl text-center min-w-[160px] border border-[#cd7f32]/20">
                    <div className="text-sm text-gray-400 mb-2">Total Listening</div>
                    <div className="text-3xl md:text-4xl font-bold" style={{ color: "#cd7f32" }}>
                      {totalListeningHours}h
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sections with thin line separators */}
          <div className="space-y-8">
            {/* Favorite Artists */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Favorite Artists</h2>
                <span className="text-sm px-3 py-1 rounded-full bg-[#181818] text-gray-300">
                  {(favoriteArtists || []).length} total
                </span>
              </div>

              {loadingUser ? (
                <div className="py-8"><CircularProgress color="inherit" size={24} /></div>
              ) : (favoriteArtists && favoriteArtists.length) ? (
                <div className="flex gap-4 overflow-x-auto py-2">
                  {favoriteArtists.map((name, idx) => {
                    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a1a&color=ffffff&rounded=true&size=64`;
                    return (
                      <div
                        key={`${name}-${idx}`}
                        className="flex-none bg-[#181818] rounded-lg px-4 py-3 flex items-center gap-3 min-w-[200px] hover:bg-[#222] transition-colors"
                      >
                        <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full object-cover" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm text-gray-100 font-medium truncate">{name}</span>
                          <span className="text-xs text-gray-400">Favorite</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-500 py-8 text-center">No favorite artists added yet.</div>
              )}
            </div>

            {/* Thin separator line */}
            <div className="border-t border-[#333]"></div>

            {/* Your Playlists */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Your Playlists</h2>
                <span className="text-sm px-3 py-1 rounded-full bg-[#181818] text-gray-300">
                  {(playlists || []).length} created
                </span>
              </div>

              {playlists && playlists.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {playlists.map((pl, i) => {
                    const id = pl.id || pl._id || `local-${i}`;
                    const cover = (pl.images && pl.images[0] && pl.images[0].url) || pl.cover || `https://placehold.co/300x170?text=${encodeURIComponent(pl.name || "Playlist")}`;
                    return (
                      <div key={id} className="bg-[#181818] rounded-lg p-4 hover:bg-[#222] transition-colors group">
                        <div className="w-full h-40 rounded-md overflow-hidden bg-[#0b0b0b] mb-3">
                          <img src={cover} alt={pl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-100 truncate">{pl.name}</div>
                          {pl.description && <div className="text-xs text-gray-400 mt-1 truncate">{pl.description}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-500 py-8 text-center">You haven't created any playlists yet.</div>
              )}
            </div>

            {/* Thin separator line */}
            <div className="border-t border-[#333]"></div>

            {/* Recently Played */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recently Played</h2>
                <span className="text-sm px-3 py-1 rounded-full bg-[#181818] text-gray-300">
                  {(recentlyPlayed || []).length} items
                </span>
              </div>

              {recentlyPlayed && recentlyPlayed.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {recentlyPlayed.map((rp, i) => {
                    const imageUrl = (rp.images && rp.images[0] && rp.images[0].url) ||
                      (rp.album && rp.album.images && rp.album.images[0] && rp.album.images[0].url) ||
                      `https://placehold.co/300x170?text=${encodeURIComponent(rp.name || "Recent")}`;

                    return (
                      <div key={`${rp.id || rp.name}-${i}`} className="bg-[#181818] rounded-lg p-3 flex gap-3 items-center hover:bg-[#222] transition-colors">
                        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-[#0b0b0b]">
                          <img src={imageUrl} alt={rp.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-100 truncate">{rp.name}</div>
                          <div className="text-xs text-gray-400 truncate">{rp.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-500 py-8 text-center">No recently played tracks found.</div>
              )}
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>

      {/* Music Player - keep existing props / behaviour */}
      <MusicPlayer
        currentTrack={currentTrack}
        isPlaying={isSidebarOpen}
        onTogglePlay={() => {
          toggleSidebar(!isSidebarOpen);
        }}
      />

      {/* Now Playing Sidebar - existing component; ensure it sits on top of right reserved space */}
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

      {/* Professional Avatar Modal with Blurred Background */}
      {avatarOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Blurred background overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={cancelAvatarModal}></div>

          {/* Modal content */}
          <div className="relative bg-[#282828]/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 border border-[#cd7f32]/30">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Choose Your Avatar</h2>
              <button
                onClick={cancelAvatarModal}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700"
                aria-label="close"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Avatar grid - Gradient avatars (2 rows × 6 columns) */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-6">
              {AVATARS.map((avatar, idx) => {
                const selected = idx === tempAvatarIndex;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setTempAvatarIndex(idx)}
                    className={`relative rounded-full overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                      selected 
                        ? "border-[#cd7f32] shadow-lg shadow-[#cd7f32]/30" 
                        : "border-gray-600 hover:border-gray-400"
                    } focus:outline-none focus:ring-2 focus:ring-[#cd7f32]/50 aspect-square`}
                    title={avatar.name}
                  >
                    <div
                      style={avatar.style}
                      className="w-full h-full"
                      role="img"
                      aria-label={avatar.name}
                    >
                      <span className="text-white font-bold text-2xl drop-shadow-lg">
                        {userInitial}
                      </span>
                    </div>
                    {selected && (
                      <div className="absolute top-1 right-1 bg-[#cd7f32] rounded-full p-1 shadow-lg">
                        <CheckIcon sx={{ color: "#fff", fontSize: 14 }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelAvatarModal}
                className="px-6 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmAvatarModal}
                className="px-6 py-2 bg-gradient-to-r from-[#cd7f32] to-[#b06f2d] text-white font-semibold rounded-lg hover:from-[#b06f2d] hover:to-[#cd7f32] transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Save Avatar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
