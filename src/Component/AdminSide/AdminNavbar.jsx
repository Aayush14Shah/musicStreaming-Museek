import React, { useState } from "react";
import { Avatar } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const adminName = localStorage.getItem("userName") || "Admin";

  const handleLogout = () => {
    // Clear all session data
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    sessionStorage.clear();
    // Redirect to login page
    navigate("/Login");
  };

  return (
    <header className="h-16 border-b border-[#CD7F32]/20 flex items-center justify-between px-6 shadow-md bg-[#181818]">
      <h2 className="text-lg font-bold">Admin Panel</h2>

      <div className="relative flex items-center gap-3">
        {/* Admin name display */}
        <span className="text-sm text-[#F5F5F5]/70 hidden sm:block">
          {adminName}
        </span>

        <button onClick={() => setOpen(!open)} aria-label="Admin menu">
          <Avatar
            alt={adminName}
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=CD7F32&color=fff`}
            className="ring-2 ring-[#CD7F32] cursor-pointer"
          />
        </button>

        {/* Dropdown */}
        {open && (
          <>
            {/* Click-away overlay */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 top-12 w-48 bg-[#1e1e1e] border border-[#CD7F32]/20 rounded-lg shadow-xl z-20">
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

                <hr className="border-[#CD7F32]/20 mx-3 my-1" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogoutIcon fontSize="small" />
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default AdminNavbar;
