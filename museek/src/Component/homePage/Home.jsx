import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import HeroBanner from './HeroBanner';
import PlaylistRow from './PlaylistRow';
import Genres from './Genres';
import TrackList from './TrackList';
import MusicPlayer from './MusicPlayer';
import NowPlayingSidebar from './NowPlayingSidebar';
import axios from 'axios';

const Home = () => {
  const [isPlaying, setIsPlaying] = useState(false);
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
  const currentTrack = { // Static for now
    title: "Mitwa",
    artist: "Shankar-Ehsaan-Loy",
    image: "https://via.placeholder.com/300?text=Album+Cover",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newRel, featPlay, topTr, mood, popPlay, gen, recTr, recPlay, userPl] = await Promise.all([
          axios.get('http://localhost:5000/api/new-releases?country=IN&limit=12'),
          axios.get('http://localhost:5000/api/featured-playlists?country=IN&limit=12'),
          axios.get('http://localhost:5000/api/top-tracks?limit=12'),
          axios.get('http://localhost:5000/api/mood-booster?limit=12'),
          axios.get('http://localhost:5000/api/popular-playlists?limit=12'),
          axios.get('http://localhost:5000/api/genres?country=IN&limit=12'),
          axios.get('http://localhost:5000/api/recommended-tracks?seed_genres=pop,rock&limit=12'),
          axios.get('http://localhost:5000/api/recently-played?limit=12'),
          axios.get('http://localhost:5000/api/user-playlists?limit=12'),
        ]);
        setNewReleases(newRel.data.albums?.items || []);
        setFeaturedPlaylists(featPlay.data.playlists?.items || []);
        setTopTracks(topTr.data.items || []);
        setMoodBooster(mood.data.playlists?.items || []);
        setPopularPlaylists(popPlay.data.playlists?.items || []);
        setGenres(gen.data.categories?.items || []);
        setRecommendedTracks(recTr.data.tracks || []);
        setRecentlyPlayed(recPlay.data.items || []);
        setUserPlaylists(userPl.data.items || []);
        setHeroFeatured(featPlay.data.playlists?.items[0] || null); // Use first featured playlist for hero
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  console.log(newReleases);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleCloseSidebar = () => {
    setIsPlaying(false);
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#121212] dark group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <Navbar />
      <div className={`layout-container flex h-full grow flex-col min-h-screen w-full ${isPlaying ? 'md:w-3/4' : 'w-full'} transition-all duration-300 ease-in-out pt-[60px]`}>
        <HeroBanner featured={heroFeatured} />
        <PlaylistRow title="New Releases" items={newReleases} />
        <PlaylistRow title="Featured Playlists" items={featuredPlaylists} />
        <PlaylistRow title="Top Tracks" items={topTracks} />
        <PlaylistRow title="Recently Played" items={recentlyPlayed} />
        <PlaylistRow title="Made for You" items={userPlaylists} />
        <PlaylistRow title="Popular Playlists" items={popularPlaylists} />
        <PlaylistRow title="Mood Booster" items={moodBooster} />
        <Genres items={genres} />
        <TrackList items={recommendedTracks} />
        <MusicPlayer onPlay={handlePlay} />
      </div>
      <NowPlayingSidebar currentTrack={currentTrack} onClose={handleCloseSidebar} isOpen={isPlaying} />
    </div>
  );
};

export default Home;