// backend/server.js
import express, { request } from "express";
import cors from "cors";
import dotenv from "dotenv";
const os = require('os')

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
