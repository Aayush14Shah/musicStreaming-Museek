import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, List, ListItem, ListItemText, ListItemIcon, Checkbox, Divider, CircularProgress } from '@mui/material';
import { Add as AddIcon, PlaylistPlay as PlaylistIcon } from '@mui/icons-material';
import usePlaylists from '../../hooks/usePlaylists';

const AddToPlaylistModal = ({ open, onClose, song, userId }) => {
  const { playlists, loading, createPlaylist, addSongToPlaylist } = usePlaylists(userId);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [selectedPlaylists, setSelectedPlaylists] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaylistToggle = (playlistId) => {
    setSelectedPlaylists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playlistId)) {
        newSet.delete(playlistId);
      } else {
        newSet.add(playlistId);
      }
      return newSet;
    });
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    const result = await createPlaylist({
      name: newPlaylistName.trim(),
      description: newPlaylistDescription.trim(),
      isPublic: false
    });

    if (result.success) {
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setShowCreateForm(false);
      // Auto-select the newly created playlist
      setSelectedPlaylists(prev => new Set([...prev, result.playlist._id]));
    }
  };

  const handleAddToPlaylists = async () => {
    if (selectedPlaylists.size === 0 || !song) return;

    setIsSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    const songData = {
      songId: song.id,
      songType: 'spotify', // Assuming Spotify for now, can be dynamic
      songTitle: song.title || song.name,
      songArtist: song.artist || (song.artists && song.artists[0]?.name),
      songAlbum: song.album || (song.album?.name),
      songImage: song.image || (song.album?.images && song.album.images[0]?.url),
      songPreviewUrl: song.audioUrl || song.preview_url,
      songDuration: song.duration_ms ? Math.floor(song.duration_ms / 1000) : 0,
      spotifyUri: song.uri
    };

    for (const playlistId of selectedPlaylists) {
      const result = await addSongToPlaylist(playlistId, songData);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    setIsSubmitting(false);
    
    // Show success message
    if (successCount > 0) {
      console.log(`✅ Added to ${successCount} playlist${successCount > 1 ? 's' : ''}`);
    }
    if (errorCount > 0) {
      console.log(`❌ Failed to add to ${errorCount} playlist${errorCount > 1 ? 's' : ''}`);
    }

    // Close modal and reset state
    setSelectedPlaylists(new Set());
    setShowCreateForm(false);
    onClose();
  };

  const handleClose = () => {
    setSelectedPlaylists(new Set());
    setShowCreateForm(false);
    setNewPlaylistName('');
    setNewPlaylistDescription('');
    onClose();
  };

  if (!song) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#181818',
          color: '#F5F5F5',
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ color: '#F5F5F5', borderBottom: '1px solid #CD7F32/20' }}>
        Add to Playlist
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {/* Song Info */}
        <div className="p-4 border-b border-[#CD7F32]/20">
          <div className="flex items-center gap-3">
            <img 
              src={song.image || song.album?.images?.[0]?.url || '/default-album.png'} 
              alt={song.title || song.name}
              className="w-12 h-12 rounded object-cover"
            />
            <div>
              <h3 className="font-medium text-white">{song.title || song.name}</h3>
              <p className="text-sm text-gray-400">{song.artist || song.artists?.[0]?.name}</p>
            </div>
          </div>
        </div>

        {/* Create New Playlist */}
        <div className="p-4 border-b border-[#CD7F32]/20">
          {!showCreateForm ? (
            <Button
              startIcon={<AddIcon />}
              onClick={() => setShowCreateForm(true)}
              sx={{
                color: '#CD7F32',
                '&:hover': { bgcolor: '#CD7F32/10' },
                textTransform: 'none',
                justifyContent: 'flex-start',
                width: '100%'
              }}
            >
              Create New Playlist
            </Button>
          ) : (
            <div className="space-y-3">
              <TextField
                fullWidth
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#242424',
                    color: '#F5F5F5',
                    '& fieldset': { borderColor: '#CD7F32/40' },
                    '&:hover fieldset': { borderColor: '#CD7F32/60' },
                    '&.Mui-focused fieldset': { borderColor: '#CD7F32' }
                  }
                }}
              />
              <TextField
                fullWidth
                placeholder="Description (optional)"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                variant="outlined"
                size="small"
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#242424',
                    color: '#F5F5F5',
                    '& fieldset': { borderColor: '#CD7F32/40' },
                    '&:hover fieldset': { borderColor: '#CD7F32/60' },
                    '&.Mui-focused fieldset': { borderColor: '#CD7F32' }
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim() || loading}
                  sx={{
                    bgcolor: '#CD7F32',
                    color: '#121212',
                    '&:hover': { bgcolor: '#CD7F32/90' },
                    textTransform: 'none'
                  }}
                >
                  Create
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewPlaylistName('');
                    setNewPlaylistDescription('');
                  }}
                  sx={{
                    color: '#F5F5F5',
                    border: '1px solid #CD7F32/40',
                    '&:hover': { bgcolor: '#CD7F32/10' },
                    textTransform: 'none'
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Existing Playlists */}
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-4">
              <CircularProgress size={24} sx={{ color: '#CD7F32' }} />
            </div>
          ) : playlists.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No playlists yet. Create your first playlist above!
            </div>
          ) : (
            <List sx={{ p: 0 }}>
              {playlists.map((playlist) => (
                <ListItem
                  key={playlist._id}
                  button
                  onClick={() => handlePlaylistToggle(playlist._id)}
                  sx={{
                    '&:hover': { bgcolor: '#242424' },
                    borderBottom: '1px solid #CD7F32/10'
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      checked={selectedPlaylists.has(playlist._id)}
                      sx={{
                        color: '#CD7F32/60',
                        '&.Mui-checked': { color: '#CD7F32' }
                      }}
                    />
                  </ListItemIcon>
                  <ListItemIcon>
                    <PlaylistIcon sx={{ color: '#CD7F32' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={playlist.name}
                    secondary={`${playlist.songCount} songs`}
                    primaryTypographyProps={{ color: '#F5F5F5' }}
                    secondaryTypographyProps={{ color: '#888' }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </div>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #CD7F32/20' }}>
        <Button 
          onClick={handleClose}
          sx={{ color: '#F5F5F5', textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAddToPlaylists}
          disabled={selectedPlaylists.size === 0 || isSubmitting}
          sx={{
            bgcolor: '#CD7F32',
            color: '#121212',
            '&:hover': { bgcolor: '#CD7F32/90' },
            '&:disabled': { bgcolor: '#CD7F32/30' },
            textTransform: 'none'
          }}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1, color: '#121212' }} />
              Adding...
            </>
          ) : (
            `Add to ${selectedPlaylists.size} playlist${selectedPlaylists.size !== 1 ? 's' : ''}`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToPlaylistModal;
