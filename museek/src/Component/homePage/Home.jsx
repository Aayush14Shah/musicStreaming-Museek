import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import HeroBanner from './HeroBanner';
import PlaylistRow from './PlaylistRow';
import CarouselPlaylistRow from './CarouselPlaylistRow';
import CarouselTrackRow from './CarouselTrackRow';
import Genres from './Genres';
import TrackList from './TrackList';
import MusicPlayer from './MusicPlayer';
import NowPlayingSidebar from './NowPlayingSidebar';
import LeftSidebar from './LeftSidebar';

const Home = () => {
  const userId = localStorage.getItem('userId');
  console.log('Home.jsx userId from localStorage:', userId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [newReleases, setNewReleases] = useState([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [moodBooster, setMoodBooster] = useState([]);
  const [popularPlaylists, setPopularPlaylists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [heroFeatured, setHeroFeatured] = useState({
    id: 'hero1',
    name: 'Welcome to Museek',
    description: 'Discover your perfect music experience',
    images: [{ url: 'https://placehold.co/800x400?text=Welcome+to+Museek' }]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedRecentlyPlayed = localStorage.getItem('recentlyPlayed');
    if (savedRecentlyPlayed) {
      try {
        setRecentlyPlayed(JSON.parse(savedRecentlyPlayed));
      } catch (error) {
        console.error('Error parsing recently played:', error);
      }
    }
    
    const lastPlayedTrack = localStorage.getItem('lastPlayedTrack');
    if (lastPlayedTrack) {
      try {
        setCurrentTrack(JSON.parse(lastPlayedTrack));
      } catch (error) {
        console.error('Error parsing last played track:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const endpoints = [
          { url: 'http://localhost:5000/api/genres?country=IN&limit=12', setter: setGenres, path: 'categories.items' },
          ...(userId ? [{ url: `http://localhost:5000/api/user-playlists?userId=${userId}`, setter: setUserPlaylists, path: 'playlists', preserveSampleData: true }] : []),
          { url: 'http://localhost:5000/api/recommended-tracks?seed_genres=pop,rock&limit=12', setter: setRecommendedTracks, path: 'tracks' },
          { url: 'http://localhost:5000/api/new-releases?limit=8', setter: setNewReleases, path: 'albums.items' },
          { url: 'http://localhost:5000/api/featured-playlists?limit=8', setter: setFeaturedPlaylists, path: 'playlists.items' },
          { url: 'http://localhost:5000/api/top-tracks?limit=8', setter: setTopTracks, path: 'tracks.items' },
          { url: 'http://localhost:5000/api/mood-booster?limit=8', setter: setMoodBooster, path: 'playlists.items' },
          { url: 'http://localhost:5000/api/popular-playlists?limit=8', setter: setPopularPlaylists, path: 'playlists.items' },
        ];

        const fetchPromises = endpoints.map(async ({ url, setter, path, preserveSampleData }) => {
          try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            const data = await res.json();
            let items = path.split('.').reduce((obj, key) => obj?.[key], data) || [];
            if (items.length === 0) {
              // Fallback to sample data if API returns empty
              if (url.includes('featured-playlists')) {
                items = [
                  { id: 'fp1', name: 'AUGUST 2025 TOP HITS', description: 'Always updated weekly', images: [{ url: 'https://placehold.co/300x300?text=Top+Hits' }] },
                  { id: 'fp2', name: 'Top 50 Pop Hits of August 2025', description: 'Pop Songs Playlist', images: [{ url: 'https://placehold.co/300x300?text=Pop+Hits' }] },
                  { id: 'fp3', name: 'AUGUST 2025 CHARTS', description: 'Top Hits 2025', images: [{ url: 'https://placehold.co/300x300?text=Charts' }] },
                  { id: 'fp4', name: 'US Top 40 Chart Hits August 2025', description: 'Trending and viral songs', images: [{ url: 'https://placehold.co/300x300?text=US+Top+40' }] },
                  { id: 'fp5', name: 'Top New Songs August 2025', description: 'New releases', images: [{ url: 'https://placehold.co/300x300?text=New+Songs' }] },
                  { id: 'fp6', name: 'Summer Vibes 2025', description: 'Summer playlist', images: [{ url: 'https://placehold.co/300x300?text=Summer+Vibes' }] },
                  { id: 'fp7', name: 'Chill Hits', description: 'Relaxing tunes', images: [{ url: 'https://placehold.co/300x300?text=Chill+Hits' }] },
                  { id: 'fp8', name: 'Workout Motivation', description: 'Gym playlist', images: [{ url: 'https://placehold.co/300x300?text=Workout' }] }
                ];
              } else if (url.includes('top-tracks')) {
                items = [
                  { id: 'tt1', name: 'APT', artists: [{ name: 'ROSÉ, Bruno Mars' }], album: { name: 'Album1', images: [{ url: 'https://placehold.co/300x300?text=APT' }] }, duration_ms: 180000 },
                  { id: 'tt2', name: 'Die With A Smile', artists: [{ name: 'Lady Gaga, Bruno Mars' }], album: { name: 'Album2', images: [{ url: 'https://placehold.co/300x300?text=Die+With+A+Smile' }] }, duration_ms: 210000 },
                  { id: 'tt3', name: 'Sapphire', artists: [{ name: 'Ed Sheeran' }], album: { name: 'Album3', images: [{ url: 'https://placehold.co/300x300?text=Sapphire' }] }, duration_ms: 233000 },
                  { id: 'tt4', name: 'BIRDS OF A FEATHER', artists: [{ name: 'Billie Eilish' }], album: { name: 'Album4', images: [{ url: 'https://placehold.co/300x300?text=Birds' }] }, duration_ms: 270000 },
                  { id: 'tt5', name: 'Beautiful Things', artists: [{ name: 'Benson Boone' }], album: { name: 'Album5', images: [{ url: 'https://placehold.co/300x300?text=Beautiful+Things' }] }, duration_ms: 200000 },
                  { id: 'tt6', name: 'Abracadabra', artists: [{ name: 'Lady Gaga' }], album: { name: 'Album6', images: [{ url: 'https://placehold.co/300x300?text=Abracadabra' }] }, duration_ms: 220000 },
                  { id: 'tt7', name: 'Born Again', artists: [{ name: 'LISA, Doja Cat, RAYE' }], album: { name: 'Album7', images: [{ url: 'https://placehold.co/300x300?text=Born+Again' }] }, duration_ms: 190000 },
                  { id: 'tt8', name: 'ExtraL', artists: [{ name: 'JENNIE, Doechii' }], album: { name: 'Album8', images: [{ url: 'https://placehold.co/300x300?text=ExtraL' }] }, duration_ms: 240000 }
                ];
              }
            }
            const filteredItems = items
              .filter(item => item !== null)
              .map(item => ({
                ...item,
                images: item.images && item.images.length > 0 
                  ? item.images 
                  : [{ url: `https://placehold.co/300x300?text=${encodeURIComponent(item.name || 'Placeholder')}` }],
                album: item.album ? {
                  ...item.album,
                  images: item.album.images && item.album.images.length > 0 
                    ? item.album.images 
                    : [{ url: `https://placehold.co/300x300?text=${encodeURIComponent(item.album?.name || 'Album')}` }]
                } : item.album
              }));
            if (url.includes('/api/user-playlists')) console.log('User artist playlists fetched:', filteredItems.map(p => p.name));
            setter(filteredItems);
          } catch (err) {
            console.error(`Error fetching ${url}:`, err);
            let fallbackItems = [];
            if (url.includes('featured-playlists')) {
              fallbackItems = [
                { id: 'fp1', name: 'AUGUST 2025 TOP HITS', description: 'Always updated weekly', images: [{ url: 'https://placehold.co/300x300?text=Top+Hits' }] },
                { id: 'fp2', name: 'Top 50 Pop Hits of August 2025', description: 'Pop Songs Playlist', images: [{ url: 'https://placehold.co/300x300?text=Pop+Hits' }] },
                { id: 'fp3', name: 'AUGUST 2025 CHARTS', description: 'Top Hits 2025', images: [{ url: 'https://placehold.co/300x300?text=Charts' }] },
                { id: 'fp4', name: 'US Top 40 Chart Hits August 2025', description: 'Trending and viral songs', images: [{ url: 'https://placehold.co/300x300?text=US+Top+40' }] },
                { id: 'fp5', name: 'Top New Songs August 2025', description: 'New releases', images: [{ url: 'https://placehold.co/300x300?text=New+Songs' }] },
                { id: 'fp6', name: 'Summer Vibes 2025', description: 'Summer playlist', images: [{ url: 'https://placehold.co/300x300?text=Summer+Vibes' }] },
                { id: 'fp7', name: 'Chill Hits', description: 'Relaxing tunes', images: [{ url: 'https://placehold.co/300x300?text=Chill+Hits' }] },
                { id: 'fp8', name: 'Workout Motivation', description: 'Gym playlist', images: [{ url: 'https://placehold.co/300x300?text=Workout' }] }
              ];
            } else if (url.includes('top-tracks')) {
              fallbackItems = [
                { id: 'tt1', name: 'APT', artists: [{ name: 'ROSÉ, Bruno Mars' }], album: { name: 'Album1', images: [{ url: 'https://placehold.co/300x300?text=APT' }] }, duration_ms: 180000 },
                { id: 'tt2', name: 'Die With A Smile', artists: [{ name: 'Lady Gaga, Bruno Mars' }], album: { name: 'Album2', images: [{ url: 'https://placehold.co/300x300?text=Die+With+A+Smile' }] }, duration_ms: 210000 },
                { id: 'tt3', name: 'Sapphire', artists: [{ name: 'Ed Sheeran' }], album: { name: 'Album3', images: [{ url: 'https://placehold.co/300x300?text=Sapphire' }] }, duration_ms: 233000 },
                { id: 'tt4', name: 'BIRDS OF A FEATHER', artists: [{ name: 'Billie Eilish' }], album: { name: 'Album4', images: [{ url: 'https://placehold.co/300x300?text=Birds' }] }, duration_ms: 270000 },
                { id: 'tt5', name: 'Beautiful Things', artists: [{ name: 'Benson Boone' }], album: { name: 'Album5', images: [{ url: 'https://placehold.co/300x300?text=Beautiful+Things' }] }, duration_ms: 200000 },
                { id: 'tt6', name: 'Abracadabra', artists: [{ name: 'Lady Gaga' }], album: { name: 'Album6', images: [{ url: 'https://placehold.co/300x300?text=Abracadabra' }] }, duration_ms: 220000 },
                { id: 'tt7', name: 'Born Again', artists: [{ name: 'LISA, Doja Cat, RAYE' }], album: { name: 'Album7', images: [{ url: 'https://placehold.co/300x300?text=Born+Again' }] }, duration_ms: 190000 },
                { id: 'tt8', name: 'ExtraL', artists: [{ name: 'JENNIE, Doechii' }], album: { name: 'Album8', images: [{ url: 'https://placehold.co/300x300?text=ExtraL' }] }, duration_ms: 240000 }
              ];
            }
            setter(fallbackItems);
            if (!preserveSampleData) {
              setter([]);
            }
            if (url.includes('/api/user-playlists')) {
              console.log('Keeping sample user playlists data due to API failure');
            }
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

  const handlePlay = (item = null) => {
    if (item) {
      const playableTrack = {
        id: item.id,
        title: item.name,
        artist: item.artists?.map(a => a.name).join(', ') || item.description || 'Unknown Artist',
        image: item.images?.[0]?.url || item.album?.images?.[0]?.url || 'https://placehold.co/300x300?text=Track',
        duration: item.duration_ms ? Math.floor(item.duration_ms / 1000) : 180,
        album: item.album?.name || 'Unknown Album'
      };
      
      setCurrentTrack(playableTrack);
      localStorage.setItem('lastPlayedTrack', JSON.stringify(playableTrack));
      
      const newRecentlyPlayed = [
        {
          id: item.id,
          name: item.name,
          description: item.artists?.map(a => a.name).join(', ') || item.description || 'Recently played',
          images: item.images || item.album?.images || [{ url: `https://placehold.co/300x300?text=${encodeURIComponent(item.name || 'Recent')}` }]
        },
        ...recentlyPlayed.filter(rp => rp.id !== item.id).slice(0, 9)
      ];
      setRecentlyPlayed(newRecentlyPlayed);
      localStorage.setItem('recentlyPlayed', JSON.stringify(newRecentlyPlayed));
    }
    setIsPlaying(true);
  };

  const handleCloseSidebar = () => {
    setIsPlaying(false);
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#0e0e0e] dark group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, \"Noto Sans\", sans-serif' }}>
      <Navbar />
      <LeftSidebar />
      <div className={`layout-container flex h-full grow flex-col min-h-screen w-full transition-all duration-300 ease-in-out pt-[60px] pb-16 md:pb-20 md:pl-[16.5rem] lg:pl-[18rem] ${isPlaying ? 'md:pr-[20.5rem] lg:pr-[22.5rem]' : 'pr-0'}`}>
        <div className="m-1.5 md:mx-2 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.45)] bg-[#0e0e0e] p-2">
          <div className="rounded-2xl bg-[#181818] p-4 md:p-6">
            {isLoading && <p className="text-[#F5F5F5] text-center py-8 text-lg">Loading...</p>}
            {error && <p className="text-red-500 text-center py-8 text-lg">{error}</p>}
            <HeroBanner featured={heroFeatured} />
            
            <CarouselPlaylistRow 
              title="New Releases" 
              items={newReleases} 
              onPlaylistClick={handlePlay}
            />
            
            <CarouselPlaylistRow 
              title="Artist Playlists" 
              items={userPlaylists} 
              onPlaylistClick={handlePlay}
            />
            
            <CarouselPlaylistRow 
              title="Featured Playlists" 
              items={featuredPlaylists} 
              onPlaylistClick={handlePlay}
            />
            
            <CarouselTrackRow 
              title="Top Tracks" 
              items={topTracks} 
              onTrackClick={handlePlay}
            />
            
            <CarouselPlaylistRow 
              title="Recently Played" 
              items={recentlyPlayed} 
              onPlaylistClick={handlePlay}
            />
            
            <CarouselPlaylistRow 
              title="Popular Playlists" 
              items={popularPlaylists} 
              onPlaylistClick={handlePlay}
            />
            
            <CarouselPlaylistRow 
              title="Mood Booster" 
              items={moodBooster} 
              onPlaylistClick={handlePlay}
            />
            
            <TrackList 
              items={recommendedTracks} 
              onTrackClick={handlePlay}
            />
            
            <Genres items={genres} />
          </div>
        </div>
      </div>
      <MusicPlayer 
        onPlay={() => handlePlay()} 
        currentTrack={currentTrack}
      />
      <NowPlayingSidebar 
        currentTrack={currentTrack} 
        onClose={handleCloseSidebar} 
        isOpen={isPlaying} 
      />
      {!isPlaying && (
        <button
          onClick={() => setIsPlaying(true)}
          className="hidden md:flex fixed right-1.5 bottom-24 items-center gap-2 px-4 py-2 rounded-full bg-[#0e0e0e]/95 text-[#F5F5F5] shadow-[0_8px_20px_rgba(0,0,0,0.35)] z-40 hover:bg-[#151515]/95 transition-colors"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-[#CD7F32]"></span>
          Show Now Playing
        </button>
      )}
    </div>
  );
};

export default Home;