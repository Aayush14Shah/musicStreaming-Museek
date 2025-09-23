import React, { useState, useEffect } from 'react';
import { Play, Pause, Music, Heart, MoreHorizontal } from 'lucide-react';

const CustomSongsSection = ({ onSongPlay, currentPlayingSong, isPlaying }) => {
  const [customSongs, setCustomSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch custom songs from API
  useEffect(() => {
    const fetchCustomSongs = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/songs/custom?limit=12');
        
        if (!response.ok) {
          throw new Error('Failed to fetch custom songs');
        }
        
        const data = await response.json();
        console.log('🎵 Custom songs loaded:', data.songs?.length || 0);
        if (data.songs?.length > 0) {
          console.log('🎵 First song example:', {
            title: data.songs[0].title,
            audioUrl: data.songs[0].audioUrl,
            coverUrl: data.songs[0].coverUrl
          });
        }
        setCustomSongs(data.songs || []);
      } catch (err) {
        console.error('Error fetching custom songs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomSongs();
  }, []);

  // Handle play/pause button click
  const handlePlayPause = (song) => {
    console.log('🎵 Play button clicked for song:', {
      title: song.title,
      audioUrl: song.audioUrl,
      hasAudioUrl: !!song.audioUrl
    });

    if (!song.audioUrl) {
      alert('Audio file not available for this song.');
      return;
    }

    if (currentPlayingSong?._id === song._id && isPlaying) {
      // Pause current song
      onSongPlay(null, false);
    } else {
      // Play new song
      onSongPlay(song, true);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Your Custom Library</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-[#181818] p-4 rounded-lg animate-pulse">
              <div className="aspect-square bg-gray-700 rounded-md mb-3"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Your Custom Library</h2>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <Music className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 mb-2">Failed to load custom songs</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (customSongs.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Your Custom Library</h2>
        <div className="bg-[#181818] rounded-lg p-8 text-center">
          <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No custom songs yet</h3>
          <p className="text-gray-400">Custom songs uploaded by admins will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Your Custom Library</h2>
        <button className="text-gray-400 hover:text-white text-sm font-medium">
          Show all
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {customSongs.map((song) => (
          <div
            key={song._id}
            className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all duration-300 group cursor-pointer"
          >
            {/* Cover Image */}
            <div className="relative aspect-square mb-3">
              {song.coverUrl ? (
                <img
                  src={song.coverUrl}
                  alt={song.title}
                  className="w-full h-full object-cover rounded-md"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              
              {/* Fallback for missing cover */}
              <div 
                className={`w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center ${song.coverUrl ? 'hidden' : 'flex'}`}
              >
                <Music className="w-8 h-8 text-white" />
              </div>

              {/* Play/Pause Button Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md flex items-center justify-center">
                <button
                  onClick={() => handlePlayPause(song)}
                  className="bg-green-500 hover:bg-green-400 text-white rounded-full p-3 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  {currentPlayingSong?._id === song._id && isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </button>
              </div>

              {/* Currently Playing Indicator */}
              {currentPlayingSong?._id === song._id && (
                <div className="absolute top-2 right-2">
                  <div className="bg-green-500 rounded-full p-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Song Info */}
            <div className="space-y-1">
              <h3 className="font-semibold text-white text-sm truncate group-hover:text-green-400 transition-colors">
                {song.title}
              </h3>
              <p className="text-gray-400 text-xs truncate">
                {song.artist}
              </p>
              {song.playCount > 0 && (
                <p className="text-gray-500 text-xs">
                  {song.playCount} plays
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="text-gray-400 hover:text-white p-1">
                <Heart className="w-4 h-4" />
              </button>
              <button className="text-gray-400 hover:text-white p-1">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {customSongs.length >= 12 && (
        <div className="text-center mt-6">
          <button className="bg-transparent border border-gray-600 text-white px-6 py-2 rounded-full hover:border-white transition-colors">
            Load More Songs
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomSongsSection;
