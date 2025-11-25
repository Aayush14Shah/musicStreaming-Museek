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

const MusicPlayer = ({ currentTrack, isPlaying, onPlay, onPause, onPrev, onNext, onShuffle }) => {
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [value, setValue] = React.useState(30);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(!!isPlaying);
  const [volume, setVolume] = useState(30);

  useEffect(() => {
    // cleanup old audio and prepare new one when track changes
    if (!currentTrack) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setProgress(0);
      setPlaying(false);
      return;
    }

    setProgress(0); // reset progress for new track

    // Use the audio URL directly (backend now handles YouTube conversion)
    const audioUrl = currentTrack.audioUrl;
    console.log('🎵 Loading audio from:', audioUrl);

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play();
      } else {
        // mark as stopped locally; DO NOT toggle sidebar from here
        setPlaying(false);
        if (typeof onPause === 'function') onPause();
      }
    };
    const handlePlay = () => {
      setPlaying(true);
      if (typeof onPlay === 'function') onPlay();
    };
    const handlePause = () => {
      setPlaying(false);
      if (typeof onPause === 'function') onPause();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    if (playing) {
      audio.play().catch(() => {});
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      try { audio.pause(); } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  // Sync local playing state if parent controls playback via prop
  useEffect(() => {
    setPlaying(!!isPlaying);
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const handlePlayButtonClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation(); // prevent bubbling to parent (avoid accidental sidebar toggles)
    if (!currentTrack) {
      alert('Please select a track from the playlists above to start listening to previews!');
      return;
    }
    if (!audioRef.current) {
      alert('Preview not available for this track.');
      return;
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      if (typeof onPause === 'function') onPause();
    } else {
      audioRef.current.play().catch((err) => console.log('play blocked', err.message));
      setPlaying(true);
      if (typeof onPlay === 'function') onPlay();
    }
  };

  const handleSeek = (_, newValue) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = newValue;
    setProgress(newValue);
  };

  const handleVolumeChange = (_, newValue) => {
    setVolume(newValue);
    if (audioRef.current) audioRef.current.volume = newValue / 100;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] text-[var(--text-primary)] p-2 md:p-4 z-40 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-6">
      {/* Left */}
      <div className="flex items-center space-x-2 md:space-x-4 min-w-[200px] md:min-w-[300px]">
        {currentTrack ? (
          <>
            <img src={currentTrack.image} alt={currentTrack.title} className="w-10 h-10 md:w-12 md:h-12 rounded" />
            <div className="text-xs md:text-sm overflow-hidden">
              <div className="font-medium truncate max-w-[150px] md:max-w-[200px]">{currentTrack.title}</div>
              <div className="text-[var(--accent-primary)] truncate max-w-[150px] md:max-w-[200px]" title={currentTrack.artist}>
                {currentTrack.artist}
              </div>
              <div className="text-[var(--text-tertiary)] text-xs">Preview</div>
            </div>
            <Tooltip title="Add to Liked Songs" arrow>
              <button onClick={(e)=>{e.stopPropagation(); console.log("Added to liked songs")}} className="text-[var(--text-primary)] hover:text-[var(--accent-primary)] hidden sm:block">
                <AddIcon fontSize="small" />
              </button>
            </Tooltip>
          </>
        ) : (
          <>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded bg-[var(--bg-tertiary)] flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div className="text-xs md:text-sm overflow-hidden">
              <div className="font-medium text-[#888]">No track selected</div>
              <div className="text-[var(--accent-primary)]">Choose a track for preview</div>
            </div>
          </>
        )}
      </div>

      {/* Center */}
      <div className="flex flex-col items-center flex-1 max-w-[600px]">
        <div className="flex items-center space-x-2 md:space-x-4 mb-2 md:mb-3">
          <Tooltip title="Shuffle" arrow>
            <button onClick={(e)=>{e.stopPropagation(); setIsShuffling((s) => !s); onShuffle && onShuffle();}} className={`${currentTrack ? "text-[var(--text-primary)] hover:text-[var(--accent-primary)]" : "text-[var(--text-tertiary)]"}`}>
              <ShuffleIcon fontSize="small" />
            </button>
          </Tooltip>

          <Tooltip title="Previous" arrow>
            <button onClick={(e)=>{e.stopPropagation(); onPrev && onPrev();}} className={`${onPrev ? "text-[var(--text-primary)] hover:text-[var(--accent-primary)]" : "text-[var(--text-tertiary)] cursor-not-allowed"}`} disabled={!onPrev}>
              <SkipPreviousIcon fontSize="small" />
            </button>
          </Tooltip>

          <Tooltip title={currentTrack ? "Play/Pause Preview" : "Select a track"} arrow>
            <button
              onClick={(e)=>{e.stopPropagation(); handlePlayButtonClick(e);}}
              className={`rounded-full p-2 md:p-3 transition-all duration-200 hover:scale-105 ${currentTrack ? 'text-[var(--text-primary)] hover:text-[var(--accent-primary)] bg-[var(--bg-tertiary)]' : 'text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] cursor-not-allowed'}`}
              disabled={!currentTrack}
            >
              {playing ? <PauseIcon sx={{ fontSize: 24 }} /> : <PlayArrowIcon sx={{ fontSize: 24 }} />}
            </button>
          </Tooltip>

          <Tooltip title="Next" arrow>
            <button onClick={(e)=>{e.stopPropagation(); onNext && onNext();}} className={`${onNext ? 'text-[var(--text-primary)] hover:text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)] cursor-not-allowed'}`} disabled={!onNext}>
              <SkipNextIcon fontSize="small" />
            </button>
          </Tooltip>

          <Tooltip title="Restart / Toggle Repeat" arrow>
            <button onClick={(e)=>{e.stopPropagation(); if(audioRef.current){audioRef.current.currentTime=0; audioRef.current.play().catch(()=>{});} setIsRepeating((r)=>!r);}} className={`${isRepeating ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
              <RepeatIcon fontSize="small" />
            </button>
          </Tooltip>
        </div>

        <div className="flex items-center space-x-2 w-full">
          <span className="text-xs md:text-sm hidden sm:block">{formatTime(progress)}</span>

          <Slider
            aria-label="time-indicator"
            size="small"
            value={progress}
            min={0}
            step={1}
            max={audioRef.current?.duration || currentTrack?.duration || 30}
            onChange={handleSeek}
            sx={{
              color: "var(--accent-primary)",
              height: 4,
              '& .MuiSlider-thumb': { width: 8, height: 8 }
            }}
          />

          <span className="text-xs md:text-sm hidden sm:block">{formatTime(audioRef.current?.duration || currentTrack?.duration || 0)}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center space-x-1 md:space-x-3 justify-end min-w-[200px] md:min-w-[300px]">
        <div className="flex items-center space-x-1 md:space-x-2">
          <Tooltip title="Volume" arrow>
            <button onClick={(e)=>{e.stopPropagation();}} className={`${currentTrack ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}`}>
              <VolumeUpIcon fontSize="small" />
            </button>
          </Tooltip>
          <Box sx={{ width: { xs: 80, sm: 120, md: 150 } }}>
            <Stack spacing={1} direction="row" sx={{ alignItems: "center" }}>
              <VolumeDown sx={{ fontSize: 16 }} />
              <Slider size="small" aria-label="Volume" value={volume} onChange={handleVolumeChange} sx={{ color: "var(--accent-primary)" }} />
              <VolumeUp sx={{ fontSize: 16 }} />
            </Stack>
          </Box>
        </div>
        <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} arrow>
          <button onClick={(e)=>{e.stopPropagation(); toggleFullscreen();}} className={`${currentTrack ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}`}>
            <FullscreenIcon fontSize="small" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default MusicPlayer;