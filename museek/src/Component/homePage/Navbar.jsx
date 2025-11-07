// Updated Navbar.jsx (minor improvements for responsiveness)
import React, { useEffect, useState } from 'react';
import { Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
// Assume images are imported as in the original
import CircularLogoDark from '../../Images/CircularLogoFinalDarkMode.png'; 
import home_white_variant from '../../Images/Icons/home_white_variant.png';
import { Navigate,useNavigate } from 'react-router-dom';
import UserProfile from '../UserProfile';

const Navbar = () => {
  const [userInitial, setUserInitial] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) setUserInitial(name.charAt(0).toUpperCase());
    const email = localStorage.getItem('userEmail');
    if (email) setUserEmail(email);
  }, []);

  const handleRedirect = () => {
    navigate('/Login');
  };

  const handleLogout = () => {
    // Clear all user-related data from localStorage
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('lastPlayedTrack');
    localStorage.removeItem('recentlyPlayed');
    localStorage.removeItem('museek.playlists');
    
    // Reset component state
    setUserInitial(null);
    setUserEmail(null);
    setOpen(false);
    
    // Navigate to home page
    navigate('/');
  };
  return (
    <div className="fixed top-0 left-0 right-0 h-[60px] flex items-center justify-between px-4 md:px-6 py-3 text-[var(--text-primary)] bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] z-50">
      {/* Left - Brand Logo */}
      <div className="flex-shrink-0">
        <img
          src={CircularLogoDark}
          alt="Brand Logo"
          className="w-8 md:w-10 object-cover"
        />
      </div>

      {/* Middle - Home + Search */}
      <div className="flex-1 flex justify-center px-2 md:px-4">
        <div className="flex items-center space-x-2 md:space-x-4 max-w-[600px] w-full">
          <Tooltip title="Go to Home" arrow>
            <button 
              onClick={() => navigate("/")}
              className="w-10 h-10 flex items-center justify-center bg-[var(--bg-tertiary)] opacity-80 hover:opacity-100 transition rounded-full"
            >
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
              className="w-full px-4 py-2 md:py-3 rounded-full outline-none border-none text-[var(--text-primary)] bg-[var(--bg-primary)] placeholder:text-[var(--accent-primary)] pl-10 md:pl-12 text-sm md:text-base"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--accent-primary)] opacity-70 w-5 h-5 md:w-6 md:h-6" />
          </div>
        </div>
      </div>


      {/* Right - Profile */}
      <div className="flex-shrink-0">
        {userInitial ? (
          <div className="relative">
          <div
            onClick={() => setOpen(!open)}
            className="w-10 h-10 flex items-center justify-center rounded-full cursor-pointer border-2 border-[var(--accent-primary)] text-[var(--text-primary)] hover:border-[var(--accent-secondary)] hover:scale-105 transition-all duration-200"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
            title={userInitial}
          >
            <span className="font-semibold text-lg">{userInitial}</span>
          </div>
          {open && (
  <div className="absolute right-0 mt-3 w-56 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl shadow-lg z-50 overflow-hidden">
    {/* Arrow */}
    <div className="absolute -top-2 right-4 w-4 h-4 bg-[var(--bg-tertiary)] border-l border-t border-[var(--border-primary)] rotate-45"></div>

    {/* User Info */}
    {userEmail && (
      <div className="px-4 py-3 border-b border-[var(--border-primary)]">
        <div className="text-sm font-semibold text-[var(--text-primary)]">
          {userInitial}
        </div>
        <div className="text-xs text-[var(--accent-primary)] truncate" title={userEmail}>
          {userEmail}
        </div>
      </div>
    )}

    {/* Menu */}
    <div className="flex flex-col py-1">
      <button
        onClick={() => { setOpen(false); navigate('/profile'); }}
        className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/10 hover:text-[var(--accent-primary)] transition-colors"
      >
        <AccountCircleIcon fontSize="small" className="text-[var(--accent-primary)]/70" />
        Profile
      </button>

      <button
        onClick={() => { setOpen(false); navigate('/settings'); }}
        className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/10 hover:text-[var(--accent-primary)] transition-colors"
      >
        <SettingsIcon fontSize="small" className="text-[var(--accent-primary)]/70" />
        Settings
      </button>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/10 hover:text-[var(--accent-primary)] transition-colors"
      >
        <LogoutIcon fontSize="small" className="text-[var(--accent-primary)]/70" />
        Logout
      </button>
    </div>
  </div>
)}
        </div>
        ) : (
          <button
            onClick={handleRedirect}
            className="px-4 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white rounded-md font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;