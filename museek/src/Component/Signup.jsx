import React from 'react';
import { Navigate,useNavigate } from 'react-router-dom';
import Login from './Login';
import Logo from '../Images/LogoFinalDarkModeFrameResized.png';

const Signup = ({}) => {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate('/Login');
  };
  return (
    <div className="bg-[#243537] p-8 rounded-3xl shadow-2xl w-full max-w-md border" style={{ borderColor: '#b06f2d', borderWidth: '2px' }}>
      {/* Page Title */}
      <div className="flex justify-center items-center">
            <img
              src={Logo}
              alt="Brand Logo"
              className="w-[160px] object-cover"
            />
            </div>
      <h1 className="text-3xl font-semibold text-center mb-6 text-[#f5f5f5]">Sign Up</h1>

      {/* Sign Up Form */}
      <form className="space-y-4">
        <div>
          <label htmlFor="signup-username" className="block text-sm font-medium mb-1 text-[#f5f5f5]">Username</label>
          <input type="text" id="signup-username" name="username" className="w-full px-4 py-3 bg-transparent border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cd7f34] transition duration-200 text-[#f5f5f5]" placeholder="Choose a username" />
        </div>
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium mb-1 text-[#f5f5f5]">Email</label>
          <input type="email" id="signup-email" name="email" className="w-full px-4 py-3 bg-transparent border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cd7f34] transition duration-200 text-[#f5f5f5]" placeholder="Enter your email address" />
        </div>
        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium mb-1 text-[#f5f5f5]">Password</label>
          <input type="password" id="signup-password" name="password" className="w-full px-4 py-3 bg-transparent border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cd7f34] transition duration-200 text-[#f5f5f5]" placeholder="Create a password" />
        </div>
        <div>
          <label htmlFor="signup-mobile" className="block text-sm font-medium mb-1 text-[#f5f5f5]">Mobile No.</label>
          <input type="tel" id="signup-mobile" name="mobile" className="w-full px-4 py-3 bg-transparent border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cd7f34] transition duration-200 text-[#f5f5f5]" placeholder="Enter your mobile number" />
        </div>
        <button type="submit" className="w-full py-3 bg-[#cd7f34] text-[#f5f5f5] rounded-lg font-semibold hover:bg-[#b06f2d] transition duration-200 shadow-lg mt-4">Sign Up</button>
      </form>

      {/* Toggle Link */}
      <p className="text-sm text-center mt-6 text-[#f5f5f5]">
        Already have an account? <button onClick={handleLogin} className="text-[#cd7f34] hover:underline focus:outline-none">Login</button>
      </p>
    </div>
  );
};

export default Signup;