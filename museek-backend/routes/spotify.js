import express from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Get access token using client credentials flow
const getAccessToken = async () => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    return data.body['access_token'];
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

// Get popular artists with images
router.get('/popular-artists', async (req, res) => {
  try {
    await getAccessToken();
    
    // Search for popular artists across different genres
    const genres = ['pop', 'rock', 'hip-hop', 'electronic', 'indie', 'jazz', 'classical', 'country'];
    const artistsWithImages = [];
    
    for (const genre of genres) {
      try {
        const searchResults = await spotifyApi.searchArtists(`genre:${genre}`, { limit: 10 });
        const artists = searchResults.body.artists.items;
        
        artists.forEach(artist => {
          if (artist.images && artist.images.length > 0 && artist.popularity > 50) {
            artistsWithImages.push({
              id: artist.id,
              name: artist.name,
              image: artist.images[0]?.url || null,
              genres: artist.genres,
              popularity: artist.popularity,
              followers: artist.followers.total
            });
          }
        });
      } catch (genreError) {
        console.error(`Error searching for ${genre} artists:`, genreError);
      }
    }
    
    // Remove duplicates and sort by popularity
    const uniqueArtists = artistsWithImages
      .filter((artist, index, self) => 
        index === self.findIndex(a => a.id === artist.id)
      )
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 50); // Limit to top 50 artists
    
    res.json(uniqueArtists);
  } catch (error) {
    console.error('Error fetching popular artists:', error);
    res.status(500).json({ error: 'Failed to fetch artists from Spotify' });
  }
});

// Search artists by name
router.get('/search-artists/:query', async (req, res) => {
  try {
    await getAccessToken();
    const { query } = req.params;
    
    const searchResults = await spotifyApi.searchArtists(query, { limit: 20 });
    const artists = searchResults.body.artists.items.map(artist => ({
      id: artist.id,
      name: artist.name,
      image: artist.images[0]?.url || null,
      genres: artist.genres,
      popularity: artist.popularity,
      followers: artist.followers.total
    }));
    
    res.json(artists);
  } catch (error) {
    console.error('Error searching artists:', error);
    res.status(500).json({ error: 'Failed to search artists' });
  }
});

export default router;
