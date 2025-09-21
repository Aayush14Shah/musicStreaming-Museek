import React, { useState } from "react";
import { Button, TextField } from "@mui/material";

const AddAdminPopup2 = ({ showPopup, setShowPopup }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (!formData.email || !formData.password) return;
    setStep(2);
  };

  const handleSubmit = () => {
    console.log("Admin Data:", formData);
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
        <div className="relative bg-[#282828]/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-[#CD7F32]/30">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-4 text-center">
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
            <div className="space-y-4">
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  style: { color: "#F5F5F5" },
                }}
                InputLabelProps={{ style: { color: "#aaa" } }}
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  style: { color: "#F5F5F5" },
                }}
                InputLabelProps={{ style: { color: "#aaa" } }}
              />
              <Button
                onClick={handleNext}
                fullWidth
                sx={{
                  mt: 2,
                  backgroundColor: "#CD7F32",
                  "&:hover": { backgroundColor: "#b46f2a" },
                  fontWeight: "bold",
                  borderRadius: "0.75rem",
                  padding: "0.75rem",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                }}
                variant="contained"
              >
                Next
              </Button>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <div className="space-y-4">
              <TextField
                label="Enter OTP"
                name="otp"
                type="text"
                value={formData.otp}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  style: { color: "#F5F5F5" },
                }}
                InputLabelProps={{ style: { color: "#aaa" } }}
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  fullWidth
                  sx={{
                    backgroundColor: "#444",
                    "&:hover": { backgroundColor: "#555" },
                    fontWeight: "bold",
                    color: "#F5F5F5",
                    borderRadius: "0.75rem",
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

export default AddAdminPopup2;
