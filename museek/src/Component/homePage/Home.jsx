import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import HeroBanner from "./HeroBanner";

import CarouselPlaylistRow from "./CarouselPlaylistRow";
import CarouselTrackRow from "./CarouselTrackRow";
import Genres from "./Genres";
import TrackList from "./TrackList";
import MusicPlayer from "./MusicPlayer";
import NowPlayingSidebar from "./NowPlayingSidebar";
import LeftSidebar from "./LeftSidebar";
import { PlaylistView } from "../PlaylistView";

const Home = () => {
  const userId = localStorage.getItem("userId");
  console.log("Home.jsx userId from localStorage:", userId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false); // New state for sidebar visibility
  // const [newReleases, setNewReleases] = useState([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [moodBooster, setMoodBooster] = useState([]);
  const [popularPlaylists, setPopularPlaylists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [heroFeatured] = useState({
    id: "hero1",
    name: "Welcome to Museek",
    description: "Discover your perfect music experience",
    images: [{ url: "https://placehold.co/800x400?text=Welcome+to+Museek" }],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);

  useEffect(() => {
    const savedRecentlyPlayed = localStorage.getItem("recentlyPlayed");
    if (savedRecentlyPlayed) {
      try {
        setRecentlyPlayed(JSON.parse(savedRecentlyPlayed));
      } catch (error) {
        console.error("Error parsing recently played:", error);
      }
    }

    const lastPlayedTrack = localStorage.getItem("lastPlayedTrack");
    if (lastPlayedTrack) {
      try {
        setCurrentTrack(JSON.parse(lastPlayedTrack));
      } catch (error) {
        console.error("Error parsing last played track:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const endpoints = [
          {
            url: "http://localhost:5000/api/genres?country=IN&limit=12",
            setter: setGenres,
            path: "categories.items",
          },
          ...(userId
            ? [
                {
                  url: `http://localhost:5000/api/user-playlists?userId=${userId}`,
                  setter: setUserPlaylists,
                  path: "playlists",
                },
              ]
            : []),
          {
            url: "http://localhost:5000/api/recommended-tracks?seed_genres=pop,rock&limit=12&market=US",
            setter: setRecommendedTracks,
            path: "tracks",
          },
          // { url: 'http://localhost:5000/api/new-releases?limit=8', setter: setNewReleases, path: 'albums.items' },
          {
            url: "http://localhost:5000/api/featured-playlists?limit=8",
            setter: setFeaturedPlaylists,
            path: "playlists.items",
          },
          {
            url: "http://localhost:5000/api/top-tracks?limit=8",
            setter: setTopTracks,
            path: "tracks.items",
          },
          {
            url: "http://localhost:5000/api/mood-booster?limit=8",
            setter: setMoodBooster,
            path: "playlists.items",
          },
          {
            url: "http://localhost:5000/api/popular-playlists?limit=8",
            setter: setPopularPlaylists,
            path: "playlists.items",
          },
        ];

        const fetchPromises = endpoints.map(async ({ url, setter, path }) => {
          try {
            console.log("📡 Fetching:", url);
            const res = await fetch(url);
            if (!res.ok)
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            const data = await res.json();
            let items =
              path.split(".").reduce((obj, key) => obj?.[key], data) || [];

            // Log track data for debugging
            if (
              url.includes("recommended-tracks") ||
              url.includes("top-tracks")
            ) {
              console.log(`📊 ${url} returned ${items.length} items`);
              const tracksWithPreview = items.filter((item) => {
                const track = item.track || item; // Handle both playlist items and direct tracks
                return track.preview_url;
              });
              console.log(
                `✅ Items with preview_url: ${tracksWithPreview.length}/${items.length}`
              );

              if (items.length > tracksWithPreview.length) {
                const tracksWithoutPreview = items.filter((item) => {
                  const track = item.track || item;
                  return !track.preview_url;
                });
                console.log(
                  "❌ Items without preview:",
                  tracksWithoutPreview.slice(0, 3).map((item) => {
                    const track = item.track || item;
                    return `"${track.name}" by ${track.artists?.[0]?.name}`;
                  })
                );
              }
            }
            // Always use sample tracks for recommended-tracks regardless of API response
            if (url.includes("recommended-tracks")) {
              console.log(
                `⚠️ Forcing sample data for ${url} to ensure working audio playback`
              );
              items = [
                {
                  id: "sample1",
                  name: "Kalimba Sample",
                  artists: [{ name: "Sample Artist" }],
                  album: {
                    name: "Demo Album",
                    images: [
                      {
                        url: "https://placehold.co/300x300?text=Kalimba+Sample",
                      },
                    ],
                  },
                  duration_ms: 30000,
                  preview_url:
                    "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
                },
                {
                  id: "sample2",
                  name: "Audio Sample",
                  artists: [{ name: "Demo Artist" }],
                  album: {
                    name: "Test Album",
                    images: [
                      { url: "https://placehold.co/300x300?text=Audio+Sample" },
                    ],
                  },
                  duration_ms: 30000,
                  preview_url:
                    "https://sample-videos.com/zip/10/mp3/SampleAudio_0.4mb_mp3.mp3",
                },
                {
                  id: "sample3",
                  name: "Music Preview",
                  artists: [{ name: "Preview Artist" }],
                  album: {
                    name: "Preview Album",
                    images: [
                      {
                        url: "https://placehold.co/300x300?text=Music+Preview",
                      },
                    ],
                  },
                  duration_ms: 30000,
                  preview_url:
                    "https://file-examples.com/storage/fe68c1b7c1a9d6c2b2d3b9c/2017/11/file_example_MP3_700KB.mp3",
                },
              ];
            } else if (items.length === 0 || data.error) {
              // Fallback to sample data if API returns empty or error for other endpoints
              console.log(
                `⚠️ Using sample data for ${url} due to:`,
                data.error || "empty response"
              );
              if (url.includes("featured-playlists")) {
                items = [
                  {
                    id: "fp1",
                    name: "AUGUST 2025 TOP HITS",
                    description: "Always updated weekly",
                    images: [
                      { url: "https://placehold.co/300x300?text=Top+Hits" },
                    ],
                  },
                  {
                    id: "fp2",
                    name: "Top 50 Pop Hits of August 2025",
                    description: "Pop Songs Playlist",
                    images: [
                      { url: "https://placehold.co/300x300?text=Pop+Hits" },
                    ],
                  },
                  {
                    id: "fp3",
                    name: "AUGUST 2025 CHARTS",
                    description: "Top Hits 2025",
                    images: [
                      { url: "https://placehold.co/300x300?text=Charts" },
                    ],
                  },
                  {
                    id: "fp4",
                    name: "US Top 40 Chart Hits August 2025",
                    description: "Trending and viral songs",
                    images: [
                      { url: "https://placehold.co/300x300?text=US+Top+40" },
                    ],
                  },
                  {
                    id: "fp5",
                    name: "Top New Songs August 2025",
                    description: "New releases",
                    images: [
                      { url: "https://placehold.co/300x300?text=New+Songs" },
                    ],
                  },
                  {
                    id: "fp6",
                    name: "Summer Vibes 2025",
                    description: "Summer playlist",
                    images: [
                      { url: "https://placehold.co/300x300?text=Summer+Vibes" },
                    ],
                  },
                  {
                    id: "fp7",
                    name: "Chill Hits",
                    description: "Relaxing tunes",
                    images: [
                      { url: "https://placehold.co/300x300?text=Chill+Hits" },
                    ],
                  },
                  {
                    id: "fp8",
                    name: "Workout Motivation",
                    description: "Gym playlist",
                    images: [
                      { url: "https://placehold.co/300x300?text=Workout" },
                    ],
                  },
                ];
              } else if (url.includes("top-tracks")) {
                items = [];
              } else if (url.includes("mood-booster")) {
                items = [
                  {
                    id: "mb1",
                    name: "Mood Booster",
                    description: "Happy vibes",
                    images: [
                      { url: "https://placehold.co/300x300?text=Mood+Booster" },
                    ],
                  },
                  {
                    id: "mb2",
                    name: "Positive Energy",
                    description: "Uplifting tracks",
                    images: [
                      {
                        url: "https://placehold.co/300x300?text=Positive+Energy",
                      },
                    ],
                  },
                  {
                    id: "mb3",
                    name: "Feel Good",
                    description: "Good mood playlist",
                    images: [
                      { url: "https://placehold.co/300x300?text=Feel+Good" },
                    ],
                  },
                  {
                    id: "mb4",
                    name: "Happy Hits",
                    description: "Happy songs",
                    images: [
                      { url: "https://placehold.co/300x300?text=Happy+Hits" },
                    ],
                  },
                  {
                    id: "mb5",
                    name: "Uplift",
                    description: "Motivational music",
                    images: [
                      { url: "https://placehold.co/300x300?text=Uplift" },
                    ],
                  },
                  {
                    id: "mb6",
                    name: "Joyful Tunes",
                    description: "Joyful playlist",
                    images: [
                      { url: "https://placehold.co/300x300?text=Joyful+Tunes" },
                    ],
                  },
                  {
                    id: "mb7",
                    name: "Smile Songs",
                    description: "Songs to make you smile",
                    images: [
                      { url: "https://placehold.co/300x300?text=Smile+Songs" },
                    ],
                  },
                  {
                    id: "mb8",
                    name: "Good Vibes",
                    description: "Positive vibes only",
                    images: [
                      { url: "https://placehold.co/300x300?text=Good+Vibes" },
                    ],
                  },
                ];
              } else if (url.includes("popular-playlists")) {
                items = [
                  {
                    id: "pp1",
                    name: "Popular Hits",
                    description: "Trending now",
                    images: [
                      { url: "https://placehold.co/300x300?text=Popular+Hits" },
                    ],
                  },
                  {
                    id: "pp2",
                    name: "Viral 50",
                    description: "Viral tracks",
                    images: [
                      { url: "https://placehold.co/300x300?text=Viral+50" },
                    ],
                  },
                  {
                    id: "pp3",
                    name: "Top Global",
                    description: "Global top songs",
                    images: [
                      { url: "https://placehold.co/300x300?text=Top+Global" },
                    ],
                  },
                  {
                    id: "pp4",
                    name: "Hot Hits USA",
                    description: "US hits",
                    images: [
                      { url: "https://placehold.co/300x300?text=Hot+Hits+USA" },
                    ],
                  },
                  {
                    id: "pp5",
                    name: "Today's Top Hits",
                    description: "Current top",
                    images: [
                      {
                        url: "https://placehold.co/300x300?text=Today's+Top+Hits",
                      },
                    ],
                  },
                  {
                    id: "pp6",
                    name: "RapCaviar",
                    description: "Rap playlist",
                    images: [
                      { url: "https://placehold.co/300x300?text=RapCaviar" },
                    ],
                  },
                  {
                    id: "pp7",
                    name: "Rock This",
                    description: "Rock hits",
                    images: [
                      { url: "https://placehold.co/300x300?text=Rock+This" },
                    ],
                  },
                  {
                    id: "pp8",
                    name: "Viva Latino",
                    description: "Latin hits",
                    images: [
                      { url: "https://placehold.co/300x300?text=Viva+Latino" },
                    ],
                  },
                ];
                // } else if (url.includes('new-releases')) {
                //   items = [
                //     { id: 'nr1', name: 'New Album 1', description: 'Fresh release', images: [{ url: 'https://placehold.co/300x300?text=New+Album+1' }] },
                //     { id: 'nr2', name: 'New Album 2', description: 'Latest drop', images: [{ url: 'https://placehold.co/300x300?text=New+Album+2' }] },
                //     { id: 'nr3', name: 'New Album 3', description: 'Brand new', images: [{ url: 'https://placehold.co/300x300?text=New+Album+3' }] },
                //     { id: 'nr4', name: 'New Album 4', description: 'Recent release', images: [{ url: 'https://placehold.co/300x300?text=New+Album+4' }] },
                //     { id: 'nr5', name: 'New Album 5', description: 'New music', images: [{ url: 'https://placehold.co/300x300?text=New+Album+5' }] },
                //     { id: 'nr6', name: 'New Album 6', description: 'Fresh tracks', images: [{ url: 'https://placehold.co/300x300?text=New+Album+6' }] },
                //     { id: 'nr7', name: 'New Album 7', description: 'Latest album', images: [{ url: 'https://placehold.co/300x300?text=New+Album+7' }] },
                //     { id: 'nr8', name: 'New Album 8', description: 'New release', images: [{ url: 'https://placehold.co/300x300?text=New+Album+8' }] }
                //   ];
              }
            }

            // Ensure images fallback and FILTER OUT TRACKS WITHOUT PREVIEWS
            items = items
              .filter((item) => item !== null)
              .map((item) => ({
                ...item,
                images:
                  item.images && item.images.length > 0
                    ? item.images
                    : [
                        {
                          url: `https://placehold.co/300x300?text=${encodeURIComponent(
                            item.name || "Placeholder"
                          )}`,
                        },
                      ],
                album: item.album
                  ? {
                      ...item.album,
                      images: item.album.images || [
                        {
                          url: `https://placehold.co/300x300?text=${encodeURIComponent(
                            item.album?.name || "Album"
                          )}`,
                        },
                      ],
                    }
                  : item.album,
              }));
            // Don't filter out tracks - let backend and fallback system handle previews
            setter(items);
          } catch (err) {
            console.error(`Error fetching ${url}:`, err);
            setter([]);
          }
        });

        await Promise.all(fetchPromises);
      } catch (err) {
        setError("Failed to load some data. Please try again.");
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // Helper function to show notifications
  const showNotification = (title, message, type = "error") => {
    const notification = document.createElement("div");
    const bgColor =
      type === "error"
        ? "from-red-500 to-red-600"
        : type === "info"
        ? "from-blue-500 to-blue-600"
        : type === "success"
        ? "from-green-500 to-green-600"
        : "from-gray-500 to-gray-600";

    notification.className = `fixed top-20 right-4 bg-gradient-to-r ${bgColor} text-white px-6 py-3 rounded-lg shadow-xl z-50 transition-all duration-300 max-w-sm`;
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
        </svg>
        <div>
          <div class="font-medium">${title}</div>
          <div class="text-sm opacity-90">${message}</div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 4000);
  };

  const handleTrackClick = async (item = null) => {
    if (item) {
      console.log("🎵 Track clicked:", {
        id: item.id,
        name: item.name,
        artist: item.artists?.map((a) => a.name).join(", "),
        hasPreviewUrl: !!item.preview_url,
        previewUrl: item.preview_url,
        source: "direct_click",
      });

      let playableTrack = {
        id: item.id,
        title: item.name,
        artist:
          item.artists?.map((a) => a.name).join(", ") ||
          item.description ||
          "Unknown Artist",
        image:
          item.images?.[0]?.url ||
          item.album?.images?.[0]?.url ||
          "https://placehold.co/300x300?text=Track",
        duration: item.duration_ms ? Math.floor(item.duration_ms / 1000) : 30,
        album: item.album?.name || "Unknown Album",
        uri: item.uri,
        audioUrl: item.preview_url || null,
      };

      console.log("🔍 Initial track data:", {
        hasAudioUrl: !!playableTrack.audioUrl,
        audioUrl: playableTrack.audioUrl,
      });

      // All tracks from backend now have preview URLs, but double-check
      if (!playableTrack.audioUrl) {
        console.log(
          "⚠️ Unexpected: Track without preview URL (should be filtered by backend)"
        );
        console.log("🔄 Trying backend API as fallback...");

        try {
          const response = await fetch(
            `http://localhost:5000/api/spotify/track?trackId=${playableTrack.id}`
          );
          const trackData = await response.json();

          if (trackData.preview_url) {
            console.log(
              "✅ Got preview URL from backend API:",
              trackData.preview_url
            );
            playableTrack.audioUrl = trackData.preview_url;

            if (trackData.alternative_version) {
              showNotification(
                "Playing Alternative Version",
                `Found preview for "${
                  trackData.alternative_track_name || playableTrack.title
                }"`,
                "info"
              );
            } else if (trackData.alternative_market) {
              showNotification(
                "Playing Regional Version",
                `Found preview from ${trackData.alternative_market} region`,
                "info"
              );
            }
          } else {
            // Try Deezer preview as additional fallback
            console.log("🔍 Trying Deezer preview...");
            try {
              const dzResp = await fetch(
                `http://localhost:5000/api/deezer/preview?trackName=${encodeURIComponent(
                  playableTrack.title
                )}&artistName=${encodeURIComponent(playableTrack.artist)}`
              );
              const dzData = await dzResp.json();
              if (dzData.found && dzData.preview_url) {
                playableTrack.audioUrl = dzData.preview_url;
                showNotification(
                  "Playing Deezer Preview",
                  `Preview found on Deezer for "${dzData.title}"`,
                  "info"
                );
              }
            } catch (dzErr) {
              console.log("❌ Deezer preview failed:", dzErr);
            }

            // Try YouTube preview as last-resort before sample audio
            if (!playableTrack.audioUrl) {
              console.log("🔍 Trying YouTube preview...");
              try {
                const ytResp = await fetch(
                  `http://localhost:5000/api/youtube/preview?trackName=${encodeURIComponent(
                    playableTrack.title
                  )}&artistName=${encodeURIComponent(playableTrack.artist)}`
                );
                const ytData = await ytResp.json();
                if (ytData.found && ytData.preview_url) {
                  playableTrack.audioUrl = ytData.preview_url;
                  showNotification(
                    "Playing YouTube Preview",
                    ytData.title || playableTrack.title,
                    "info"
                  );
                }
              } catch (ytErr) {
                console.log("❌ YouTube preview failed:", ytErr);
              }
            }

            // Final fallback - only if still no preview
            if (!playableTrack.audioUrl) {
              playableTrack.audioUrl =
                "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3";
              showNotification(
                "Playing Sample Audio",
                `No preview available for "${
                  playableTrack.title.length > 30
                    ? playableTrack.title.substring(0, 30) + "..."
                    : playableTrack.title
                }"`,
                "warning"
              );
            }
          }
        } catch (apiError) {
          console.log("❌ Backend API call failed:", apiError);
          playableTrack.audioUrl =
            "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3";
          showNotification(
            "Playing Sample Audio",
            `API unavailable - using sample for "${
              playableTrack.title.length > 30
                ? playableTrack.title.substring(0, 30) + "..."
                : playableTrack.title
            }"`,
            "warning"
          );
        }
      } else {
        console.log(
          "✅ Track already has preview URL:",
          playableTrack.audioUrl
        );
      }

      console.log("🔍 Final track preview status:", {
        hasPreviewUrl: !!playableTrack.audioUrl,
        previewUrl: playableTrack.audioUrl,
      });

      console.log("✅ SUCCESS: Track has preview, setting up playback:", {
        title: playableTrack.title,
        audioUrl: playableTrack.audioUrl,
        duration: playableTrack.duration,
      });

      setCurrentTrack(playableTrack);
      localStorage.setItem("lastPlayedTrack", JSON.stringify(playableTrack));

      const newRecentlyPlayed = [
        {
          id: item.id,
          name: item.name,
          description:
            item.artists?.map((a) => a.name).join(", ") ||
            item.description ||
            "Recently played",
          images: item.images ||
            item.album?.images || [
              {
                url: `https://placehold.co/300x300?text=${encodeURIComponent(
                  item.name || "Recent"
                )}`,
              },
            ],
        },
        ...recentlyPlayed.filter((rp) => rp.id !== item.id).slice(0, 9),
      ];
      setRecentlyPlayed(newRecentlyPlayed);
      localStorage.setItem("recentlyPlayed", JSON.stringify(newRecentlyPlayed));

      // Auto-start playing the preview
      setIsPlaying(true);
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarVisible(false);
    // Remove setIsPlaying(false) from here
  };

  const handlePlaylistClick = async (playlist) => {
    setSelectedPlaylist(playlist);
    try {
      const res = await fetch(
        `http://localhost:5000/api/playlist-tracks?playlistId=${playlist.id}&market=IN`
      );
      if (res.ok) {
        const data = await res.json();
        setPlaylistTracks(data.items?.map((item) => item.track) || []);
      }
    } catch (err) {
      console.error("Failed to fetch playlist tracks:", err);
      setPlaylistTracks([]);
    }
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#0e0e0e] dark group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <Navbar />
      <LeftSidebar />
      <div
        className={`
    layout-container 
    flex flex-col grow w-full transition-all duration-300 ease-in-out 
    pt-[60px] pb-24
    md:pl-[16.5rem]
    ${
      isSidebarVisible
        ? "md:pr-[20rem] lg:pr-[22rem]" // adjusted right padding to match sidebar widths
        : "pr-0"
    }
  `}
      >
        <div className="m-1.5 md:mx-2 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.45)] bg-[#0e0e0e] p-2">
          <div className="rounded-2xl bg-[#181818] p-4 md:p-6">
            {/* CONDITIONAL RENDER */}
            {selectedPlaylist ? (
              <PlaylistView
                playlist={selectedPlaylist}
                tracks={playlistTracks}
                onTrackClick={handleTrackClick}
                onBack={() => {
                  setSelectedPlaylist(null);
                }}
              />
            ) : (
              <>
                {isLoading && (
                  <p className="text-[#F5F5F5] text-center py-8 text-lg">
                    Loading...
                  </p>
                )}
                {error && (
                  <p className="text-red-500 text-center py-8 text-lg">
                    {error}
                  </p>
                )}

                <HeroBanner featured={heroFeatured} />

                {/* <CarouselPlaylistRow title="New Releases" items={newReleases} onPlaylistClick={handlePlaylistClick} /> */}
                <CarouselPlaylistRow
                  title="Artist Playlists"
                  items={userPlaylists}
                  onPlaylistClick={handlePlaylistClick}
                />
                <CarouselPlaylistRow
                  title="Featured Playlists"
                  items={featuredPlaylists}
                  onPlaylistClick={handlePlaylistClick}
                />
                <CarouselTrackRow
                  title="Top Tracks"
                  items={topTracks}
                  onTrackClick={handleTrackClick}
                />
                <CarouselPlaylistRow
                  title="Recently Played"
                  items={recentlyPlayed}
                  onPlaylistClick={handlePlaylistClick}
                />
                <CarouselPlaylistRow
                  title="Popular Playlists"
                  items={popularPlaylists}
                  onPlaylistClick={handlePlaylistClick}
                />
                <CarouselPlaylistRow
                  title="Mood Booster"
                  items={moodBooster}
                  onPlaylistClick={handlePlaylistClick}
                />
                <TrackList
                  items={recommendedTracks}
                  onTrackClick={handleTrackClick}
                />
                <Genres items={genres} />
              </>
            )}
          </div>
        </div>
      </div>
      <MusicPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((prev) => !prev)}
      />

      <aside
        className={`
          fixed top-[0px] right-0 
          w-[18rem] md:w-[20rem] lg:w-[22rem]
          h-[calc(100vh)]
          overflow-y-auto
          bg-transparent text-[#F5F5F5] z-40 
          transform transition-transform duration-300 ease-in-out
          ${isSidebarVisible ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <NowPlayingSidebar
          currentTrack={currentTrack}
          onClose={handleCloseSidebar}
          isOpen={isSidebarVisible}
        />
      </aside>
      {/* <NowPlayingSidebar
        currentTrack={currentTrack}
        onClose={handleCloseSidebar}
        isOpen={isSidebarVisible}
      /> */}

      {!isSidebarVisible && (
        <button
          onClick={() => setIsSidebarVisible(true)}
          className="hidden md:flex fixed right-4 bottom-24 items-center gap-2 px-4 py-2 rounded-full bg-[#0e0e0e]/95 text-[#F5F5F5] shadow-[0_8px_20px_rgba(0,0,0,0.35)] z-50 hover:bg-[#151515]/95 transition-colors"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-[#CD7F32]"></span>
          Show Now Playing
        </button>
      )}
    </div>
  );
};

export default Home;
