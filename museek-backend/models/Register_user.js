import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String },
    favoriteArtists: [{ type: String }],
    languages: [{ type: String }],
    is_active: { type: Number, default: 1 }, // 1 = active, 0 = inactive
    listeningHours: { type: Number, default: 0 }, // Total listening hours
  },
  { timestamps: true }
);

export default mongoose.model("Register_user", UserSchema, "Registered_Users");
