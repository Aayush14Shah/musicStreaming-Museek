import mongoose from "mongoose";

const PlaylistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      maxlength: 500,
      default: ''
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Register_user',
      required: true,
    },
    coverImage: {
      type: String,
      default: null // URL to playlist cover image
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    songCount: {
      type: Number,
      default: 0
    },
    totalDuration: {
      type: Number, // in seconds
      default: 0
    },
    is_active: {
      type: Number,
      default: 1 // 1 = active, 0 = deleted
    }
  },
  { 
    timestamps: true,
    indexes: [
      { userId: 1, createdAt: -1 }, // For user's playlists
      { isPublic: 1, createdAt: -1 }, // For public playlists
      { userId: 1, name: 1 } // For playlist name uniqueness per user
    ]
  }
);

// Ensure playlist name is unique per user
PlaylistSchema.index({ userId: 1, name: 1 }, { unique: true });

// Virtual for playlist URL (if needed)
PlaylistSchema.virtual('playlistUrl').get(function() {
  return `/playlist/${this._id}`;
});

export default mongoose.model("Playlist", PlaylistSchema, "Playlists");
