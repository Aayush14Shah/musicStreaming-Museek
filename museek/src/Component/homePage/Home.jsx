  // Updated Home.jsx (added padding for music player, improved layout)
  import React, { useState, useEffect } from 'react';
  import Navbar from './Navbar';
  import HeroBanner from './HeroBanner';
  import PlaylistRow from './PlaylistRow';
  import Genres from './Genres';
  import TrackList from './TrackList';
  import MusicPlayer from './MusicPlayer';
  import NowPlayingSidebar from './NowPlayingSidebar';
  import LeftSidebar from './LeftSidebar';
  
  const Home = () => {
  const userId = localStorage.getItem('userId');
  console.log('Home.jsx userId from localStorage:', userId);
    const [isPlaying, setIsPlaying] = useState(true); // right sidebar open by default
    const [newReleases, setNewReleases] = useState([]);
    const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
    const [topTracks, setTopTracks] = useState([]);
    const [moodBooster, setMoodBooster] = useState([]);
    const [popularPlaylists, setPopularPlaylists] = useState([]);
    const [genres, setGenres] = useState([]);
    const [recommendedTracks, setRecommendedTracks] = useState([]);
    const [recentlyPlayed, setRecentlyPlayed] = useState([]);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [heroFeatured, setHeroFeatured] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
  
    const currentTrack = {
      title: 'Mitwa',
      artist: 'Shankar-Ehsaan-Loy',
      image: 'https://placehold.co/300?text=Album+Cover', // Updated placeholder
    };
  
    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const endpoints = [
            { url: 'http://localhost:5000/api/new-releases?country=IN&limit=12', setter: setNewReleases, path: 'albums.items' },
            { url: 'http://localhost:5000/api/featured-playlists?country=IN&limit=12', setter: setFeaturedPlaylists, path: 'playlists.items' },
            { url: 'http://localhost:5000/api/top-tracks?limit=12', setter: setTopTracks, path: 'items' },
            { url: 'http://localhost:5000/api/mood-booster?limit=12', setter: setMoodBooster, path: 'playlists.items' },
            { url: 'http://localhost:5000/api/popular-playlists?limit=12', setter: setPopularPlaylists, path: 'playlists.items' },
            { url: 'http://localhost:5000/api/genres?country=IN&limit=12', setter: setGenres, path: 'categories.items' },
            // personalized playlists
            ...(userId ? [{ url: `http://localhost:5000/api/user-playlists?userId=${userId}`, setter: setUserPlaylists, path: 'playlists' }] : []),
            { url: 'http://localhost:5000/api/recommended-tracks?seed_genres=pop,rock&limit=12', setter: setRecommendedTracks, path: 'tracks' },
          ];
  
          const fetchPromises = endpoints.map(async ({ url, setter, path }) => {
            try {
              const res = await fetch(url);
              if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
              const data = await res.json();
              const items = path.split('.').reduce((obj, key) => obj?.[key], data) || [];
              const filteredItems = items.filter(item => item !== null);
              if(url.includes('/api/user-playlists')) console.log('User artist playlists fetched:', filteredItems.map(p=>p.name));
              setter(filteredItems);
              if (url.includes('featured-playlists')) setHeroFeatured(filteredItems[0] || null);
            } catch (err) {
              console.error(`Error fetching ${url}:`, err);
              setter([]); // Set empty array to prevent component crashes
            }
          });
  
          await Promise.all(fetchPromises);
        } catch (err) {
          setError('Failed to load some data. Please try again.');
          console.error('Fetch error:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [userId]);
  
    const handlePlay = () => {
      setIsPlaying(true);
    };
  
    const handleCloseSidebar = () => {
      setIsPlaying(false);
    };
  
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-[#121212] dark group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, \"Noto Sans\", sans-serif' }}>
        <Navbar />
        <LeftSidebar />
        <div className={`layout-container flex h-full grow flex-col min-h-screen w-full transition-all duration-300 ease-in-out pt-[60px] pb-16 md:pb-20 md:pl-[17rem] lg:pl-[18.5rem] ${isPlaying ? 'md:pr-[20.5rem]' : 'md:pr-2'}`}>
          {/* Outer card for middle content */}
          <div className="m-1.5 md:mx-2 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.45)] bg-[#0e0e0e] p-2">
            <div className="rounded-2xl bg-[#181818] p-4 md:p-6">
              {isLoading && <p className="text-[#F5F5F5] text-center py-8 text-lg">Loading...</p>}
              {error && <p className="text-red-500 text-center py-8 text-lg">{error}</p>}
              <HeroBanner featured={heroFeatured} />
              <PlaylistRow title="New Releases" items={newReleases} />
              <PlaylistRow title="Artist Playlists" items={userPlaylists} />
              <PlaylistRow title="Featured Playlists" items={featuredPlaylists} />
              <TrackList items={recommendedTracks} />
              <PlaylistRow title="Top Tracks" items={topTracks} />
              <PlaylistRow title="Recently Played" items={recentlyPlayed} />
              <PlaylistRow title="Popular Playlists" items={popularPlaylists} />
              <PlaylistRow title="Mood Booster" items={moodBooster} />
              <Genres items={genres} />
            </div>
          </div>
        </div>
        <MusicPlayer onPlay={handlePlay} />
        <NowPlayingSidebar currentTrack={currentTrack} onClose={handleCloseSidebar} isOpen={isPlaying} />
        {!isPlaying && (
          <button
            onClick={() => setIsPlaying(true)}
            className="hidden md:flex fixed right-1.5 bottom-24 items-center gap-2 px-4 py-2 rounded-full bg-[#0e0e0e]/95 text-[#F5F5F5] shadow-[0_8px_20px_rgba(0,0,0,0.35)] z-40 hover:bg-[#151515]/95 transition-colors"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-[#4ade80]"></span>
            Show Now Playing
          </button>
        )}
      </div>
    );
  };
  
  export default Home;