import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    is_active: { type: Number, default: 1 }, // 1 = active, 0 = inactive
  },
  { timestamps: true }
);

// const Admin = mongoose.model('Admin', adminSchema);
// module.exports = Admin;

export default mongoose.model("Admin", adminSchema, "Admins");
