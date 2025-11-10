import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
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
  role: {
    type: String,
    default: 'Admin',
    enum: ['Admin', 'Super Admin', 'Moderator']
  },
  is_active: {
    type: Number,
    default: 1, // 1 = active, 0 = inactive
  },
},
{ timestamps: true }
);

// const Admin = mongoose.model('Admin', adminSchema);
// module.exports = Admin;

export default mongoose.model("Admin", adminSchema, "Admins");
