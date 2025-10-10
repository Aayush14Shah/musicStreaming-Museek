import React, { useState, useEffect } from 'react';
import { Button, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { ArrowBack, PlayArrow, Pause, MoreVert, Edit, Delete, Share, Remove } from '@mui/icons-material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';

const PlaylistView = ({ playlist, onBack, onTrackClick, currentTrack, isPlaying }) => {
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [songToRemove, setSongToRemove] = useState(null);

  useEffect(() => {
    if (playlist?._id) {
      loadPlaylistSongs();
    }
  }, [playlist?._id]);

  const loadPlaylistSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/playlists/${playlist._id}`);
      
      if (response.ok) {
        const data = await response.json();
        setPlaylistSongs(data.songs);
      } else {
        throw new Error('Failed to load playlist songs');
      }
    } catch (error) {
      console.error('Error loading playlist songs:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackClick = (song) => {
    if (!song) {
      console.error('Song is undefined in handleTrackClick');
      return;
    }
    
    const track = {
      id: song.songId,
      title: song.songTitle,
      artist: song.songArtist || 'Unknown Artist',
      album: song.songAlbum || 'Unknown Album',
      image: song.songImage,
      uri: song.spotifyUri,
      audioUrl: song.songPreviewUrl
    };
    onTrackClick(track);
  };

  const isCurrentTrack = (songId) => {
    return currentTrack?.id === songId;
  };

  const handleRemoveSong = (song) => {
    setSongToRemove(song);
    setShowRemoveDialog(true);
  };

  const confirmRemoveSong = async () => {
    if (!songToRemove || !playlist?._id) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/playlists/${playlist._id}/songs/${songToRemove.songId}/${songToRemove.songType}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        // Remove song from local state
        setPlaylistSongs(prev => prev.filter(song => 
          !(song.songId === songToRemove.songId && song.songType === songToRemove.songType)
        ));
        console.log('✅ Song removed from playlist successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to remove song:', errorData.error);
      }
    } catch (error) {
      console.error('Error removing song from playlist:', error);
    } finally {
      setShowRemoveDialog(false);
      setSongToRemove(null);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalDuration = (totalSeconds) => {
    if (!totalSeconds) return '0 min';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Error loading playlist: {error}</p> 
        <Button onClick={loadPlaylistSongs} sx={{ color: 'var(--accent-primary)' }}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-6">
        <Button
          startIcon={<ArrowBack />}
          onClick={onBack}
          sx={{
            color: 'var(--text-primary)',
            '&:hover': { bgcolor: 'var(--accent-primary)/10' },
            textTransform: 'none',
            mb: 2
          }}
        >
          Back to Home
        </Button>
      </div>

      {/* Playlist Info */}
      <div className="flex items-end gap-6">
        <div className="w-48 h-48 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-lg flex items-center justify-center shadow-lg">
          <PlaylistAddIcon sx={{ fontSize: 80, color: 'white', opacity: 0.8 }} />
        </div>
        
        <div className="flex-1">
          <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wide mb-2">Playlist</p>
          <h1 className="text-4xl md:text-6xl font-bold text-[var(--text-primary)] mb-4">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-[var(--text-secondary)] mb-4">{playlist.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span>{playlist.songCount} songs</span>
            <span>•</span>
            <span>{formatTotalDuration(playlist.totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Button
          variant="contained"
          startIcon={playlistSongs && playlistSongs.length > 0 ? <PlayArrow /> : null}
          disabled={!playlistSongs || playlistSongs.length === 0}
          onClick={() => playlistSongs && playlistSongs.length > 0 && handleTrackClick(playlistSongs[0])}
          sx={{
            bgcolor: 'var(--accent-primary)',
            color: 'var(--bg-primary)',
            '&:hover': { bgcolor: 'var(--accent-secondary)' },
            '&:disabled': { bgcolor: 'var(--accent-primary)/30' },
            borderRadius: '50px',
            px: 4,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          {playlistSongs && playlistSongs.length > 0 ? 'Play' : 'No songs'}
        </Button>
        
        <Tooltip title="More options">
          <IconButton sx={{ color: 'var(--text-primary)' }}>
            <MoreVert />
          </IconButton>
        </Tooltip>
      </div>

        {/* Songs List */}
      <div className="space-y-2">
        {!playlistSongs || playlistSongs.length === 0 ? (
          <div className="text-center py-12">
            <PlaylistAddIcon sx={{ fontSize: 48, color: 'var(--accent-primary)', mb: 2 }} />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No songs in this playlist</h3>
            <p className="text-[var(--text-secondary)]">Add songs by clicking the + icon when playing music</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm text-[var(--text-secondary)] border-b border-[var(--border-primary)]">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Title</div>
              <div className="col-span-2 hidden md:block">Album</div>
              <div className="col-span-2 hidden lg:block">Date added</div>
              <div className="col-span-1 text-right">Duration</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Songs */}
            {playlistSongs && playlistSongs.map((song, index) => (
              <div
                key={`${song.songId}_${song.songType}`}
                className={`group grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors ${
                  isCurrentTrack(song.songId) ? 'bg-[var(--bg-tertiary)]' : ''
                }`}
              >
                <div className="col-span-1 flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                  {isCurrentTrack(song.songId) && isPlaying ? ( 
                    <Pause className="text-[var(--accent-primary)]" />
                  ) : (
                    <>
                      <span className="group-hover:hidden text-sm">{index + 1}</span>
                      <PlayArrow className="hidden group-hover:block" />
                    </>
                  )}
                </div>

                <div className="col-span-4 flex items-center gap-3" onClick={() => handleTrackClick(song)}>
                  <img
                    src={song.songImage || '/default-album.png'}
                    alt={song.songTitle}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className={`font-medium truncate ${
                      isCurrentTrack(song.songId) ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'
                    }`}>
                      {song.songTitle}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] truncate">{song.songArtist}</p>
                  </div>
                </div>

                <div className="col-span-2 hidden md:flex items-center" onClick={() => handleTrackClick(song)}>
                  <p className="text-sm text-[var(--text-secondary)] truncate">{song.songAlbum}</p>
                </div>

                <div className="col-span-2 hidden lg:flex items-center" onClick={() => handleTrackClick(song)}>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {new Date(song.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="col-span-1 flex items-center justify-end" onClick={() => handleTrackClick(song)}>
                  <p className="text-sm text-[var(--text-secondary)]">{formatDuration(song.songDuration)}</p>
                </div>

                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Tooltip title="Remove from playlist">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSong(song);
                      }}
                      sx={{
                        color: 'var(--text-tertiary)',
                        '&:hover': { color: '#ff4444' },
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        '.group:hover &': { opacity: 1 }
                      }}
                      size="small"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Remove Song Confirmation Dialog */}
      <Dialog
        open={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ color: 'var(--text-primary)' }}>
          Remove Song from Playlist
        </DialogTitle>
        <DialogContent>
          <p className="text-[var(--text-secondary)]">
            Are you sure you want to remove "{songToRemove?.songTitle}" by {songToRemove?.songArtist} from this playlist?
          </p>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setShowRemoveDialog(false)}
            sx={{ color: 'var(--text-primary)', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmRemoveSong}
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

export default PlaylistView;
