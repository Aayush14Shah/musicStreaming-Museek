import { useState, useEffect } from 'react';

const usePlaylists = (userId) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user's playlists
  const loadPlaylists = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/playlists/user/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data.playlists);
      } else {
        throw new Error('Failed to load playlists');
      }
    } catch (error) {
      console.error('Error loading playlists:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new playlist
  const createPlaylist = async (playlistData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...playlistData,
          userId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPlaylists(prev => [data.playlist, ...prev]);
        console.log('✅ Playlist created successfully');
        return { success: true, playlist: data.playlist };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create playlist');
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update playlist
  const updatePlaylist = async (playlistId, updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/playlists/${playlistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setPlaylists(prev => 
          prev.map(p => p._id === playlistId ? data.playlist : p)
        );
        console.log('✅ Playlist updated successfully');
        return { success: true, playlist: data.playlist };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update playlist');
      }
    } catch (error) {
      console.error('Error updating playlist:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete playlist
  const deletePlaylist = async (playlistId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/playlists/${playlistId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPlaylists(prev => prev.filter(p => p._id !== playlistId));
        console.log('✅ Playlist deleted successfully');
        return { success: true };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete playlist');
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Add song to playlist
  const addSongToPlaylist = async (playlistId, songData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/playlists/${playlistId}/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...songData,
          addedBy: userId
        }),
      });

      if (response.ok) {
        // Update playlist song count locally
        setPlaylists(prev => 
          prev.map(p => 
            p._id === playlistId 
              ? { ...p, songCount: p.songCount + 1 }
              : p
          )
        );
        console.log('✅ Song added to playlist successfully');
        return { success: true };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add song to playlist');
      }
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Remove song from playlist
  const removeSongFromPlaylist = async (playlistId, songId, songType) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/playlists/${playlistId}/songs/${songId}/${songType}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update playlist song count locally
        setPlaylists(prev => 
          prev.map(p => 
            p._id === playlistId 
              ? { ...p, songCount: Math.max(0, p.songCount - 1) }
              : p
          )
        );
        console.log('✅ Song removed from playlist successfully');
        return { success: true };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove song from playlist');
      }
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Load playlists when userId changes
  useEffect(() => {
    loadPlaylists();
  }, [userId]);

  return {
    playlists,
    loading,
    error,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    refreshPlaylists: loadPlaylists
  };
};

export default usePlaylists;
