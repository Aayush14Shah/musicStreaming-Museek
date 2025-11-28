import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LogoDark from '../Images/LogoFinalDarkModeFrameResized.png';
import LogoLight from '../Images/LogoFinalLightModeFrameResized.png';
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
  const [passwordWarnings, setPasswordWarnings] = useState([]);
  const otpRefs = useRef([]);
  const [showPassword, setShowPassword] = useState(false);
  const [theme] = useState(localStorage.getItem('theme') || 'dark');

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

  // Password validation function
  const validatePassword = (password) => {
    const warnings = [];
    if (password.length < 8) warnings.push('At least 8 characters');
    if (!/[a-z]/.test(password)) warnings.push('At least one lowercase letter');
    if (!/[A-Z]/.test(password)) warnings.push('At least one uppercase letter');
    if (!/[0-9]/.test(password)) warnings.push('At least one digit');
    if (!/[^A-Za-z0-9]/.test(password)) warnings.push('At least one special character');
    return warnings;
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const warnings = validatePassword(resetPassword);
    setPasswordWarnings(warnings);
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
    if (warnings.length > 0) {
      setError('Password does not meet requirements.');
      setLoading(false);
      return;
    }
    try {
      const otpValue = otp.join('');
      await axios.post('http://localhost:5000/auth/reset-password', { email, password: resetPassword, otp: otpValue });
      setShowPopup(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    }
    setLoading(false);
  };

  const handleRedirect = () => navigate('/Signup');

  return (
    <div className="w-screen h-screen bg-[var(--bg-primary)] flex items-center justify-center overflow-hidden relative">
      <div className="flex w-full h-full bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-tertiary)] to-[var(--bg-secondary)] overflow-hidden">
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

        <div className="w-full lg:w-1/2 bg-[var(--bg-primary)] p-8 lg:p-16 flex flex-col justify-center relative">
          <div className="max-w-lg mx-auto w-full">
            <div className="flex justify-center mb-8"> 
              <img src={theme === 'dark' ? LogoDark : LogoLight} alt="Brand Logo" className="w-40" />
            </div>

            <h2 className="text-4xl font-bold text-center mb-10 text-[var(--text-primary)]">Forgot Password</h2>

            {!emailSent && !otpVerified && (
              <form className="space-y-6" onSubmit={handleSendOtp}>
                <div className="relative group">
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className="w-full px-5 py-4 bg-[var(--bg-secondary)] border-2 border-[var(--border-secondary)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-xl font-bold text-lg hover:from-[var(--accent-secondary)] hover:to-[var(--accent-primary)] transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            )}

            {emailSent && !otpVerified && (
              <form className="space-y-6" onSubmit={handleOtpSubmit}>
                <div className="flex flex-col items-center gap-4"> 
                  <label className="text-lg text-[var(--text-primary)]">Enter the 6-digit OTP sent to your email</label>
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
                        className="w-12 h-14 text-2xl text-center bg-[var(--bg-secondary)] border-2 border-[var(--border-secondary)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-all duration-300"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>
                </div>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-xl font-bold text-lg hover:from-[var(--accent-secondary)] hover:to-[var(--accent-primary)] transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
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
                      className="w-full px-5 py-4 bg-[var(--bg-secondary)] border-2 border-[var(--border-secondary)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-all duration-300 shadow-sm hover:shadow-md"
                      value={resetPassword}
                      onChange={e => {
                        setResetPassword(e.target.value);
                        setPasswordWarnings(validatePassword(e.target.value));
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors duration-200"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {/* Password requirements warnings */}
                  {passwordWarnings.length > 0 && (
                    <ul className="text-yellow-400 text-sm pl-4 list-disc">
                      {passwordWarnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}
                  {/* Confirm Password Field with show/hide button */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm New Password"
                      className="w-full px-5 py-4 bg-[var(--bg-secondary)] border-2 border-[var(--border-secondary)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-all duration-300 shadow-sm hover:shadow-md"
                      value={resetConfirm}
                      onChange={e => setResetConfirm(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors duration-200"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-xl font-bold text-lg hover:from-[var(--accent-secondary)] hover:to-[var(--accent-primary)] transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            <div className="mt-10 text-center">
              <p className="text-base text-[var(--text-secondary)]">
                Don't have an account?{' '}
                <button 
                  onClick={handleRedirect} 
                  className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] font-semibold transition duration-200 hover:underline"
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
          <div className="relative bg-[var(--popup-bg)] backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-[var(--popup-border)]">
            <div className="flex justify-center mb-6">
              <div className="bg-green-500/20 rounded-full p-4">
                <CheckCircleIcon style={{ fontSize: "3rem" }} className="text-green-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Password Reset Successful!</h1>
            <p className="text-[var(--text-primary)] mb-4">You can now log in with your new password.</p>
            <button 
              onClick={() => navigate('/Login')}
              className="w-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white font-bold py-3 px-6 rounded-lg hover:from-[var(--accent-secondary)] hover:to-[var(--accent-primary)] transition-colors duration-300"
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