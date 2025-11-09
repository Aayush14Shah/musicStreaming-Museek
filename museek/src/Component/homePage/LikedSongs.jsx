import React, { useState, useEffect } from 'react';
import { Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteIcon from '@mui/icons-material/Delete';

const LikedSongs = ({ onBack, onTrackClick, currentTrack, isPlaying }) => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [songToRemove, setSongToRemove] = useState(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    loadLikedSongs();
  }, [userId]);

  const loadLikedSongs = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/likes/${userId}?limit=50`);
      
      if (response.ok) {
        const data = await response.json();
        setLikedSongs(data.likes);
      }
    } catch (error) {
      console.error('Error loading liked songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackClick = (like) => {
    const track = {
      id: like.songId,
      title: like.songTitle,
      artist: like.songArtist,
      album: like.songAlbum,
      image: like.songImage,
      uri: like.spotifyUri,
      audioUrl: like.songPreviewUrl
    };
    onTrackClick(track);
  };

  const isCurrentTrack = (songId) => {
    return currentTrack?.id === songId;
  };

  const handleRemoveLike = (like) => {
    setSongToRemove(like);
    setShowRemoveDialog(true);
  };

  const confirmRemoveLike = async () => {
    if (!songToRemove || !userId) return;

    try {
      const response = await fetch(`http://localhost:5000/api/likes`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          songId: songToRemove.songId,
          songType: songToRemove.songType
        }),
      });

      if (response.ok) {
        // Remove song from local state
        setLikedSongs(prev => prev.filter(like => 
          !(like.songId === songToRemove.songId && like.songType === songToRemove.songType)
        ));
        console.log('✅ Song removed from liked songs successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to remove liked song:', errorData.error);
      }
    } catch (error) {
      console.error('Error removing liked song:', error);
    } finally {
      setShowRemoveDialog(false);
      setSongToRemove(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CD7F32]"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="text-center py-12">
        <FavoriteIcon className="text-[#CD7F32] mb-4" style={{ fontSize: 48 }} />
        <h3 className="text-lg font-semibold mb-2">Please log in</h3>
        <p className="text-gray-400">Log in to see your liked songs</p>
      </div>
    );
  }

  if (likedSongs.length === 0) {
    return (
      <div className="text-center py-12">
        <FavoriteIcon className="text-[#CD7F32] mb-4" style={{ fontSize: 48 }} />
        <h3 className="text-lg font-semibold mb-2">No liked songs yet</h3>
        <p className="text-gray-400">Songs you like will appear here</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-[#F5F5F5] hover:text-[#CD7F32] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" className="w-4 h-4">
            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
          </svg>
          <span className="text-sm font-medium">Back to Home</span>
        </button>
      )}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Liked Songs</h1>
        <p className="text-gray-400">{likedSongs.length} songs</p>
      </div>

      <div className="space-y-2">
        {likedSongs.map((like, index) => (
          <div
            key={`${like.songId}_${like.songType}`}
            className={`group flex items-center gap-4 p-3 rounded-lg hover:bg-[#242424] transition-colors ${
              isCurrentTrack(like.songId) ? 'bg-[#242424]' : ''
            }`}
          >
            <div className="flex items-center justify-center w-10 h-10 text-gray-400 group-hover:text-white cursor-pointer" onClick={() => handleTrackClick(like)}>
              {isCurrentTrack(like.songId) && isPlaying ? (
                <PauseIcon />
              ) : (
                <div className="group-hover:hidden text-sm">{index + 1}</div>
              )}
              <PlayArrowIcon className="hidden group-hover:block" />
            </div>

            <div className="flex-shrink-0 cursor-pointer" onClick={() => handleTrackClick(like)}>
              <img
                src={like.songImage || '/default-album.png'}
                alt={like.songTitle}
                className="w-12 h-12 rounded object-cover"
              />
            </div>

            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleTrackClick(like)}>
              <h3 className={`font-medium truncate ${
                isCurrentTrack(like.songId) ? 'text-[#CD7F32]' : 'text-white'
              }`}>
                {like.songTitle}
              </h3>
              <p className="text-sm text-gray-400 truncate">{like.songArtist}</p>
            </div>

            <div className="flex-1 min-w-0 hidden md:block cursor-pointer" onClick={() => handleTrackClick(like)}>
              <p className="text-sm text-gray-400 truncate">{like.songAlbum}</p>
            </div>

            <div className="text-sm text-gray-400 cursor-pointer" onClick={() => handleTrackClick(like)}>
              {new Date(like.createdAt).toLocaleDateString()}
            </div>

            <div className="flex items-center gap-2">
              <Tooltip title="Remove from liked songs">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLike(like);
                  }}
                  sx={{
                    color: '#888',
                    '&:hover': { color: '#ff4444' },
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    '.group:hover &': { opacity: 1 }
                  }}
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <div className="w-8 flex justify-center">
                <FavoriteIcon className="text-[#CD7F32]" fontSize="small" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Remove Song Confirmation Dialog */}
      <Dialog
        open={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: '#181818',
            color: '#F5F5F5',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ color: '#F5F5F5' }}>
          Remove from Liked Songs
        </DialogTitle>
        <DialogContent>
          <p className="text-gray-300">
            Are you sure you want to remove "{songToRemove?.songTitle}" by {songToRemove?.songArtist} from your liked songs?
          </p>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setShowRemoveDialog(false)}
            sx={{ color: '#F5F5F5', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmRemoveLike}
            sx={{
              bgcolor: '#ff4444',
              color: 'white',
              '&:hover': { bgcolor: '#ff3333' },
              textTransform: 'none'
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LikedSongs;
