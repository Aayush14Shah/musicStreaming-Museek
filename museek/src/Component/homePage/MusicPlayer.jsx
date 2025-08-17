// Updated MusicPlayer.jsx (improved responsiveness)
import React, { useState } from 'react';
import { Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RepeatIcon from '@mui/icons-material/Repeat';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import LyricsIcon from '@mui/icons-material/Lyrics';
import DevicesIcon from '@mui/icons-material/Devices';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

const MusicPlayer = ({ onPlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [progress, setProgress] = useState(18); // Example progress in seconds

  const currentTrack = {
    title: "Mitwa",
    artist: "Shankar-Ehsaan-Loy, Shankar Mahadevan, Caralisa Monteiro",
    image: "https://placehold.co/40?text=Cover",
    duration: 382, // 6:22 in seconds
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    onPlay();
  };

  const toggleShuffle = () => setIsShuffling(!isShuffling);
  const toggleRepeat = () => setIsRepeating(!isRepeating);
  const addToLiked = () => console.log("Added to liked songs");

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#121212] text-[#F5F5F5] p-2 md:p-4 z-40 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-6">
      {/* Left: Album Art, Song Info, Add Icon */}
      <div className="flex items-center space-x-2 md:space-x-4 min-w-[200px] md:min-w-[300px]">
        <img src={currentTrack.image} alt={currentTrack.title} className="w-10 h-10 md:w-12 md:h-12 rounded" />
        <div className="text-xs md:text-sm overflow-hidden">
          <div className="font-medium truncate">{currentTrack.title}</div>
          <div className="text-[#CD7F32] truncate">{currentTrack.artist}</div>
        </div>
        <Tooltip title="Add to Liked Songs" arrow>
          <button onClick={addToLiked} className="text-[#F5F5F5] hover:text-[#CD7F32] hidden sm:block">
            <AddIcon fontSize="small" />
          </button>
        </Tooltip>
      </div>

      {/* Center: Controls and Progress Bar */}
      <div className="flex flex-col items-center flex-1 max-w-[600px]">
        <div className="flex items-center space-x-2 md:space-x-4 mb-1 md:mb-2">
          <Tooltip title="Shuffle" arrow>
            <button onClick={toggleShuffle} className={`text-[#F5F5F5] hover:text-[#CD7F32] ${isShuffling ? 'text-[#CD7F32]' : ''}`}>
              <ShuffleIcon fontSize="small" />
            </button>
          </Tooltip>
          <Tooltip title="Previous" arrow>
            <button className="text-[#F5F5F5] hover:text-[#CD7F32]">
              <SkipPreviousIcon fontSize="small" />
            </button>
          </Tooltip>
          <Tooltip title="Play/Pause" arrow>
            <button onClick={togglePlay} className="text-[#F5F5F5] hover:text-[#CD7F32] bg-[#1C2B2D] rounded-full p-1 md:p-2">
              <PlayArrowIcon fontSize="medium" />
            </button>
          </Tooltip>
          <Tooltip title="Next" arrow>
            <button className="text-[#F5F5F5] hover:text-[#CD7F32]">
              <SkipNextIcon fontSize="small" />
            </button>
          </Tooltip>
          <Tooltip title="Repeat" arrow>
            <button onClick={toggleRepeat} className={`text-[#F5F5F5] hover:text-[#CD7F32] ${isRepeating ? 'text-[#CD7F32]' : ''}`}>
              <RepeatIcon fontSize="small" />
            </button>
          </Tooltip>
        </div>
        <div className="flex items-center space-x-2 w-full">
          <span className="text-xs md:text-sm hidden sm:block">{Math.floor(progress / 60)}:{(progress % 60).toString().padStart(2, '0')}</span>
          <div className="flex-1 h-1 md:h-2 bg-[#1C2B2D] rounded-full">
            <div className="h-full bg-[#F5F5F5] rounded-full" style={{ width: `${(progress / currentTrack.duration) * 100}%` }}></div>
          </div>
          <span className="text-xs md:text-sm hidden sm:block">6:22</span>
        </div>
      </div>

      {/* Right: Icons and Volume */}
      <div className="flex items-center space-x-2 md:space-x-4 justify-end min-w-[200px] md:min-w-[300px]">
        <Tooltip title="Queue" arrow>
          <button className="text-[#F5F5F5] hover:text-[#CD7F32] hidden sm:block">
            <QueueMusicIcon fontSize="small" />
          </button>
        </Tooltip>
        <Tooltip title="Lyrics" arrow>
          <button className="text-[#F5F5F5] hover:text-[#CD7F32] hidden sm:block">
            <LyricsIcon fontSize="small" />
          </button>
        </Tooltip>
        <Tooltip title="Devices" arrow>
          <button className="text-[#F5F5F5] hover:text-[#CD7F32] hidden md:block">
            <DevicesIcon fontSize="small" />
          </button>
        </Tooltip>
        <Tooltip title="Volume" arrow>
          <button className="text-[#F5F5F5] hover:text-[#CD7F32]">
            <VolumeUpIcon fontSize="small" />
          </button>
        </Tooltip>
        <input
          type="range"
          min="0"
          max="100"
          value="50"
          className="w-16 md:w-24 h-1 md:h-2 bg-[#1C2B2D] appearance-none rounded-full hidden sm:block"
        />
        <Tooltip title="Fullscreen" arrow>
          <button className="text-[#F5F5F5] hover:text-[#CD7F32] hidden md:block">
            <FullscreenIcon fontSize="small" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default MusicPlayer;