import React, { useState } from "react";
import { Avatar } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logout clicked");
    // TODO: real logout logic
  };

  return (
    <header className="h-16 border-b border-[#CD7F32]/20 flex items-center justify-between px-6 shadow-md bg-[#181818]">
      <h2 className="text-lg font-bold">Admin Panel</h2>

      <div className="relative">
        <button onClick={() => setOpen(!open)}>
          <Avatar
            alt="Admin"
            src="https://i.pravatar.cc/100"
            className="ring-2 ring-[#CD7F32] cursor-pointer"
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-[#181818] border border-[#CD7F32]/20 rounded-lg shadow-xl z-20">
            <div className="flex flex-col py-1">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/admin/profile");
                }}
                className="flex items-center gap-3 px-4 py-2 text-sm text-[#F5F5F5] hover:bg-[#CD7F32]/10 hover:text-[#CD7F32] transition-colors"
              >
                <AccountCircleIcon fontSize="small" className="text-[#CD7F32]/70" />
                Profile
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/admin/settings");
                }}
                className="flex items-center gap-3 px-4 py-2 text-sm text-[#F5F5F5] hover:bg-[#CD7F32]/10 hover:text-[#CD7F32] transition-colors"
              >
                <SettingsIcon fontSize="small" className="text-[#CD7F32]/70" />
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 text-sm text-[#F5F5F5] hover:bg-[#CD7F32]/10 hover:text-[#CD7F32] transition-colors"
              >
                <LogoutIcon fontSize="small" className="text-[#CD7F32]/70" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminNavbar;
