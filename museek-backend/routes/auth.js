import express from "express";
import User from "../models/Register_user.js";
import nodemailer from "nodemailer";
import Admin from "../models/admin.js";

const router = express.Router();
const otpStore = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

let transporter;
try {
  transporter = nodemailer.createTransport({
    service: "gmail", // or your SMTP provider
    auth: {
      user: "ankbizzcorp@gmail.com",
      pass: "cmvdejnxwyaermvp"
    }
  });
} catch (err) {
  console.error("[Museek ERROR] Failed to create nodemailer transporter:", err.message);
}

// Register
router.post("/register", async (req, res) => {
  try {
    // Check if registration is allowed by making internal API call
    try {
      const settingsResponse = await fetch('http://localhost:5000/api/registration-status');
      const settings = await settingsResponse.json();
      
      if (!settings.allowRegistration) {
        return res.status(403).json({ 
          error: "Registration is currently disabled by the administrator" 
        });
      }
    } catch (settingsError) {
      console.log('Settings check failed, allowing registration by default');
    }
    
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let account = await User.findOne({ email });
    let accountType = 'user';
    if (!account) {
      account = await Admin.findOne({ email });
      accountType = 'admin';
    }
    if (!account) return res.status(404).json({ message: "User not found" });
    if (account.password !== password)
      return res.status(401).json({ message: "Invalid password" });
    res.json({ message: "Login successful", user: account, role: accountType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Forgot Password - send OTP (real email logic)
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    // Generate OTP and expiry (5 min)
    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000;
    otpStore.set(email, { otp, otpExpiry });

    // Send OTP email
    await transporter.sendMail({
      from: "ankbizzcorp@gmail.com",
      to: email,
      subject: "Museek Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 5 minutes.`
    });

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify OTP (real logic)
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });
  const record = otpStore.get(email);
  if (!record) return res.status(400).json({ message: "No OTP requested" });
  if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
  if (Date.now() > record.otpExpiry) return res.status(400).json({ message: "OTP expired" });
  otpStore.delete(email);
  res.json({ message: "OTP verified" });
});

// Reset Password (only if OTP was verified)
router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and new password required" });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    // Optionally: check if OTP was verified recently (or use a flag)
    user.password = password;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }});

  // }
// });


router.post("/dashboard", async (req, res) => {
  try {
    const admin = new Admin(req.body);
    await admin.save();
    res.status(201).json({ message: "Admin registered" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update admin name by ID
router.patch("/:id", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json(updatedAdmin);
  } catch (err) {
    console.error("Error updating admin:", err);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;
