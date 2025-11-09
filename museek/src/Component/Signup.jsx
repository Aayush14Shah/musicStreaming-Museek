import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LogoDark from '../Images/LogoFinalDarkModeFrameResized.png';
import LogoLight from '../Images/LogoFinalLightModeFrameResized.png';
import loginSideImage from '../Images/login_side_image.jpg';

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '' 
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordWarnings, setPasswordWarnings] = useState([]);
  const [emailWarning, setEmailWarning] = useState("");
  const [showWarnings, setShowWarnings] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationDisabled, setRegistrationDisabled] = useState(false);
  const otpRefs = useRef([]);
  const [theme] = useState(localStorage.getItem('theme') || 'dark');

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

  // Email validation function
  const validateEmail = (email) => {
    // Simple regex for demonstration
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'password' && showWarnings) {
      setPasswordWarnings(validatePassword(e.target.value));
    }
    if (e.target.name === 'email' && showWarnings) {
      setEmailWarning(validateEmail(e.target.value) ? "" : "Enter a valid email address");
    }
  };
  

  // Send OTP to email (for signup)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowWarnings(true);
    setOtpError('');
    const pwWarnings = validatePassword(form.password);
    setPasswordWarnings(pwWarnings);
    const emailValid = validateEmail(form.email);
    setEmailWarning(emailValid ? "" : "Enter a valid email address");
    if (pwWarnings.length === 0 && emailValid) {
      setLoading(true);
      try {
        await axios.post('http://localhost:5000/auth/send-otp', { email: form.email, purpose: 'signup' });
        setOtpSent(true);
      } catch (err) {
        setOtpError(err.response?.data?.message || 'Failed to send OTP.');
      }
      setLoading(false);
    }
  };

  // OTP input change
  const handleOtpChange = (e, idx) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    setOtpError('');
    if (value && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
    if (!value && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  // OTP paste
  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // Verify OTP and register user
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOtpError('');
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setOtpError('Please enter the 6-digit OTP.');
      setLoading(false);
      return;
    }
    try {
      // 1. Verify OTP (unified endpoint)
      await axios.post('http://localhost:5000/auth/verify-otp', { email: form.email, otp: otpValue });
      setOtpVerified(true);
      // 2. Register user
      await axios.post('http://localhost:5000/auth/register', {
        name: form.firstName + ' ' + form.lastName,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password
      });
      // Proceed to preferences after short delay
      setTimeout(() => {
        navigate('/preferences', { state: form });
      }, 500);
    } catch (err) {
      // Show more specific error from backend (OTP or registration)
      const backendMsg = err.response?.data?.message || err.response?.data?.error;
      setOtpError(backendMsg || 'OTP verification or registration failed.');
    }
    setLoading(false);
  };
  
  const handleLogin = () => navigate('/Login');

  return (
    <div className="w-screen h-screen bg-[var(--bg-primary)] flex items-center justify-center overflow-hidden">
      <div className="flex w-full h-full bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-tertiary)] to-[var(--bg-secondary)] overflow-hidden">
        {/* Left Panel - Visual/Marketing */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          {/* Black shadow overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          
          <img 
            src={loginSideImage} 
            alt="Music Background" 
            className="w-full h-full object-cover object-center"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white px-16 text-center">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Create your Account
            </h1>
            <p className="text-2xl text-gray-200 leading-relaxed font-light">
              Discover, Create, and Share Your Musical Journey
            </p>
          </div>
        </div>

        {/* Right Panel - Sign Up Form */}
        <div className="w-full lg:w-1/2 bg-[var(--bg-primary)] p-8 lg:p-16 flex flex-col justify-center relative">
          <div className="max-w-lg mx-auto w-full">
            {/* Logo positioned above Sign Up text */}
            <div className="flex justify-center mb-8">
              <img src={theme === 'dark' ? LogoDark : LogoLight} alt="Brand Logo" className="w-40" />
            </div>
            
            <h2 className="text-4xl font-bold text-center mb-10 text-[var(--text-primary)]">Sign Up</h2>
            
            {/* Show OTP form if sent, else show signup form */}
            {!otpSent ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--input-border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/10 focus:border-[var(--input-border-focus)] transition-all duration-200 shadow-sm hover:shadow-[var(--shadow-card)]"
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--input-border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/10 focus:border-[var(--input-border-focus)] transition-all duration-200 shadow-sm hover:shadow-[var(--shadow-card)]"
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>
                <div className="relative group">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--input-border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/10 focus:border-[var(--input-border-focus)] transition-all duration-200 shadow-sm hover:shadow-[var(--shadow-card)]"
                    placeholder="Email address"
                    required
                  />
                  {showWarnings && emailWarning && (
                    <div className="text-yellow-500 text-sm mt-2 pl-1">{emailWarning}</div>
                  )}
                </div>
                <div className="relative group">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-5 py-4 pr-12 bg-[var(--bg-secondary)] border border-[var(--input-border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/10 focus:border-[var(--input-border-focus)] transition-all duration-200 shadow-sm hover:shadow-[var(--shadow-card)]"
                    placeholder="Password"
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
                  {/* Password requirements warnings */}
                  {showWarnings && passwordWarnings.length > 0 && (
                    <ul className="text-yellow-500 text-sm pl-4 list-disc mt-2">
                      {passwordWarnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 text-[var(--accent-primary)] border border-[var(--input-border)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:ring-offset-0 transition-all duration-200"
                  />
                  <label htmlFor="rememberMe" className="ml-3 text-base text-[var(--text-primary)] font-medium">
                    Remember me
                  </label>
                </div>
                {otpError && <div className="text-red-500 text-sm text-center">{otpError}</div>}
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-xl font-bold text-lg hover:from-[var(--accent-secondary)] hover:to-[var(--accent-primary)] transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Verify'}
                </button>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleOtpVerify}>
                <div className="flex flex-col items-center gap-4">
                  <label className="text-lg text-[var(--text-primary)]">Enter the 6-digit OTP sent to your email</label>
                  <div className="flex gap-2" onPaszzte={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => otpRefs.current[idx] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(e, idx)}
                        className="w-12 h-14 text-2xl text-center bg-[var(--bg-secondary)] border border-[var(--input-border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/10 focus:border-[var(--input-border-focus)] transition-all duration-200"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>
                </div>
                {otpError && <div className="text-red-500 text-sm text-center">{otpError}</div>}
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-xl font-bold text-lg hover:from-[var(--accent-secondary)] hover:to-[var(--accent-primary)] transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            )}
            
            <div className="mt-10 text-center">
              <p className="text-base text-[var(--text-secondary)]">
                Already have an account?{' '}
                <button 
                  onClick={handleLogin} 
                  className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] font-semibold transition duration-200 hover:underline"
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;