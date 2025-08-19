import React, { useState } from 'react';
import Navbar from './Navbar';
import HeroBanner from './HeroBanner';
import PlaylistRow from './PlaylistRow';
import Genres from './Genres';
import TrackList from './TrackList';
import MusicPlayer from './MusicPlayer';
import NowPlayingSidebar from './NowPlayingSidebar';

const Home = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const currentTrack = { // Static for now
    title: "Mitwa",
    artist: "Shankar-Ehsaan-Loy",
    image: "https://via.placeholder.com/300?text=Album+Cover",
  };

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
        <HeroBanner />
        <PlaylistRow title="Recently Played" />
        <PlaylistRow title="Made for You" />
        <PlaylistRow title="Popular Playlists" />
        <PlaylistRow title="New Releases" />
        <PlaylistRow title="Mood Booster" />
        <Genres />
        <TrackList />
        <MusicPlayer onPlay={handlePlay} />
      </div>
      <NowPlayingSidebar currentTrack={currentTrack} onClose={handleCloseSidebar} isOpen={isPlaying} />
    </div>
  );
};

export default Home;