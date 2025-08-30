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
import { PlaylistView } from '../PlaylistView';

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
  // Add new states
  const [throwbackPlaylists, setThrowbackPlaylists] = useState([]);
  const [editorsPicks, setEditorsPicks] = useState([]);
  const [chillPlaylists, setChillPlaylists] = useState([]);
  const [partyPlaylists, setPartyPlaylists] = useState([]);
  const [topMixes, setTopMixes] = useState([]);
  const [popularRadio, setPopularRadio] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);

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
              } else if (url.includes('mood-booster')) {
                items = [
                  { id: 'mb1', name: 'Mood Booster', description: 'Happy vibes', images: [{ url: 'https://placehold.co/300x300?text=Mood+Booster' }] },
                  { id: 'mb2', name: 'Positive Energy', description: 'Uplifting tracks', images: [{ url: 'https://placehold.co/300x300?text=Positive+Energy' }] },
                  { id: 'mb3', name: 'Feel Good', description: 'Good mood playlist', images: [{ url: 'https://placehold.co/300x300?text=Feel+Good' }] },
                  { id: 'mb4', name: 'Happy Hits', description: 'Happy songs', images: [{ url: 'https://placehold.co/300x300?text=Happy+Hits' }] },
                  { id: 'mb5', name: 'Uplift', description: 'Motivational music', images: [{ url: 'https://placehold.co/300x300?text=Uplift' }] },
                  { id: 'mb6', name: 'Joyful Tunes', description: 'Joyful playlist', images: [{ url: 'https://placehold.co/300x300?text=Joyful+Tunes' }] },
                  { id: 'mb7', name: 'Smile Songs', description: 'Songs to make you smile', images: [{ url: 'https://placehold.co/300x300?text=Smile+Songs' }] },
                  { id: 'mb8', name: 'Good Vibes', description: 'Positive vibes only', images: [{ url: 'https://placehold.co/300x300?text=Good+Vibes' }] }
                ];
              } else if (url.includes('popular-playlists')) {
                items = [
                  { id: 'pp1', name: 'Popular Hits', description: 'Trending now', images: [{ url: 'https://placehold.co/300x300?text=Popular+Hits' }] },
                  { id: 'pp2', name: 'Viral 50', description: 'Viral tracks', images: [{ url: 'https://placehold.co/300x300?text=Viral+50' }] },
                  { id: 'pp3', name: 'Top Global', description: 'Global top songs', images: [{ url: 'https://placehold.co/300x300?text=Top+Global' }] },
                  { id: 'pp4', name: 'Hot Hits USA', description: 'US hits', images: [{ url: 'https://placehold.co/300x300?text=Hot+Hits+USA' }] },
                  { id: 'pp5', name: 'Today\'s Top Hits', description: 'Current top', images: [{ url: 'https://placehold.co/300x300?text=Today\'s+Top+Hits' }] },
                  { id: 'pp6', name: 'RapCaviar', description: 'Rap playlist', images: [{ url: 'https://placehold.co/300x300?text=RapCaviar' }] },
                  { id: 'pp7', name: 'Rock This', description: 'Rock hits', images: [{ url: 'https://placehold.co/300x300?text=Rock+This' }] },
                  { id: 'pp8', name: 'Viva Latino', description: 'Latin hits', images: [{ url: 'https://placehold.co/300x300?text=Viva+Latino' }] }
                ];
              } else if (url.includes('new-releases')) {
                items = [
                  { id: 'nr1', name: 'New Album 1', description: 'Fresh release', images: [{ url: 'https://placehold.co/300x300?text=New+Album+1' }] },
                  { id: 'nr2', name: 'New Album 2', description: 'Latest drop', images: [{ url: 'https://placehold.co/300x300?text=New+Album+2' }] },
                  { id: 'nr3', name: 'New Album 3', description: 'Brand new', images: [{ url: 'https://placehold.co/300x300?text=New+Album+3' }] },
                  { id: 'nr4', name: 'New Album 4', description: 'Recent release', images: [{ url: 'https://placehold.co/300x300?text=New+Album+4' }] },
                  { id: 'nr5', name: 'New Album 5', description: 'New music', images: [{ url: 'https://placehold.co/300x300?text=New+Album+5' }] },
                  { id: 'nr6', name: 'New Album 6', description: 'Fresh tracks', images: [{ url: 'https://placehold.co/300x300?text=New+Album+6' }] },
                  { id: 'nr7', name: 'New Album 7', description: 'Latest album', images: [{ url: 'https://placehold.co/300x300?text=New+Album+7' }] },
                  { id: 'nr8', name: 'New Album 8', description: 'New release', images: [{ url: 'https://placehold.co/300x300?text=New+Album+8' }] }
                ];
              }
            }

            // Ensure images fallback
            items = items
              .filter(item => item !== null)
              .map(item => ({
                ...item,
                images: item.images && item.images.length > 0 
                  ? item.images 
                  : [{ url: `https://placehold.co/300x300?text=${encodeURIComponent(item.name || 'Placeholder')}` }],
                album: item.album ? { ...item.album, images: item.album.images || [{ url: `https://placehold.co/300x300?text=${encodeURIComponent(item.album?.name || 'Album')}` }] } : item.album
              }));

            setter(items);
          } catch (err) {
            console.error(`Error fetching ${url}:`, err);
            setter([]);
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

  const handleTrackClick = (item = null) => {
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

  const handlePlaylistClick = async (playlist) => {
    setSelectedPlaylist(playlist);
    try {
      const res = await fetch(`http://localhost:5000/api/playlist-tracks?playlistId=${playlist.id}&market=IN`);
      if (res.ok) {
        const data = await res.json();
        setPlaylistTracks(data.items?.map(item => item.track) || []);
      }
    } catch (err) {
      console.error('Failed to fetch playlist tracks:', err);
      setPlaylistTracks([]);
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#0e0e0e] dark group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <Navbar />
      <LeftSidebar />
      <div className={`layout-container flex h-full grow flex-col min-h-screen w-full transition-all duration-300 ease-in-out pt-[60px] pb-16 md:pb-20 md:pl-[16.5rem] lg:pl-[18rem] ${isPlaying ? 'md:pr-[20.5rem] lg:pr-[22.5rem]' : 'pr-0'}`}>
        <div className="m-1.5 md:mx-2 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.45)] bg-[#0e0e0e] p-2">
          <div className="rounded-2xl bg-[#181818] p-4 md:p-6">
            
            {/* 👇 CONDITIONAL RENDER */}
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
                {isLoading && <p className="text-[#F5F5F5] text-center py-8 text-lg">Loading...</p>}
                {error && <p className="text-red-500 text-center py-8 text-lg">{error}</p>}

                <HeroBanner featured={heroFeatured} />

                <CarouselPlaylistRow title="New Releases" items={newReleases} onPlaylistClick={handlePlaylistClick} />
                <CarouselPlaylistRow title="Artist Playlists" items={userPlaylists} onPlaylistClick={handlePlaylistClick} />
                <CarouselPlaylistRow title="Featured Playlists" items={featuredPlaylists} onPlaylistClick={handlePlaylistClick} />
                <CarouselTrackRow title="Top Tracks" items={topTracks} onTrackClick={handleTrackClick} />
                <CarouselPlaylistRow title="Recently Played" items={recentlyPlayed} onPlaylistClick={handlePlaylistClick} />
                <CarouselPlaylistRow title="Popular Playlists" items={popularPlaylists} onPlaylistClick={handlePlaylistClick} />
                <CarouselPlaylistRow title="Mood Booster" items={moodBooster} onPlaylistClick={handlePlaylistClick} />
                <TrackList items={recommendedTracks} onTrackClick={handleTrackClick} />
                <Genres items={genres} />
              </>
            )}
          </div>
        </div>
      </div>
      <MusicPlayer onPlay={() => handleTrackClick()} currentTrack={currentTrack} />
      <NowPlayingSidebar currentTrack={currentTrack} onClose={handleCloseSidebar} isOpen={isPlaying} />

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