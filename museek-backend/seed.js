import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import User from "./models/Register_user.js";
import Admin from "./models/admin.js";
import Like from "./models/Like.js";
import Playlist from "./models/Playlist.js";
import PlaylistSong from "./models/PlaylistSong.js";

dotenv.config();

async function seedDatabase() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB for seeding.");

    // ── 1. Wipe all collections ────────────────────────────────
    await User.deleteMany({});
    await Admin.deleteMany({});
    await Like.deleteMany({});
    await Playlist.deleteMany({});
    await PlaylistSong.deleteMany({});
    console.log("🗑️  Cleared all existing data.");

    // ── 2. Hash passwords ──────────────────────────────────────
    const adminPass = await bcrypt.hash("ank@81545", 10);
    const aayushPass = await bcrypt.hash("aayush14", 10);
    const kirtanPass = await bcrypt.hash("kirtan15", 10);
    const nikhilPass = await bcrypt.hash("nick123", 10);

    // ── 3. Seed Admins ─────────────────────────────────────────
    const admins = await Admin.insertMany([
      {
        name: "Ank University",
        email: "ankuniversity20@gmail.com",
        password: adminPass,
        role: "Super Admin",
        is_active: 1,
      },
      {
        name: "Museek Admin",
        email: "admin2@museek.com",
        password: await bcrypt.hash("admin123", 10),
        role: "Admin",
        is_active: 1,
      },
    ]);
    console.log(`👮 Seeded ${admins.length} admins.`);

    // ── 4. Seed Users ──────────────────────────────────────────
    const users = await User.insertMany([
      {
        name: "Aayush Shah",
        email: "aayushshah140205@gmail.com",
        password: aayushPass,
        favoriteArtists: ["The Weeknd", "Drake"],
        languages: ["English", "Hindi"],
        is_active: 1,
        listeningHours: 45,
      },
      {
        name: "Kirtan",
        email: "kirtan0318@gmail.com",
        password: kirtanPass,
        favoriteArtists: ["A.R. Rahman", "Arijit Singh"],
        languages: ["Hindi", "Gujarati"],
        is_active: 1,
        listeningHours: 30,
      },
      {
        name: "Nikhil",
        email: "cnikhil2003@gmail.com",
        password: nikhilPass,
        favoriteArtists: ["Ed Sheeran", "Taylor Swift"],
        languages: ["English"],
        is_active: 1,
        listeningHours: 20,
      },
    ]);
    console.log(`👤 Seeded ${users.length} users.`);

    // ── 5. Seed Playlists linked to users via ObjectId ─────────
    const [aayush, kirtan] = users;

    const [playlist1, playlist2] = await Playlist.insertMany([
      {
        name: "Aayush's Favourites",
        userId: aayush._id,
        isPublic: true,
        description: "My top tracks of all time",
        is_active: 1,
      },
      {
        name: "Kirtan's Chill Mix",
        userId: kirtan._id,
        isPublic: false,
        description: "Late night vibes",
        is_active: 1,
      },
    ]);
    console.log("🎵 Seeded playlists.");

    // ── 6. Seed Likes and PlaylistSongs ───────────────────────
    const sampleSong = {
      songId: "4cOdK2wGLETKBW3PvgPWqT",
      songType: "spotify",
      songTitle: "Never Gonna Give You Up",
      songArtist: "Rick Astley",
      songAlbum: "Whenever You Need Somebody",
      songImage: "https://i.scdn.co/image/ab67616d0000b273b06cf72c3d526fc8e03e7e31",
    };

    await Like.create({ userId: aayush._id, ...sampleSong });
    await Like.create({ userId: kirtan._id, ...sampleSong });

    await PlaylistSong.create({
      playlistId: playlist1._id,
      addedBy: aayush._id,
      position: 1,
      ...sampleSong,
    });

    console.log("❤️  Seeded likes and playlist songs.");

    console.log("\n────────────────────────────────────");
    console.log("✅ Seeding complete!");
    console.log("────────────────────────────────────");
    console.log("Admin  → ankuniversity20@gmail.com  / ank@81545");
    console.log("User 1 → aayushshah140205@gmail.com / aayush14");
    console.log("User 2 → kirtan0318@gmail.com       / kirtan15");
    console.log("User 3 → cnikhil2003@gmail.com      / nick123");
    console.log("────────────────────────────────────\n");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
