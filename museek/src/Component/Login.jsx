import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../Images/LogoFinalDarkModeFrameResized.png';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

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
      // store user name for navbar
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userId', data.user._id);
      localStorage.setItem('userEmail', data.user.email);
      alert('Login successful');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleRedirect = () => navigate('/Signup');
  return (
  <div className="flex items-center justify-center min-h-screen">
    <div className="bg-[#243537] p-8 rounded-3xl shadow-2xl w-full max-w-md border " style={{ borderColor: '#b06f2d', borderWidth: '2px' }}>
      {/* Page Title */}
      <div className="flex justify-center items-center">
      <img
        src={Logo}
        alt="Brand Logo"
        className="w-[160px] object-cover"
      />
      </div>
      <h1 className="text-3xl font-semibold text-center mb-6 text-[#f5f5f5]">Login</h1>

      {/* Login Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium mb-1 text-[#f5f5f5]">Username/Email</label>
          <input type="text" id="login-email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-3 bg-transparent border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cd7f34] transition duration-200 text-[#f5f5f5]" placeholder="Enter your username or email" />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium mb-1 text-[#f5f5f5]">Password</label>
          <input type="password" id="login-password" name="password" value={form.password} onChange={handleChange} className="w-full px-4 py-3 bg-transparent border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cd7f34] transition duration-200 text-[#f5f5f5]" placeholder="••••••••" />
        </div>
        <button type="submit" className="w-full py-3 bg-[#cd7f34] text-[#f5f5f5] rounded-lg font-semibold hover:bg-[#b06f2d] transition duration-200 shadow-lg mt-4">Sign In</button>
      </form>

      {/* Toggle Link */}
      <p className="text-sm text-center mt-6 text-[#f5f5f5]">
        Don't have an account? <button onClick={handleRedirect} className="text-[#cd7f34] hover:underline focus:outline-none">Sign Up</button>
      </p>
        </div>
  </div>
  );
};

export default Login;