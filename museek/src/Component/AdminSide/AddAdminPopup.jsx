// src/components/AddAdminPopup.jsx
import React, { useState } from "react";
import { TextField, Button } from "@mui/material";

const AddAdminPopup = ({ showPopup, setShowPopup }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    if (step === 1 && formData.email && formData.password) {
      setStep(2);
    }
  };

  const handleSubmit = () => {
    console.log("Admin Created:", formData);
    setShowPopup(false);
    setStep(1);
    setFormData({ email: "", password: "", otp: "" });
  };

  return (
    showPopup && (
      <div className="absolute inset-0 flex items-center justify-center z-50">
        {/* Blurred background overlay */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowPopup(false)}
        ></div>

        {/* Popup box */}
        <div className="relative bg-[#282828]/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-[#CD7F32]/30">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-6 text-center">
            {step === 1 ? "Add Admin" : "Verify OTP"}
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
            </div>
          </div>

          {/* Step 1: Email + Password */}
          {step === 1 && (
            <div className="space-y-6">
              <TextField
                label="Email"
                name="email"
                type="email"
                placeholder="Enter admin email"
                style={{color: '#F5F5F5'}}
                value={formData.email}
                onChange={handleChange}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#F5F5F5',
                    '& fieldset': {
                      borderColor: '#CD7F32/30',
                    },
                    '&:hover fieldset': {
                      borderColor: '#CD7F32',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#CD7F32',
                    },
                    backgroundColor: '#2a2a2a',
                    '& input::placeholder': {
                      color: '#F5F5F5/70',
                      opacity: 1,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#F5F5F5/70',
                    '&.Mui-focused': {
                      color: '#CD7F32',
                    },
                  },
                }}
              />
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
                    '& fieldset': {
                      borderColor: '#CD7F32/30',
                    },
                    '&:hover fieldset': {
                      borderColor: '#CD7F32',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#CD7F32',
                    },
                    backgroundColor: '#2a2a2a',
                    '& input::placeholder': {
                      color: '#F5F5F5/70',
                      opacity: 1,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#F5F5F5/70',
                    '&.Mui-focused': {
                      color: '#CD7F32',
                    },
                  },
                }}
              />
              <Button
                onClick={handleNext}
                fullWidth
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
                Next
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
                    '& fieldset': {
                      borderColor: '#CD7F32/30',
                    },
                    '&:hover fieldset': {
                      borderColor: '#CD7F32',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#CD7F32',
                    },
                    backgroundColor: '#2a2a2a',
                    '& input::placeholder': {
                      color: '#F5F5F5/70',
                      opacity: 1,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#F5F5F5/70',
                    '&.Mui-focused': {
                      color: '#CD7F32',
                    },
                  },
                }}
              />
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
                  onClick={handleSubmit}
                  fullWidth
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
                  Submit
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
