import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../Images/LogoFinalDarkModeFrameResized.png';
import loginPageImage from '../Images/loginPageImage.jpg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

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
    <div className="w-screen h-screen bg-[#121212] flex items-center justify-center overflow-hidden relative">
      {/* Main Layout */}
      <div className="flex w-full h-full bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#0e0e0e] overflow-hidden">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <img 
            src={loginPageImage} 
            alt="Music Background" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white px-16 text-center">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Welcome Back
            </h1>
            <p className="text-2xl text-gray-200 leading-relaxed font-light">
              Continue Your Musical Adventure
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-1/2 bg-[#181818] p-8 lg:p-16 flex flex-col justify-center relative">
          <div className="max-w-lg mx-auto w-full">
            <div className="flex justify-center mb-8">
              <img src={Logo} alt="Brand Logo" className="w-40" />
            </div>
            
            <h2 className="text-4xl font-bold text-center mb-10 text-[#F5F5F5]">Login</h2>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="relative group">
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-[#0e0e0e] border-2 border-gray-600 rounded-xl text-[#F5F5F5] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#CD7F32]/20 focus:border-[#CD7F32] transition-all duration-300 shadow-sm hover:shadow-md"
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
                  className="w-full px-5 py-4 pr-12 bg-[#0e0e0e] border-2 border-gray-600 rounded-xl text-[#F5F5F5] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#CD7F32]/20 focus:border-[#CD7F32] transition-all duration-300 shadow-sm hover:shadow-md"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-[#CD7F32] transition-colors duration-200"
                >
                  {showPassword ? "🙈" : "👁️"}
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
                    className="w-5 h-5 text-[#CD7F32] border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-[#CD7F32]/20 focus:ring-offset-0 transition-all duration-200"
                  />
                  <label htmlFor="rememberMe" className="ml-3 text-base text-[#F5F5F5] font-medium">
                    Remember me
                  </label>
                </div>
                <button 
                  type="button" 
                  className="text-[#CD7F32] hover:text-[#b06f2d] font-medium transition duration-200 hover:underline"
                  onClick={() => navigate('/Forgot')}
                >
                  Forgot password?
                </button>
              </div>
              
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#CD7F32] to-[#b06f2d] text-white rounded-xl font-bold text-lg hover:from-[#b06f2d] hover:to-[#CD7F32] transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                Sign In
              </button>
            </form>
            
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

      {showPopup && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          {/* Blurred background overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

          {/* Popup box */}
          <div className="relative bg-[#282828]/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-[#CD7F32]/30">
            <div className="flex justify-center mb-6">
              <div className="bg-green-500/20 rounded-full p-4">
                <CheckCircleIcon style={{ fontSize: "3rem" }} className="text-green-400" />
              </div>  
            </div>
            <h1 className="text-2xl font-bold text-[#F5F5F5] mb-2">Login Successful!</h1>
            <p className="text-gray-300 text-lg mb-6">{randomLine}</p>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-[#CD7F32] to-[#b06f2d] text-white font-bold py-3 px-6 rounded-lg hover:from-[#b06f2d] hover:to-[#CD7F32] transition-colors duration-300"
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
