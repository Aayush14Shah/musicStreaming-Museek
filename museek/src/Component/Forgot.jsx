import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../Images/LogoFinalDarkModeFrameResized.png';
import ForgotPageImage from '../Images/ForgotPageImage.jpg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';



const Forgot = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const otpRefs = useRef([]);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/auth/forgot-password', { email });
      setEmailSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    }
    setLoading(false);
  };

  const handleOtpChange = (e, idx) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    setError('');
    if (value && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
    if (!value && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      setLoading(false);
      return;
    }
    try {
      await axios.post('http://localhost:5000/auth/verify-otp', { email, otp: otpValue });
      setOtpVerified(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.');
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!resetPassword || !resetConfirm) {
      setError('Please fill in both password fields.');
      setLoading(false);
      return;
    }
    if (resetPassword !== resetConfirm) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      await axios.post('http://localhost:5000/auth/reset-password', { email, password: resetPassword });
      setShowPopup(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    }
    setLoading(false);
  };

  const handleRedirect = () => navigate('/Signup');

  return (
    <div className="w-screen h-screen bg-[#121212] flex items-center justify-center overflow-hidden relative">
      <div className="flex w-full h-full bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#0e0e0e] overflow-hidden">
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <img 
            src={ForgotPageImage} 
            alt="Music Background" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white px-16 text-center">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Forgot Password
            </h1>
            <p className="text-2xl text-gray-200 leading-relaxed font-light">
              Reset your password securely
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-[#181818] p-8 lg:p-16 flex flex-col justify-center relative">
          <div className="max-w-lg mx-auto w-full">
            <div className="flex justify-center mb-8">
              <img src={Logo} alt="Brand Logo" className="w-40" />
            </div>

            <h2 className="text-4xl font-bold text-center mb-10 text-[#F5F5F5]">Forgot Password</h2>

            {!emailSent && !otpVerified && (
              <form className="space-y-6" onSubmit={handleSendOtp}>
                <div className="relative group">
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className="w-full px-5 py-4 bg-[#0e0e0e] border-2 border-gray-600 rounded-xl text-[#F5F5F5] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#CD7F32]/20 focus:border-[#CD7F32] transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#CD7F32] to-[#b06f2d] text-white rounded-xl font-bold text-lg hover:from-[#b06f2d] hover:to-[#CD7F32] transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            )}

            {emailSent && !otpVerified && (
              <form className="space-y-6" onSubmit={handleOtpSubmit}>
                <div className="flex flex-col items-center gap-4">
                  <label className="text-lg text-[#F5F5F5]">Enter the 6-digit OTP sent to your email</label>
                  <div className="flex gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => otpRefs.current[idx] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(e, idx)}
                        className="w-12 h-14 text-2xl text-center bg-[#0e0e0e] border-2 border-gray-600 rounded-xl text-[#F5F5F5] focus:outline-none focus:ring-4 focus:ring-[#CD7F32]/20 focus:border-[#CD7F32] transition-all duration-300"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>
                </div>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#CD7F32] to-[#b06f2d] text-white rounded-xl font-bold text-lg hover:from-[#b06f2d] hover:to-[#CD7F32] transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            )}

            {otpVerified && (
              <form className="space-y-6" onSubmit={handlePasswordReset}>
                <div className="flex flex-col gap-4">
                  {/* Password Field with show/hide button */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="New Password"
                      className="w-full   px-5 py-4 bg-[#0e0e0e] border-2 border-gray-600 rounded-xl text-[#F5F5F5] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#CD7F32]/20 focus:border-[#CD7F32] transition-all duration-300 shadow-sm hover:shadow-md"
                      value={resetPassword}
                      onChange={e => setResetPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-[#CD7F32] transition-colors duration-200"
                      tabIndex={-1}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {/* Confirm Password Field with show/hide button */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm New Password"
                      className="w-full px-5 py-4 bg-[#0e0e0e] border-2 border-gray-600 rounded-xl text-[#F5F5F5] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#CD7F32]/20 focus:border-[#CD7F32] transition-all duration-300 shadow-sm hover:shadow-md"
                      value={resetConfirm}
                      onChange={e => setResetConfirm(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-[#CD7F32] transition-colors duration-200"
                      tabIndex={-1}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#CD7F32] to-[#b06f2d] text-white rounded-xl font-bold text-lg hover:from-[#b06f2d] hover:to-[#CD7F32] transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            <div className="mt-10 text-center">
              <p className="text-base text-gray-300">
                Don't have an account?{' '}
                <button 
                  onClick={handleRedirect} 
                  className="text-[#CD7F32] hover:text-[#b06f2d] font-semibold transition duration-200 hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Password Reset Success Popup */}
      {showPopup && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative bg-[#282828]/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-[#CD7F32]/30">
            <div className="flex justify-center mb-6">
              <div className="bg-green-500/20 rounded-full p-4">
                <CheckCircleIcon style={{ fontSize: "3rem" }} className="text-green-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[#F5F5F5] mb-2">Password Reset Successful!</h1>
            <p className="text-[#F5F5F5] mb-4">You can now log in with your new password.</p>
            <button 
              onClick={() => navigate('/Login')}
              className="w-full bg-gradient-to-r from-[#CD7F32] to-[#b06f2d] text-white font-bold py-3 px-6 rounded-lg hover:from-[#b06f2d] hover:to-[#CD7F32] transition-colors duration-300"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forgot;