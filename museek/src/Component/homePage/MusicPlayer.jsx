// Updated MusicPlayer.jsx (improved responsiveness)
import React, { useState, useEffect } from 'react';
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

const MusicPlayer = ({ onPlay, currentTrack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (!currentTrack) {
      console.log('No track loaded. Please select a track to play.');
      return;
    }
    setIsPlaying(!isPlaying);
    onPlay();
  };

  const handlePlayButtonClick = () => {
    if (!currentTrack) {
      alert('Please select a track from the playlists above to start listening!');
      return;
    }
    togglePlay();
  };

  const toggleShuffle = () => setIsShuffling(!isShuffling);
  const toggleRepeat = () => setIsRepeating(!isRepeating);
  const addToLiked = () => console.log("Added to liked songs");

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#121212]/95 backdrop-blur-sm text-[#F5F5F5] p-2 md:p-4 z-40 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-6">
      {/* Left: Album Art, Song Info, Add Icon */}
      <div className="flex items-center space-x-2 md:space-x-4 min-w-[200px] md:min-w-[300px]">
        {currentTrack ? (
          <>
            <img src={currentTrack.image} alt={currentTrack.title} className="w-10 h-10 md:w-12 md:h-12 rounded" />
            <div className="text-xs md:text-sm overflow-hidden">
              <div className="font-medium truncate max-w-[150px] md:max-w-[200px]">{currentTrack.title}</div>
              <div className="text-[#CD7F32] truncate max-w-[150px] md:max-w-[200px]" title={currentTrack.artist}>
                {currentTrack.artist}
              </div>
            </div>
            <Tooltip title="Add to Liked Songs" arrow>
              <button 
                onClick={addToLiked} 
                className="text-[#F5F5F5] hover:text-[#CD7F32] hidden sm:block"
              >
                <AddIcon fontSize="small" />
              </button>
            </Tooltip>
          </>
        ) : (
          <>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded bg-[#1a1a1a] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#CD7F32]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="text-xs md:text-sm overflow-hidden">
              <div className="font-medium text-[#888]">No track selected</div>
              <div className="text-[#CD7F32]">Choose a track to start listening</div>
            </div>
          </>
        )}
      </div>

      {/* Center: Controls and Progress Bar */}
      <div className="flex flex-col items-center flex-1 max-w-[600px]">
        <div className="flex items-center space-x-2 md:space-x-4 mb-1 md:mb-2">
          <Tooltip title="Shuffle" arrow>
            <button 
              onClick={toggleShuffle} 
              className={`${currentTrack ? 'text-[#F5F5F5] hover:text-[#CD7F32]' : 'text-[#888] cursor-not-allowed'} ${isShuffling ? 'text-[#CD7F32]' : ''}`}
              disabled={!currentTrack}
            >
              <ShuffleIcon fontSize="small" />
            </button>
          </Tooltip>
          <Tooltip title="Previous" arrow>
            <button 
              className={`${currentTrack ? 'text-[#F5F5F5] hover:text-[#CD7F32]' : 'text-[#888] cursor-not-allowed'}`}
              disabled={!currentTrack}
            >
              <SkipPreviousIcon fontSize="small" />
            </button>
          </Tooltip>
          <Tooltip title={currentTrack ? "Play/Pause" : "Select a track first"} arrow>
            <button 
              onClick={handlePlayButtonClick} 
              className={`rounded-full p-1 md:p-2 transition-colors ${
                currentTrack 
                  ? 'text-[#F5F5F5] hover:text-[#CD7F32] bg-[#1a1a1a]' 
                  : 'text-[#888] bg-[#1a1a1a] cursor-not-allowed'
              }`}
              disabled={!currentTrack}
            >
              <PlayArrowIcon fontSize="medium" />
            </button>
          </Tooltip>
          <Tooltip title="Next" arrow>
            <button 
              className={`${currentTrack ? 'text-[#F5F5F5] hover:text-[#CD7F32]' : 'text-[#888] cursor-not-allowed'}`}
              disabled={!currentTrack}
            >
              <SkipNextIcon fontSize="small" />
            </button>
          </Tooltip>
          <Tooltip title="Repeat" arrow>
            <button 
              onClick={toggleRepeat} 
              className={`${currentTrack ? 'text-[#F5F5F5] hover:text-[#CD7F32]' : 'text-[#888] cursor-not-allowed'} ${isRepeating ? 'text-[#CD7F32]' : ''}`}
              disabled={!currentTrack}
            >
              <RepeatIcon fontSize="small" />
            </button>
          </Tooltip>
        </div>
        <div className="flex items-center space-x-2 w-full">
          <span className="text-xs md:text-sm hidden sm:block">
            {currentTrack ? `${Math.floor(progress / 60)}:${(progress % 60).toString().padStart(2, '0')}` : '0:00'}
          </span>
          <div className="flex-1 h-1 md:h-2 bg-[#1a1a1a] rounded-full">
            <div 
              className="h-full bg-[#CD7F32] rounded-full transition-all duration-300" 
              style={{ 
                width: currentTrack ? `${(progress / currentTrack.duration) * 100}%` : '0%' 
              }}
            ></div>
          </div>
          <span className="text-xs md:text-sm hidden sm:block">
            {currentTrack ? `${Math.floor(currentTrack.duration / 60)}:${(currentTrack.duration % 60).toString().padStart(2, '0')}` : '0:00'}
          </span>
        </div>
      </div>

      {/* Right: Icons and Volume */}
      <div className="flex items-center space-x-2 md:space-x-4 justify-end min-w-[200px] md:min-w-[300px]">
        <Tooltip title="Queue" arrow>
          <button 
            className={`${currentTrack ? 'text-[#F5F5F5] hover:text-[#CD7F32]' : 'text-[#888] cursor-not-allowed'} hidden sm:block`}
            disabled={!currentTrack}
          >
            <QueueMusicIcon fontSize="small" />
          </button>
        </Tooltip>
        <Tooltip title="Lyrics" arrow>
          <button 
            className={`${currentTrack ? 'text-[#F5F5F5] hover:text-[#CD7F32]' : 'text-[#888] cursor-not-allowed'} hidden sm:block`}
            disabled={!currentTrack}
          >
            <LyricsIcon fontSize="small" />
          </button>
        </Tooltip>
        <Tooltip title="Devices" arrow>
          <button 
            className={`${currentTrack ? 'text-[#F5F5F5] hover:text-[#CD7F32]' : 'text-[#888] cursor-not-allowed'} hidden md:block`}
            disabled={!currentTrack}
          >
            <DevicesIcon fontSize="small" />
          </button>
        </Tooltip>
        <Tooltip title="Volume" arrow>
          <button 
            className={`${currentTrack ? 'text-[#F5F5F5] hover:text-[#CD7F32]' : 'text-[#888] cursor-not-allowed'}`}
            disabled={!currentTrack}
          >
            <VolumeUpIcon fontSize="small" />
          </button>
        </Tooltip>
        <input
          type="range"
          min="0"
          max="100"
          value="50"
          className={`w-16 md:w-24 h-1 md:h-2 appearance-none rounded-full hidden sm:block ${
            currentTrack ? 'bg-[#1a1a1a]' : 'bg-[#1a1a1a] opacity-50 cursor-not-allowed'
          }`}
          disabled={!currentTrack}
        />
        <Tooltip title="Fullscreen" arrow>
          <button 
            className={`${currentTrack ? 'text-[#F5F5F5] hover:text-[#CD7F32]' : 'text-[#888] cursor-not-allowed'} hidden md:block`}
            disabled={!currentTrack}
          >
            <FullscreenIcon fontSize="small" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default MusicPlayer;