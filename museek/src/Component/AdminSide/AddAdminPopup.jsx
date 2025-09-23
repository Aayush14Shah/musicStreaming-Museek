// src/components/AddAdminPopup.jsx
import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const AddAdminPopup = ({ showPopup, setShowPopup }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async () => {
    if (!formData.email) {
      setError("Email is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_BASE}/auth/forgot-password`, { email: formData.email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    }
    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!formData.otp) {
      setError("OTP is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_BASE}/auth/verify-otp`, { email: formData.email, otp: formData.otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed.");
    }
    setLoading(false);
  };

  // Step 3: Register admin
  const handleSubmit = async () => {
    if (!formData.password) {
      setError("Password is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_BASE}/auth/dashboard`, {
        email: formData.email,
        password: formData.password,
      });
      setShowPopup(false);
      setStep(1);
      setFormData({ email: "", password: "", otp: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create admin.");
    }
    setLoading(false);
  };

  const handleClose = () => {
    setShowPopup(false);
    setStep(1);
    setFormData({ email: "", password: "", otp: "" });
    setError("");
  };

  return (
    showPopup && (
      <div className="absolute inset-0 flex items-center justify-center z-50">
        {/* Blurred background overlay */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        ></div>

        {/* Popup box */}
        <div className="relative bg-[#282828]/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-[#CD7F32]/30">
          {/* Cross button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-[#CD7F32] transition-colors duration-200"
            aria-label="Close"
            type="button"
          >
            <CloseIcon style={{ fontSize: "2rem" }} />
          </button>
          {/* ...existing code... */}
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-6 text-center" style={{marginTop: "0.5rem"}}>
            {step === 1
              ? "Add Admin (Email)"
              : step === 2
              ? "Verify OTP"
              : "Set Password"}
          </h1>

          {/* Stepper Progress */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${
                  step === 1 ? "bg-[#CD7F32]" : "bg-[#CD7F32]/50"
                }`}
              ></div>
              <div
                className={`h-3 w-3 rounded-full ${
                  step === 2 ? "bg-[#CD7F32]" : "bg-[#CD7F32]/50"
                }`}
              ></div>
              <div
                className={`h-3 w-3 rounded-full ${
                  step === 3 ? "bg-[#CD7F32]" : "bg-[#CD7F32]/50"
                }`}
              ></div>
            </div>
          </div>

          {/* Step 1: Email */}
          {step === 1 && (
            <div className="space-y-6">
              <TextField
                label="Email"
                name="email"
                type="email"
                placeholder="Enter admin email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#F5F5F5',
                    '& fieldset': { borderColor: '#CD7F32/30' },
                    '&:hover fieldset': { borderColor: '#CD7F32' },
                    '&.Mui-focused fieldset': { borderColor: '#CD7F32' },
                    backgroundColor: '#2a2a2a',
                    '& input::placeholder': { color: '#F5F5F5/70', opacity: 1 },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#F5F5F5/70',
                    '&.Mui-focused': { color: '#CD7F32' },
                  },
                }}
              />
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <Button
                onClick={handleSendOtp}
                fullWidth
                disabled={loading}
                sx={{
                  backgroundColor: "#CD7F32",
                  "&:hover": { backgroundColor: "#b46f2a" },
                  fontWeight: "bold",
                  borderRadius: "0.75rem",
                  padding: "0.875rem",
                  textTransform: "none",
                  fontSize: "1rem",
                }}
                variant="contained"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <div className="space-y-6">
              <TextField
                label="Enter OTP"
                name="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChange={handleChange}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#F5F5F5',
                    '& fieldset': { borderColor: '#CD7F32/30' },
                    '&:hover fieldset': { borderColor: '#CD7F32' },
                    '&.Mui-focused fieldset': { borderColor: '#CD7F32' },
                    backgroundColor: '#2a2a2a',
                    '& input::placeholder': { color: '#F5F5F5/70', opacity: 1 },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#F5F5F5/70',
                    '&.Mui-focused': { color: '#CD7F32' },
                  },
                }}
              />
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  fullWidth
                  variant="outlined"
                  sx={{
                    borderColor: "#CD7F32/50",
                    color: "#F5F5F5/70",
                    "&:hover": {
                      borderColor: "#CD7F32",
                      backgroundColor: "#CD7F32/10"
                    },
                    fontWeight: "bold",
                    borderRadius: "0.75rem",
                    padding: "0.875rem",
                    textTransform: "none",
                    fontSize: "1rem",
                  }}
                >
                  Back
                </Button>
                <Button
                  onClick={handleVerifyOtp}
                  fullWidth
                  disabled={loading}
                  sx={{
                    backgroundColor: "#CD7F32",
                    "&:hover": { backgroundColor: "#b46f2a" },
                    fontWeight: "bold",
                    borderRadius: "0.75rem",
                    padding: "0.875rem",
                    textTransform: "none",
                    fontSize: "1rem",
                  }}
                  variant="contained"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Password */}
          {step === 3 && (
            <div className="space-y-6">
              <TextField
                label="Password"
                name="password"
                type="password"
                placeholder="Enter admin password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#F5F5F5',
                    '& fieldset': { borderColor: '#CD7F32/30' },
                    '&:hover fieldset': { borderColor: '#CD7F32' },
                    '&.Mui-focused fieldset': { borderColor: '#CD7F32' },
                    backgroundColor: '#2a2a2a',
                    '& input::placeholder': { color: '#F5F5F5/70', opacity: 1 },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#F5F5F5/70',
                    '&.Mui-focused': { color: '#CD7F32' },
                  },
                }}
              />
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(2)}
                  fullWidth
                  variant="outlined"
                  sx={{
                    borderColor: "#CD7F32/50",
                    color: "#F5F5F5/70",
                    "&:hover": {
                      borderColor: "#CD7F32",
                      backgroundColor: "#CD7F32/10"
                    },
                    fontWeight: "bold",
                    borderRadius: "0.75rem",
                    padding: "0.875rem",
                    textTransform: "none",
                    fontSize: "1rem",
                  }}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  fullWidth
                  disabled={loading}
                  sx={{
                    backgroundColor: "#CD7F32",
                    "&:hover": { backgroundColor: "#b46f2a" },
                    fontWeight: "bold",
                    borderRadius: "0.75rem",
                    padding: "0.875rem",
                    textTransform: "none",
                    fontSize: "1rem",
                  }}
                  variant="contained"
                >
                  {loading ? "Creating..." : "Submit"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  );
};

export default AddAdminPopup;
