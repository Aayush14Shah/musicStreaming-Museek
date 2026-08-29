import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directories if they don't exist
const uploadsDir = path.join(process.cwd(), "uploads");
const audioDir = path.join(uploadsDir, "audio");
const imagesDir = path.join(uploadsDir, "images");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir);
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "audioFile") {
      cb(null, audioDir);
    } else if (file.fieldname === "coverImage") {
      cb(null, imagesDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "audioFile") {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed for audioFile"), false);
    }
  } else if (file.fieldname === "coverImage") {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for coverImage"), false);
    }
  } else {
    cb(new Error("Unexpected field"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

export default upload;
