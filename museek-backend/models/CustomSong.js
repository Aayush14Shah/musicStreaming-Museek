import mongoose from "mongoose";

const customSongSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  artist: {
    type: String,
    required: true,
    trim: true,
  },
  album: {
    type: String,
    trim: true,
  },
  genre: {
    type: String,
    required: true,
    trim: true,
  },
  releaseDate: {
    type: Date,
  },
  duration: {
    type: String, // Format: "mm:ss" e.g., "3:45"
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  audioFilePath: {
    type: String,
    required: true, // Path to the uploaded audio file
  },
  audioFileName: {
    type: String,
    required: true, // Original filename of the audio file
  },
  coverImagePath: {
    type: String, // Path to the uploaded cover image (optional)
  },
  coverImageName: {
    type: String, // Original filename of the cover image
  },
  fileSize: {
    type: Number, // File size in bytes
  },
  mimeType: {
    type: String, // MIME type of the audio file (e.g., "audio/mpeg")
  },
  apiStatus: {
    type: String,
    enum: ['Draft', 'Published', 'Error'],
    default: 'Draft',
  },
  is_active: {
    type: Number,
    default: 1, // 1 = active, 0 = deleted (soft delete)
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  playCount: {
    type: Number,
    default: 0,
  },
  lastPlayed: {
    type: Date,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for better query performance
customSongSchema.index({ title: 1, artist: 1 });
customSongSchema.index({ genre: 1 });
customSongSchema.index({ is_active: 1 });
customSongSchema.index({ apiStatus: 1 });

// Virtual for full audio URL (will be useful for serving files)
customSongSchema.virtual('audioUrl').get(function() {
  return this.audioFilePath ? `/uploads/audio/${this.audioFileName}` : null;
});

// Virtual for full cover image URL
customSongSchema.virtual('coverUrl').get(function() {
  return this.coverImagePath ? `/uploads/images/${this.coverImageName}` : null;
});

// Ensure virtual fields are serialized
customSongSchema.set('toJSON', { virtuals: true });

export default mongoose.model("CustomSong", customSongSchema, "custom_songs");
