import React from 'react';
import { Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
// Assume images are imported as in the original
import CircularLogoFinalDarkMode from '../../Images/CircularLogoFinalDarkMode.png';
import home_white_variant from '../../Images/Icons/home_white_variant.png';
import { Navigate,useNavigate } from 'react-router-dom';
import Login from '../Login';

const Navbar = () => {
  const navigate = useNavigate(); 
    const handleRedirect = () => {
      navigate('/Login');
    };
  return (
    <div className="fixed top-0 w-screen h-[60px] flex items-center justify-between px-5 py-3 text-[#F5F5F5] bg-[#121212] border-b border-[#1C2B2D] z-60">
      {/* Left - Brand Logo */}
      <div>
        <img
          src={CircularLogoFinalDarkMode}
          alt="Brand Logo"
          className="w-[40px] object-cover"
        />
      </div>

      {/* Middle - Home + Search */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center space-x-2">
          <Tooltip title="Go to Home" arrow>
            <button className="w-10 h-10 flex items-center justify-center bg-[#1C2B2D] opacity-80 hover:opacity-100 transition rounded-full font-semibold">
              <img
                src={home_white_variant}
                alt="Home Icon"
                className="w-[20px] h-[20px] object-cover opacity-80"
              />
            </button>
          </Tooltip>
          <div className="relative">
            <input
              type="text"
              placeholder="What do you want to play?"
              className="px-4 py-2 rounded-full outline-none border-none text-[#F5F5F5] bg-[#1C2B2D] w-full max-w-[400px] placeholder:text-[#CD7F32] pl-10"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#CD7F32] opacity-70" />
          </div>
        </div>
      </div>

      {/* Right - Profile */}
      <div className="w-12 flex-shrink-0 flex justify-end">
        <Tooltip title="Profile" arrow>
          <img
            src="https://via.placeholder.com/40"
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-[#CD7F32]"
            onClick={handleRedirect}
          />
          
        </Tooltip>
      </div>
    </div>
  );
};

export default Navbar;