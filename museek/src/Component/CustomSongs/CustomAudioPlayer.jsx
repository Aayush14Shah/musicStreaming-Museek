import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle,
  Music,
  Heart,
  MoreHorizontal
} from 'lucide-react';
import './CustomAudioPlayer.css';

const CustomAudioPlayer = ({ 
  currentSong, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious,
  playlist = []
}) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update audio source when song changes
  useEffect(() => {
    if (currentSong && audioRef.current) {
      setLoading(true);
      setCurrentTime(0);
      
      // Reset audio element
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      // Set new source
      audioRef.current.src = currentSong.audioUrl;
      audioRef.current.load();
      
      console.log('🎵 Loading custom song:', {
        title: currentSong.title,
        audioUrl: currentSong.audioUrl
      });
    }
  }, [currentSong]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current && currentSong) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('✅ Custom song playback started');
              setLoading(false);
            })
            .catch((error) => {
              console.error('❌ Custom song playback failed:', error);
              setLoading(false);
              
              // Handle different error types
              if (error.name === 'AbortError') {
                console.log('⚠️ Play request was interrupted by new load');
              } else if (error.name === 'NotSupportedError') {
                console.error('❌ Audio format not supported or file not found');
                alert('Unable to play this audio file. The format may not be supported or the file may be missing.');
                onPlayPause(null, false); // Stop playback
              } else if (error.name === 'NotAllowedError') {
                console.error('❌ Playback not allowed (user interaction required)');
                alert('Please click the play button to start playback.');
              } else {
                console.error('❌ Unknown playback error:', error);
                alert('Unable to play this audio file. Please try again.');
                onPlayPause(null, false); // Stop playback
              }
            });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong, onPlayPause]);

  // Audio event handlers
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    if (isRepeat) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    } else if (onNext) {
      onNext();
    } else {
      onPlayPause(null, false);
    }
  };

  const handleError = (e) => {
    console.error('❌ Audio element error:', e.target.error);
    setLoading(false);
    
    const error = e.target.error;
    let errorMessage = 'Unable to play this audio file.';
    
    switch (error.code) {
      case error.MEDIA_ERR_ABORTED:
        errorMessage = 'Audio playback was aborted.';
        break;
      case error.MEDIA_ERR_NETWORK:
        errorMessage = 'Network error occurred while loading audio.';
        break;
      case error.MEDIA_ERR_DECODE:
        errorMessage = 'Audio file is corrupted or in an unsupported format.';
        break;
      case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        errorMessage = 'Audio format not supported or file not found.';
        break;
      default:
        errorMessage = 'Unknown error occurred while loading audio.';
    }
    
    alert(errorMessage);
    onPlayPause(null, false);
  };

  const handleCanPlay = () => {
    console.log('✅ Custom song can play');
    setLoading(false);
  };

  const handleSeek = (e) => {
    const progressBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = progressBar.offsetWidth;
    const newTime = (clickX / width) * duration;
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  if (!currentSong) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-gray-800 p-4 z-50">
      <audio
        ref={audioRef}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadStart={() => setLoading(true)}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onAbort={() => console.log('⚠️ Audio loading aborted')}
        onStalled={() => console.log('⚠️ Audio loading stalled')}
        preload="metadata"
        crossOrigin="anonymous"
      />

      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        {/* Song Info */}
        <div className="flex items-center space-x-4 min-w-0 w-1/4">
          <div className="flex-shrink-0">
            {currentSong.coverUrl ? (
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-14 h-14 rounded-md object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center ${currentSong.coverUrl ? 'hidden' : 'flex'}`}
            >
              <Music className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-medium text-sm truncate">
              {currentSong.title}
            </h4>
            <p className="text-gray-400 text-xs truncate">
              {currentSong.artist}
            </p>
          </div>
          
          <button className="text-gray-400 hover:text-white p-1">
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center space-y-2 w-2/4 max-w-md">
          {/* Control Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-1 ${isShuffle ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            
            <button
              onClick={onPrevious}
              disabled={!onPrevious}
              className="text-gray-400 hover:text-white disabled:opacity-50 p-1"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => onPlayPause(currentSong, !isPlaying)}
              disabled={loading}
              className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            
            <button
              onClick={onNext}
              disabled={!onNext}
              className="text-gray-400 hover:text-white disabled:opacity-50 p-1"
            >
              <SkipForward className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setIsRepeat(!isRepeat)}
              className={`p-1 ${isRepeat ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2 w-full">
            <span className="text-xs text-gray-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            
            <div
              className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer group"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-white rounded-full relative group-hover:bg-green-500 transition-colors"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
            
            <span className="text-xs text-gray-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume and Additional Controls */}
        <div className="flex items-center space-x-4 w-1/4 justify-end">
          <button className="text-gray-400 hover:text-white p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-2">
            <button onClick={toggleMute} className="text-gray-400 hover:text-white p-1">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAudioPlayer;
