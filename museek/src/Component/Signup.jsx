import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../Images/LogoFinalDarkModeFrameResized.png';

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleNext = (e) => {
    e.preventDefault();
    navigate('/preferences', { state: form });
  };
  const handleLogin = () => navigate('/Login');

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-[#243537] p-8 rounded-3xl shadow-2xl w-full max-w-md border" style={{ borderColor: '#b06f2d', borderWidth: '2px' }}>
        <div className="flex justify-center mb-4">
          <img src={Logo} alt="Brand Logo" className="w-[160px]" />
        </div>
        <h1 className="text-3xl font-semibold text-center mb-6 text-[#f5f5f5]">Sign Up</h1>

        <form className="space-y-4" onSubmit={handleNext}>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#f5f5f5]" htmlFor="name">Username</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-3 bg-transparent border border-gray-500 rounded-lg text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#cd7f34]" placeholder="Choose a username" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#f5f5f5]" htmlFor="email">Email</label>
            <input id="email" type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-3 bg-transparent border border-gray-500 rounded-lg text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#cd7f34]" placeholder="Enter your email" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#f5f5f5]" htmlFor="password">Password</label>
            <input id="password" type="password" name="password" value={form.password} onChange={handleChange} className="w-full px-4 py-3 bg-transparent border border-gray-500 rounded-lg text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#cd7f34]" placeholder="Create a password" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#f5f5f5]" htmlFor="mobile">Mobile No.</label>
            <input id="mobile" type="tel" name="mobile" value={form.mobile} onChange={handleChange} className="w-full px-4 py-3 bg-transparent border border-gray-500 rounded-lg text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#cd7f34]" placeholder="Enter your mobile number" />
          </div>
          <button type="submit" className="w-full py-3 bg-[#cd7f34] text-[#f5f5f5] rounded-lg font-semibold hover:bg-[#b06f2d] transition duration-200 mt-4">Next</button>
        </form>

        <p className="text-sm text-center mt-6 text-[#f5f5f5]">
          Already have an account?
          <button onClick={handleLogin} className="text-[#cd7f34] hover:underline ml-1">Login</button>
        </p>
      </div>
    </div>
  );
};

export default Signup;