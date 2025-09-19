// UserProfile.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "./homePage/Navbar";
import MusicPlayer from "./homePage/MusicPlayer";
import NowPlayingSidebar from "./homePage/NowPlayingSidebar";

import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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

/* Avatars placeholder - replace URLs with your actual assets if needed */
const AVATARS = Array.from({ length: 12 }).map(
  (_, i) => `https://avatars.dicebear.com/api/avataaars/seed${i + 1}.png`
);

const safeParse = (s, fallback) => {
  if (!s) return fallback;
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
};

export default function UserProfile() {
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
    return v ? Number(v) : 0;
  });
  // temp selection inside modal (discard on cancel)
  const [tempAvatarIndex, setTempAvatarIndex] = useState(avatarIndex);

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
      // if server returned avatar index, use it
      const av = Number(fetched?.avatarIndex ?? fetched?.avatar ?? localStorage.getItem("avatarIndex") ?? 0);
      if (!Number.isNaN(av)) {
        setAvatarIndex(av);
        setTempAvatarIndex(av);
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
          setAvatarIndex(idx);
          setTempAvatarIndex(idx);
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
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <Navbar />

      {/* main area reserves space on the right when sidebar open */}
      <div
        className="pt-[64px] pb-28 transition-all duration-200"
        style={{ paddingRight: isSidebarOpen ? `${SIDEBAR_WIDTH_PX}px` : undefined }}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          {/* Header Row */}
          <div className="flex items-start gap-6 md:gap-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#222] bg-[#111] shadow-sm">
                <img
                  src={AVATARS[avatarIndex % AVATARS.length]}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* edit pen icon: small circular button overlapping bottom-right */}
              <Tooltip title="Change avatar">
                <button
                  onClick={openAvatarModal}
                  className="absolute right-0 bottom-0 transform translate-x-1/4 translate-y-1/4 bg-[#0f0f0f] border border-[#2a2a2a] p-2 rounded-full shadow-md"
                  aria-label="Edit avatar"
                >
                  <EditIcon fontSize="small" sx={{ color: "#cd7f32" }} />
                </button>
              </Tooltip>
            </div>

            {/* Name / email / joined */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {!editingName ? (
                    <div className="flex items-center gap-3">
                      <h1
                        className="text-2xl md:text-3xl font-bold truncate cursor-text"
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
                    <div className="flex items-center gap-3">
                      <TextField
                        inputRef={nameRef}
                        variant="filled"
                        size="small"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        InputProps={{
                          style: { background: "#0f0f0f", color: "#fff", borderRadius: 8 },
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

                  <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-6">
                    <div className="text-sm text-gray-300 truncate">{user?.email || localStorage.getItem("userEmail") || "—"}</div>
                    <FriendlyJoined u={user} />
                  </div>
                </div>

                {/* Active summary (only total hours) */}
                <div className="flex-shrink-0 mt-1 md:mt-0">
                  <div className="bg-[#0f0f0f] px-4 py-3 rounded-lg text-center min-w-[120px]">
                    <div className="text-xs text-gray-400">Total Listening</div>
                    <div className="text-xl md:text-2xl font-semibold" style={{ color: "#cd7f32" }}>
                      {totalListeningHours}h
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-400 max-w-2xl">
                Welcome back! Here are your own playlists and recent activity. This page keeps layout consistent when the player sidebar opens.
              </p>
            </div>
          </div>

          {/* Favorite Artists */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Favorite Artists</h2>
              <div className="text-sm text-gray-400">{(favoriteArtists || []).length} artists</div>
            </div>

            <div className="mt-3">
              {/* neat horizontal scroller of artist chips */}
              {loadingUser ? (
                <div className="py-6"><CircularProgress color="inherit" size={24} /></div>
              ) : (favoriteArtists && favoriteArtists.length) ? (
                <div className="flex gap-3 overflow-x-auto py-2">
                  {favoriteArtists.map((name, idx) => {
                    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a1a&color=ffffff&rounded=true&size=64`;
                    return (
                      <div
                        key={`${name}-${idx}`}
                        className="flex-none bg-[#0f0f0f] border border-[#222] rounded-lg px-3 py-2 flex items-center gap-3 shadow-sm min-w-[160px]"
                      >
                        <img src={avatarUrl} alt={name} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-100 font-medium truncate">{name}</span>
                          <span className="text-xs text-gray-400">Favorite</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-500 py-3">No favorite artists added yet.</div>
              )}
            </div>
          </div>

          {/* Your Playlists */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Playlists</h2>
              <div className="text-sm text-gray-400">{(playlists || []).length} created</div>
            </div>

            <div className="mt-4">
              {playlists && playlists.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {playlists.map((pl, i) => {
                    const id = pl.id || pl._id || `local-${i}`;
                    const cover = (pl.images && pl.images[0] && pl.images[0].url) || pl.cover || `https://placehold.co/300x170?text=${encodeURIComponent(pl.name || "Playlist")}`;
                    return (
                      <div key={id} className="bg-[#0f0f0f] rounded-lg p-3 border border-transparent hover:border-[#222] transition">
                        <div className="w-full h-36 rounded-md overflow-hidden bg-[#0b0b0b]">
                          <img src={cover} alt={pl.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="mt-3">
                          <div className="text-sm font-semibold text-gray-100 truncate">{pl.name}</div>
                          {pl.description && <div className="text-xs text-gray-400 mt-1 truncate">{pl.description}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-gray-500">You haven't created any playlists yet.</div>
              )}
            </div>
          </div>

          {/* Recently Played - shorter landscape cards */}
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recently Played</h2>
              <div className="text-sm text-gray-400">{(recentlyPlayed || []).length} items</div>
            </div>

            <div className="mt-4">
              {recentlyPlayed && recentlyPlayed.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {recentlyPlayed.map((rp, i) => {
                    // rp.images is array with { url } per your format
                    const imageUrl = (rp.images && rp.images[0] && rp.images[0].url) ||
                      (rp.album && rp.album.images && rp.album.images[0] && rp.album.images[0].url) ||
                      `https://placehold.co/300x170?text=${encodeURIComponent(rp.name || "Recent")}`;

                    return (
                      <div key={`${rp.id || rp.name}-${i}`} className="bg-[#0f0f0f] rounded-lg p-2 flex gap-3 items-center">
                        <div className="w-36 h-20 rounded-md overflow-hidden flex-shrink-0 bg-[#0b0b0b]">
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
                <div className="py-8 text-gray-500">No recently played tracks found.</div>
              )}
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

      {/* Floating "Show Now Playing" — text button (no icon) bottom-right, exactly as you requested */}
      {!isSidebarOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => toggleSidebar(true)}
            className="px-4 py-2 rounded-full font-semibold shadow-lg"
            style={{
              background: "#cd7f32",
              color: "#111",
            }}
            aria-label="Show Now Playing"
          >
            Show Now Playing
          </button>
        </div>
      )}

      {/* Avatar modal - simple, consistent, no reset, no textual cancel (close icon only) */}
      <Dialog open={avatarOpen} onClose={cancelAvatarModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#121212", color: "#fff", position: "relative" }}>
          Choose avatar
          <IconButton
            onClick={cancelAvatarModal}
            sx={{ position: "absolute", right: 8, top: 8, color: "#fff" }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ bgcolor: "#0b0b0b" }}>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {AVATARS.map((src, idx) => {
              const selected = idx === tempAvatarIndex;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => setTempAvatarIndex(idx)}
                  className={`relative rounded-lg overflow-hidden border ${selected ? "border-[#cd7f32]" : "border-transparent"} focus:outline-none`}
                >
                  <div className="w-full aspect-[1/1] bg-[#0b0b0b] flex items-center justify-center p-2">
                    <img src={src} alt={`avatar-${idx}`} className="max-w-full max-h-full object-contain rounded-md" />
                  </div>
                  {selected && (
                    <div className="absolute top-2 right-2 bg-black/70 rounded-full p-0.5">
                      <CheckIcon sx={{ color: "#cd7f32", fontSize: 18 }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>

        <DialogActions sx={{ bgcolor: "#121212", px: 3, py: 2 }}>
          <div style={{ flex: 1 }} />
          <Button
            variant="contained"
            onClick={confirmAvatarModal}
            startIcon={<SaveIcon />}
            sx={{ backgroundColor: "#cd7f32" }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
