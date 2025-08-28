import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../Images/LogoFinalLightModeFrameResized.png';
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/preferences', { state: form });
  };
  
  const handleLogin = () => navigate('/Login');

  return (
    <div className="w-screen h-screen bg-[#121212] flex items-center justify-center overflow-hidden">
      <div className="flex w-full h-full bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#0e0e0e] overflow-hidden">
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
        <div className="w-full lg:w-1/2 bg-[#181818] p-8 lg:p-16 flex flex-col justify-center relative">
          <div className="max-w-lg mx-auto w-full">
            {/* Logo positioned above Sign Up text */}
            <div className="flex justify-center mb-8">
              <img src={Logo} alt="Brand Logo" className="w-40" />
            </div>
            
            <h2 className="text-4xl font-bold text-center mb-10 text-[#F5F5F5]">Sign Up</h2>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-[#0e0e0e] border-2 border-gray-600 rounded-xl text-[#F5F5F5] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#CD7F32]/20 focus:border-[#CD7F32] transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="First name"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#CD7F32]/0 via-[#CD7F32]/0 to-[#CD7F32]/0 group-hover:from-[#CD7F32]/5 group-hover:via-[#CD7F32]/3 group-hover:to-[#CD7F32]/5 transition-all duration-300 pointer-events-none"></div>
                </div>
                <div className="relative group">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-[#0e0e0e] border-2 border-gray-600 rounded-xl text-[#F5F5F5] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#CD7F32]/20 focus:border-[#CD7F32] transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="Last name"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#CD7F32]/0 via-[#CD7F32]/0 to-[#CD7F32]/0 group-hover:from-[#CD7F32]/5 group-hover:via-[#CD7F32]/3 group-hover:to-[#CD7F32]/5 transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>
              
              <div className="relative group">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-[#0e0e0e] border-2 border-gray-600 rounded-xl text-[#F5F5F5] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#CD7F32]/20 focus:border-[#CD7F32] transition-all duration-300 shadow-sm hover:shadow-md"
                  placeholder="Email address"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#CD7F32]/0 via-[#CD7F32]/0 to-[#CD7F32]/0 group-hover:from-[#CD7F32]/5 group-hover:via-[#CD7F32]/3 group-hover:to-[#CD7F32]/5 transition-all duration-300 pointer-events-none"></div>
              </div>
              
              <div className="relative group">
                <input
                  id="password"
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
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#CD7F32]/0 via-[#CD7F32]/0 to-[#CD7F32]/0 group-hover:from-[#CD7F32]/5 group-hover:via-[#CD7F32]/3 group-hover:to-[#CD7F32]/5 transition-all duration-300 pointer-events-none"></div>
              </div>
              
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
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#CD7F32] to-[#b06f2d] text-white rounded-xl font-bold text-lg hover:from-[#b06f2d] hover:to-[#CD7F32] transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                Register
              </button>
            </form>
            
            <div className="mt-10 text-center">
              <p className="text-base text-gray-300">
                Already have an account?{' '}
                <button 
                  onClick={handleLogin} 
                  className="text-[#CD7F32] hover:text-[#b06f2d] font-semibold transition duration-200 hover:underline"
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