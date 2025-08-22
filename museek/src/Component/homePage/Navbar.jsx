// Updated Navbar.jsx (minor improvements for responsiveness)
import React, { useEffect, useState } from 'react';
import { Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
// Assume images are imported as in the original
import CircularLogoFinalDarkMode from '../../Images/CircularLogoFinalDarkMode.png';
import home_white_variant from '../../Images/Icons/home_white_variant.png';
import { Navigate,useNavigate } from 'react-router-dom';
import Login from '../Login';

const Navbar = () => {
  const [userInitial, setUserInitial] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) setUserInitial(name.charAt(0).toUpperCase());
  }, []);
    const handleRedirect = () => {
    navigate('/Login');
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    setUserInitial(null);
    setOpen(false);
    navigate('/');
  };
  return (
    <div className="fixed top-0 left-0 right-0 h-[60px] flex items-center justify-between px-4 md:px-6 py-3 text-[#F5F5F5] bg-[#121212] border-b border-[#1C2B2D] z-50">
      {/* Left - Brand Logo */}
      <div className="flex-shrink-0">
        <img
          src={CircularLogoFinalDarkMode}
          alt="Brand Logo"
          className="w-8 md:w-10 object-cover"
        />
      </div>

      {/* Middle - Home + Search */}
      <div className="flex-1 flex justify-center px-2 md:px-4">
        <div className="flex items-center space-x-2 md:space-x-4 max-w-[600px] w-full">
          <Tooltip title="Go to Home" arrow>
            <button className="w-10 h-10 flex items-center justify-center bg-[#1C2B2D] opacity-80 hover:opacity-100 transition rounded-full">
              <img
                src={home_white_variant}
                alt="Home Icon"
                className="w-5 h-5 object-cover opacity-80"
              />
            </button>
          </Tooltip>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="What do you want to play?"
              className="w-full px-4 py-2 md:py-3 rounded-full outline-none border-none text-[#F5F5F5] bg-[#1C2B2D] placeholder:text-[#CD7F32] pl-10 md:pl-12 text-sm md:text-base"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#CD7F32] opacity-70 w-5 h-5 md:w-6 md:h-6" />
          </div>
        </div>
      </div>

      {/* Right - Profile */}
      <div className="flex-shrink-0">
        {userInitial ? (
          <div className="relative">
          <div
            onClick={() => setOpen(!open)}
            className="w-10 h-10 flex items-center justify-center rounded-full cursor-pointer border-2 border-[#CD7F32] text-[#F5F5F5]"
            style={{ backgroundColor: '#1C2B2D' }}
            title={userInitial}
          >
            <span className="font-semibold text-lg">{userInitial}</span>
          </div>
          {open && (
            <div className="absolute right-0 mt-2 w-28 bg-[#1C2B2D] border border-[#CD7F32] rounded-md shadow-lg z-50">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-[#F5F5F5] hover:bg-[#2a2a2a]"
              >
                Logout
              </button>
            </div>
          )}
        </div>
        ) : (
          <button
            onClick={handleRedirect}
            className="px-4 py-2 bg-[#CD7F32] hover:bg-[#b06f2d] text-[#F5F5F5] rounded-full font-medium transition"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;