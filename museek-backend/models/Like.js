import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Register_user',
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
    // Additional metadata
    spotifyUri: {
      type: String, // For Spotify songs
    },
    customSongPath: {
      type: String, // For custom songs - file path
    },
  },
  { 
    timestamps: true,
    // Ensure a user can't like the same song twice
    indexes: [
      { userId: 1, songId: 1, songType: 1 }, // Compound index for queries
      { unique: true, fields: ['userId', 'songId', 'songType'] } // Unique constraint
    ]
  }
);

// Create compound unique index
LikeSchema.index({ userId: 1, songId: 1, songType: 1 }, { unique: true });

export default mongoose.model("Like", LikeSchema, "Likes");
