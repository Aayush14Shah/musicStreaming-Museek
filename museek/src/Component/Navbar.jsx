import React, {useLocation, useState} from "react";
import LogoFinalDarkModeFrameResized from "../Images/LogoFinalDarkModeFrameResized.png"
import CircularLogoFinalDarkModeRM_BG from "../Images/CircularLogoFinalDarkModeRM_BG.png"
import Logo2 from "../Images/Logo2.png"
import Logo2Variant from "../Images/Logo2Variant.png"
import home_filled from "../Images/Icons/home_filled.png"
import home_filled_variant from "../Images/Icons/home_filled_variant.png"
import home_outlined from "../Images/Icons/home_outlined.png"

const Navbar = () => {

    // const location = useLocation();
    // const isHome = location.pathname === '/'; 

    return (
    <nav className="flex items-center justify-between px-5 py-3 text-white">
      {/* Left - Brand Logo */}
      <div>
        <img
          src={Logo2Variant}
          alt="Brand Logo"
          className="w-[40px] h-[40px] object-cover border-[1px] border-white rounded-full "
        />
      </div>

      {/* Middle - Home + Search */}
      <div className="flex items-center gap-3">
        <button className="flex items-center bg-[#ffd180] opacity-30 hover:opacity-90 transition p-2 rounded-full font-semibold">
            <span className="">
                {/* {isHome ? <home_filled /> : <home_outlined />} */}
                 <img
                    src={home_filled_variant}
                    alt="Brand Logo"
                    className="w-6 h-6 object-cover"
                />
            </span>
        </button>
        <input
          type="text"
          placeholder="Search music..."
          className="px-4 py-2 rounded-full outline-none border-none text-white bg-gray-700 w-[400px]"
        />
      </div>

      {/* Right - Profile */}
      <div>
        <img
          src="https://via.placeholder.com/40"
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-[#ffd180]"
        />
      </div>
    </nav>
  );
}

export default Navbar;