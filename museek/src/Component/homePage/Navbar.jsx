// Updated Navbar.jsx (minor improvements for responsiveness)
import React, { useEffect, useState, useMemo } from 'react';
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

// Gradient avatars matching UserProfile component
const GRADIENT_AVATARS = [
  { id: 0, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 1, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 2, gradient: 'linear-gradient(135deg, #fad961 0%, #f76b1c 100%)' },
  { id: 3, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 4, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { id: 5, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 6, gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { id: 7, gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { id: 8, gradient: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)' },
  { id: 9, gradient: 'linear-gradient(135deg, #2e3192 0%, #1bffff 100%)' },
  { id: 10, gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
  { id: 11, gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' }
];

const Navbar = () => {
  const [userInitial, setUserInitial] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [open, setOpen] = useState(false);
  const [avatarIndex, setAvatarIndex] = useState(() => {
    const v = localStorage.getItem('avatarIndex');
    const index = v ? Number(v) : 0;
    return Math.max(0, Math.min(index, GRADIENT_AVATARS.length - 1));
  });
  const navigate = useNavigate();

  // Get current avatar style
  const avatarStyle = useMemo(() => {
    const avatar = GRADIENT_AVATARS[avatarIndex] || GRADIENT_AVATARS[0];
    return {
      background: avatar.gradient,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '40px',
      minHeight: '40px',
      width: '40px',
      height: '40px',
      flexShrink: 0
    };
  }, [avatarIndex]);

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) setUserInitial(name.charAt(0).toUpperCase());
    const email = localStorage.getItem('userEmail');
    if (email) setUserEmail(email);

    // Listen for avatar changes from UserProfile
    const handleAvatarChange = (e) => {
      const newIndex = e.detail?.avatarIndex ?? localStorage.getItem('avatarIndex');
      if (newIndex !== null && newIndex !== undefined) {
        const index = Number(newIndex);
        if (!Number.isNaN(index)) {
          setAvatarIndex(Math.max(0, Math.min(index, GRADIENT_AVATARS.length - 1)));
        }
      }
    };

    // Listen to storage events (cross-tab sync) and custom events
    const handleStorageChange = (e) => {
      if (e.key === 'avatarIndex') {
        const index = Number(e.newValue ?? 0);
        if (!Number.isNaN(index)) {
          setAvatarIndex(Math.max(0, Math.min(index, GRADIENT_AVATARS.length - 1)));
        }
      }
    };

    window.addEventListener('avatarChanged', handleAvatarChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('avatarChanged', handleAvatarChange);
      window.removeEventListener('storage', handleStorageChange);
    };
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
    <div className="fixed top-0 left-0 right-0 h-[60px] flex items-center justify-between px-4 md:px-6 py-3 text-[var(--text-primary)] bg-[var(--bg-secondary)] z-50 navbar-container">
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
              className="w-10 h-10 flex items-center justify-center home-icon-btn transition-all duration-200 rounded-full"
            >
              <img
                src={home_white_variant}
                alt="Home Icon"
                className="w-5 h-5 object-cover home-icon-img"
              />
            </button>
          </Tooltip>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="What do you want to play?"
              className="w-full px-4 py-2 md:py-3 rounded-full outline-none navbar-search-input text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] pl-10 md:pl-12 text-sm md:text-base transition-all duration-200"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 navbar-search-icon w-5 h-5 md:w-6 md:h-6" />
          </div>
        </div>
      </div>


      {/* Right - Profile */}
      <div className="flex-shrink-0">
        {userInitial ? (
          <div className="relative">
          <div
            onClick={() => setOpen(!open)}
            className="flex items-center justify-center rounded-full cursor-pointer border-2 border-[var(--accent-primary)] hover:border-[var(--accent-secondary)] hover:scale-105 transition-all duration-200 overflow-hidden flex-shrink-0"
            style={avatarStyle}
            title={userInitial}
          >
            <span className="font-semibold text-lg text-white drop-shadow-lg leading-none">{userInitial}</span>
          </div>
          {open && (
  <div className="absolute right-0 mt-3 w-56 rounded-xl shadow-[var(--shadow-primary)] z-50 overflow-hidden dropdown-menu">
    {/* Arrow */}
    <div className="absolute -top-2 right-4 w-4 h-4 rotate-45 dropdown-arrow"></div>

    {/* User Info */}
    {userEmail && (
      <div className="px-4 py-3 dropdown-user-info dropdown-divider">
        <div className="text-sm font-semibold text-[var(--text-primary)]">
          {userInitial}
        </div>
        <div className="text-xs text-[var(--text-secondary)] truncate" title={userEmail}>
          {userEmail}
        </div>
      </div>
    )}

    {/* Menu */}
    <div className="flex flex-col py-1 dropdown-menu-items">
      <button
        onClick={() => { setOpen(false); navigate('/profile'); }}
        className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] dropdown-menu-item transition-colors duration-200"
      >
        <AccountCircleIcon fontSize="small" className="dropdown-menu-icon" />
        Profile
      </button>

      <button
        onClick={() => { setOpen(false); navigate('/settings'); }}
        className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] dropdown-menu-item transition-colors duration-200"
      >
        <SettingsIcon fontSize="small" className="dropdown-menu-icon" />
        Settings
      </button>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] dropdown-menu-item transition-colors duration-200"
      >
        <LogoutIcon fontSize="small" className="dropdown-menu-icon" />
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