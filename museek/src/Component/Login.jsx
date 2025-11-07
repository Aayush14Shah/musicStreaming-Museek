import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LogoDark from '../Images/LogoFinalDarkModeFrameResized.png';
import LogoLight from '../Images/LogoFinalLightModeFrameResized.png';
import loginPageImage from '../Images/loginPageImage.jpg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [theme] = useState(localStorage.getItem('theme') || 'dark');

  // Some catchy music-themed lines
  const catchyLines = [
    "🎶 Music is waiting for you to play!",
    "🔥 Let’s start enjoying the beats!",
    "🎧 Your personal concert starts now!",
    "🌟 Welcome back to the world of rhythms!",
    "💿 Time to spin your favorite tracks!"
  ];
  const randomLine = catchyLines[Math.floor(Math.random() * catchyLines.length)];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/auth/login', {
        email: form.email,
        password: form.password,
      });

      // store user data
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userId', data.user._id);
      localStorage.setItem('userEmail', data.user.email);

      // show popup
      setShowPopup(true);

    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleRedirect = () => navigate('/Signup');

  return (
    <div className="w-screen h-screen bg-[var(--bg-primary)] flex items-center justify-center overflow-hidden relative">
      {/* Main Layout */}
      <div className="flex w-full h-full bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-tertiary)] to-[var(--bg-secondary)] overflow-hidden">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <img 
            src={loginPageImage} 
            alt="Music Background" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white px-16 text-center"> {/* Keeping text white for contrast on image */}
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Welcome Back
            </h1>
            <p className="text-2xl text-gray-200 leading-relaxed font-light"> {/* Keeping text light for contrast on image */}
              Continue Your Musical Adventure
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-1/2 bg-[var(--bg-primary)] p-8 lg:p-16 flex flex-col justify-center relative">
          <div className="max-w-lg mx-auto w-full">
            <div className="flex justify-center mb-8"> 
              <img src={theme === 'dark' ? LogoDark : LogoLight} alt="Brand Logo" className="w-40" />
            </div>
            
            <h2 className="text-4xl font-bold text-center mb-10 text-[var(--text-primary)]">Login</h2>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="relative group">
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-[var(--bg-secondary)] border-2 border-[var(--border-secondary)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-all duration-300 shadow-sm hover:shadow-md"
                  placeholder="Email address"
                  required
                />
              </div>
              
              <div className="relative group">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-5 py-4 pr-12 bg-[var(--bg-secondary)] border-2 border-[var(--border-secondary)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-all duration-300 shadow-sm hover:shadow-md"
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
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 text-[var(--accent-primary)] border-2 border-[var(--border-secondary)] rounded-lg focus:ring-4 focus:ring-[var(--accent-primary)]/20 focus:ring-offset-0 transition-all duration-200"
                  />
                  <label htmlFor="rememberMe" className="ml-3 text-base text-[var(--text-primary)] font-medium">
                    Remember me
                  </label>
                </div>
                <button 
                  type="button" 
                  className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] font-medium transition duration-200 hover:underline"
                  onClick={() => navigate('/Forgot')}
                >
                  Forgot password?
                </button>
              </div>
              
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-xl font-bold text-lg hover:from-[var(--accent-secondary)] hover:to-[var(--accent-primary)] transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                Sign In
              </button>
            </form>
            
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

      {showPopup && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          {/* Blurred background overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

          {/* Popup box */}
          <div className="relative bg-[var(--popup-bg)] backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-[var(--popup-border)]">
            <div className="flex justify-center mb-6">
              <div className="bg-green-500/20 rounded-full p-4">
                <CheckCircleIcon style={{ fontSize: "3rem" }} className="text-green-400" />
              </div>  
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Login Successful!</h1>
            <p className="text-[var(--text-secondary)] text-lg mb-6">{randomLine}</p>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white font-bold py-3 px-6 rounded-lg hover:from-[var(--accent-secondary)] hover:to-[var(--accent-primary)] transition-colors duration-300"
            >
              Start Listening
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
