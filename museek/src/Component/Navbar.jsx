import React, {useLocation, useState} from "react";
import LogoFinalDarkModeFrameResized from "../Images/LogoFinalDarkModeFrameResized.png"
import CircularLogoFinalDarkMode from "../Images/CircularLogoFinalDarkMode.png"
import home_white_variant from "../Images/Icons/home_white_variant.png"
import home_outlined from "../Images/Icons/home_outlined.png"
import Login from "./Login";
import Signup from "./Signup";
import { Navigate } from 'react-router-dom';

const Navbar = () => {

  const navigate = useNavigate();
    // const location = useLocation();
    // const isHome = location.pathname === '/'; 

    const handleRedirect = () => {
    // Redirects to the '/componentB' path
    navigate('/Login');
  };

    return (
    <nav className="h-[60px] flex items-center justify-between px-5 py-3 text-white">
      {/* Left - Brand Logo */}
      <div>
        <img
          src={CircularLogoFinalDarkMode}
          alt="Brand Logo"
          className="w-[45px] h-[45px] object-cover"
        />
      </div>

      {/* Middle - Home + Search */}
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 flex items-center justify-center bg-[#242527] opacity-80 hover:opacity-100 transition rounded-full font-semibold">
            <span className="">
                {/* {isHome ? <home_filled /> : <home_outlined />} */}
                 <img
                    src={home_white_variant}
                    alt="Brand Logo"
                    className="w-[20px] h-[20px] object-cover opacity-80"
                />
            </span>
        </button>
        <input
          type="text"
          placeholder="What do you want to play?"
          className="px-4 py-2 rounded-full outline-none border-none text-white bg-[#242527] w-[400px]"
        />
      </div>

      {/* Right - Profile */}
      <div>
        <img
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-[#ffd180]"
          onClick={handleRedirect}
        />
      </div>
    </nav>
  );
}

export default Navbar;