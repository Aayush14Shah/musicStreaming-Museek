import { useState, useEffect } from 'react';

const useLikes = (userId) => {
  const [likedSongs, setLikedSongs] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Check if a song is liked
  const isLiked = (songId, songType) => {
    return likedSongs.has(`${songId}_${songType}`);
  };

  // Like a song
  const likeSong = async (songData) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...songData
        }),
      });

      if (response.ok) {
        setLikedSongs(prev => new Set([...prev, `${songData.songId}_${songData.songType}`]));
        console.log('❤️ Song liked successfully');
        return { success: true };
      } else if (response.status === 409) {
        // Already liked
        setLikedSongs(prev => new Set([...prev, `${songData.songId}_${songData.songType}`]));
        return { success: true, message: 'Already liked' };
      } else {
        throw new Error('Failed to like song');
      }
    } catch (error) {
      console.error('Error liking song:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Unlike a song
  const unlikeSong = async (songId, songType) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/likes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          songId,
          songType
        }),
      });

      if (response.ok) {
        setLikedSongs(prev => {
          const newSet = new Set(prev);
          newSet.delete(`${songId}_${songType}`);
          return newSet;
        });
        console.log('💔 Song unliked successfully');
        return { success: true };
      } else {
        throw new Error('Failed to unlike song');
      }
    } catch (error) {
      console.error('Error unliking song:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Toggle like status
  const toggleLike = async (songData) => {
    const { songId, songType } = songData;
    
    if (isLiked(songId, songType)) {
      return await unlikeSong(songId, songType);
    } else {
      return await likeSong(songData);
    }
  };

  // Load user's liked songs
  const loadLikedSongs = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/likes/${userId}?limit=1000`);
      
      if (response.ok) {
        const data = await response.json();
        const likedSet = new Set(
          data.likes.map(like => `${like.songId}_${like.songType}`)
        );
        setLikedSongs(likedSet);
      }
    } catch (error) {
      console.error('Error loading liked songs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load liked songs when userId changes
  useEffect(() => {
    loadLikedSongs();
  }, [userId]);

  return {
    isLiked,
    likeSong,
    unlikeSong,
    toggleLike,
    loading,
    likedSongs: likedSongs.size,
    refreshLikes: loadLikedSongs
  };
};

export default useLikes;
