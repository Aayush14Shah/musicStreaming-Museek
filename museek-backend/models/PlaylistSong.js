import mongoose from "mongoose";

const PlaylistSongSchema = new mongoose.Schema(
  {
    playlistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Playlist',
      required: true,
    },
    songId: {
      type: String, // Can be Spotify track ID or custom song ID
      required: true,
    },
    songType: {
      type: String,
      enum: ['spotify', 'custom'],
      required: true,
    },
    // Store song details for quick access without joins
    songTitle: {
      type: String,
      required: true,
    },
    songArtist: {
      type: String,
      required: true,
    },
    songAlbum: {
      type: String,
      default: 'Unknown Album',
    },
    songImage: {
      type: String, // Album/cover image URL
    },
    songPreviewUrl: {
      type: String, // Preview audio URL
    },
    songDuration: {
      type: Number, // Duration in seconds
      default: 0
    },
    // Additional metadata
    spotifyUri: {
      type: String, // For Spotify songs
    },
    customSongPath: {
      type: String, // For custom songs - file path
    },
    // Playlist specific fields
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Register_user',
      required: true,
    },
    position: {
      type: Number,
      default: 0 // Order in playlist
    }
  },
  { 
    timestamps: true,
    indexes: [
      { playlistId: 1, position: 1 }, // For ordered playlist songs
      { playlistId: 1, songId: 1, songType: 1 }, // For checking duplicates
      { songId: 1, songType: 1 } // For finding playlists containing a song
    ]
  }
);

// Ensure a song can't be added twice to the same playlist
PlaylistSongSchema.index({ playlistId: 1, songId: 1, songType: 1 }, { unique: true });

export default mongoose.model("PlaylistSong", PlaylistSongSchema, "PlaylistSongs");
