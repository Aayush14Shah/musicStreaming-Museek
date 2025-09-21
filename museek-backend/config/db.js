import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Atlas connected");
  } catch (err) {
    console.error("DB connection error:", err.message);
    process.exit(1);
  }
}
