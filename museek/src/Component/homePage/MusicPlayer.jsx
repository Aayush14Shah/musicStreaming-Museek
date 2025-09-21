// Updated MusicPlayer.jsx (improved responsiveness)
import React, { useState, useEffect, useRef } from 'react';
import { Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RepeatIcon from '@mui/icons-material/Repeat';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import LyricsIcon from '@mui/icons-material/Lyrics';
import DevicesIcon from '@mui/icons-material/Devices';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';

// generic mm:ss formatter
const formatTime = (sec = 0) => `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, '0')}`;

const MusicPlayer = ({ currentTrack, isPlaying, onTogglePlay }) => {
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [value, setValue] = React.useState(30);
  const audioRef = useRef(null);
  const duration = audioRef.current?.duration || currentTrack?.duration || 0;

  const handlePlayButtonClick = () => {
    if (!currentTrack) {
      alert('Please select a track from the playlists above to start listening to 30-second previews!');
      return;
    }
    if (!currentTrack.audioUrl) {
      alert('30-second preview not available for this track. Please choose another track.');
      return;
    }
    onTogglePlay();
  };

  // Initialize / update audio element when track changes
  useEffect(() => {
    if (currentTrack && currentTrack.audioUrl) {
      // Pause and replace previous audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      setProgress(0); // reset progress for new track

      const audio = new Audio(currentTrack.audioUrl);
      audioRef.current = audio;

      const handleTimeUpdate = () => setProgress(audio.currentTime);
      const handleEnded = () => {
        if (isRepeating) {
          audio.currentTime = 0;
          audio.play();
        } else {
          if (isPlaying) onTogglePlay();
        }
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);

      if (isPlaying) {
        audio.play();
      }

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
      };
    }
  }, [currentTrack]);

  // Play / pause when isPlaying prop changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Update volume when slider changes
  const handleVolumeChange = (event, newValue) => {
    setValue(newValue);
    if (audioRef.current) {
      audioRef.current.volume = newValue / 100;
    }
  };

  // Seek when progress bar changes
  const handleSeek = (_, newValue) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newValue;
      setProgress(newValue);
    }
  };

  const toggleFullScreen = () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.error(`Error enabling full-screen: ${err.message} (${err.name})`);
                    });
                } else {
                    document.exitFullscreen().catch(err => {
                        console.error(`Error exiting full-screen: ${err.message} (${err.name})`);
                    });
                }
            };  

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
              <div className="text-[#888] text-xs">30s Preview</div>
            </div>
            <Tooltip title="Add to Liked Songs" arrow>
              <button 
                onClick={() => console.log("Added to liked songs")} 
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
              <div className="text-[#CD7F32]">Choose a track for 30s preview</div>
            </div>
          </>
        )}
      </div>

      {/* Center: Controls and Progress Bar */}
      <div className="flex flex-col items-center flex-1 max-w-[600px]">
        <div className="flex items-center space-x-2 md:space-x-4 mb-1 md:mb-2">
          <Tooltip title="Shuffle" arrow>
            <button 
              onClick={() => setIsShuffling(!isShuffling)} 
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
          <Tooltip title={currentTrack ? "Play/Pause 30s Preview" : "Select a track for 30s preview"} arrow>
            <button 
              onClick={handlePlayButtonClick} 
              className={`rounded-full p-1 md:p-2 transition-colors ${
                currentTrack
                  ? 'text-[#F5F5F5] hover:text-[#CD7F32] bg-[#1a1a1a]' 
                  : 'text-[#888] bg-[#1a1a1a] cursor-not-allowed'
              }`}
              disabled={!currentTrack}
            >
              {isPlaying ? <PauseIcon fontSize="medium" /> : <PlayArrowIcon fontSize="medium" />}
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
              onClick={() => setIsRepeating(!isRepeating)} 
              className={`${currentTrack ? 'text-[#F5F5F5] hover:text-[#CD7F32]' : 'text-[#888] cursor-not-allowed'} ${isRepeating ? 'text-[#CD7F32]' : ''}`}
              disabled={!currentTrack}
            >
              <RepeatIcon fontSize="small" />
            </button>
          </Tooltip>
        </div>
        <div className="flex items-center space-x-2 w-full">
          <span className="text-xs md:text-sm hidden sm:block">
            {currentTrack ? formatTime(progress) : '0:00'}
          </span>
          <Slider
          aria-label="time-indicator"
          size="small"
          value={progress}
          min={0}
          step={1}
          max={duration}
          onChange={handleSeek}
          sx={(t) => ({
            color: '#CD7F32',
            height: 4,
            '& .MuiSlider-thumb': {
              width: 8,
              height: 8,
              transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
              '&::before': {
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
              },
              '&:hover, &.Mui-focusVisible': {
                boxShadow: `0px 0px 0px 8px ${'rgb(0 0 0 / 16%)'}`,
                ...t.applyStyles('dark', {
                  boxShadow: `0px 0px 0px 8px ${'rgb(255 255 255 / 16%)'}`,
                }),
              },
              '&.Mui-active': {
                width: 20,
                height: 20,
              },
            },
            '& .MuiSlider-rail': {
              opacity: 0.28,
            },
            ...t.applyStyles('dark', {
              color: '#fff',
            }),
          })}
        />
          <span className="text-xs md:text-sm hidden sm:block">
            {duration ? formatTime(duration) : '0:00'}
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
        <Box sx={{ width: 200 }}>
        <Stack spacing={2} direction="row" sx={{ alignItems: 'center', mb: 1 }}>
          <VolumeDown />
          <Slider size="small" aria-label="Volume" value={value} onChange={handleVolumeChange} color="white"/>
          <VolumeUp />
        </Stack>
        </Box>
        <Tooltip title="Fullscreen" arrow>
          <button 
            onClick={toggleFullScreen}
            className={`${currentTrack ? 'text-[#F5F5F5] hover:text-[#CD7F32]' : 'text-[#888]'} hidden md:block`}
          >
            <FullscreenIcon fontSize="small" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default MusicPlayer;