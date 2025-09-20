import React from "react";
import {
  Home as HomeIcon,
  People as PeopleIcon,
  LibraryMusic as MusicIcon,
  Settings as SettingsIcon,
  Assessment as AnalyticsIcon,
} from "@mui/icons-material";
import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
  const links = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <HomeIcon /> },
    { to: "/admin/content", label: "Content", icon: <MusicIcon /> },
    { to: "/admin/manageUser", label: "Users", icon: <PeopleIcon /> },
    { to: "/admin/manageAdmin", label: "Admins", icon: <PeopleIcon /> },
    { to: "/admin/analytics", label: "Analytics", icon: <AnalyticsIcon /> },
    { to: "/admin/settings", label: "Settings", icon: <SettingsIcon /> },
  ];

  return (
    <aside className="w-64 bg-[#181818] border-r border-[#CD7F32]/20 shadow-lg flex-shrink-0">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#CD7F32]/20">
          <h1 className="text-xl font-bold text-[#CD7F32]">Music Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  isActive
                    ? "bg-[#CD7F32]/20 text-[#CD7F32]"
                    : "hover:bg-[#CD7F32]/10 hover:text-[#CD7F32] text-[#F5F5F5]"
                }`
              }
            >
              {link.icon}
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;
