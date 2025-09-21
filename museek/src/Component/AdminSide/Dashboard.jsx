import React, { useState } from "react";
import { Avatar, Button } from "@mui/material";
import {
  Home as HomeIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  LibraryMusic as MusicIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AddAdminPopup from "./AddAdminPopup";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logout clicked");
    // TODO: Add real logout logic
  };

  return (
    <div className="flex h-screen bg-[#181818] text-[#F5F5F5]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Dashboard Body */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Title */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold">Dashboard</h2>
                <p className="text-[#F5F5F5]/70 mt-1">
                  Quick overview of your system
                </p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { title: "Total Users", value: "1,234" },
                  { title: "Active Admins", value: "5" },
                  { title: "Total Songs in API", value: "10,000" },
                  { title: "Listening Hours", value: "5,000" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-[#CD7F32]/10 rounded-lg p-6 flex items-center gap-6 shadow-md"
                  >
                    <div className="bg-[#CD7F32]/20 p-3 rounded-full text-[#CD7F32] shadow-inner">
                      <HomeIcon />
                    </div>
                    <div>
                      <p className="text-sm text-[#F5F5F5]/70">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Actions */}
                <div className="lg:col-span-2 bg-[#181818] border border-[#CD7F32]/20 rounded-lg overflow-hidden shadow-lg">
                  <div className="p-6 border-b border-[#CD7F32]/20">
                    <h3 className="text-lg font-semibold">
                      Recent User Actions
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#CD7F32]/5">
                        <tr>
                          <th className="px-6 py-3 text-sm font-medium text-[#F5F5F5]/70 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-sm font-medium text-[#F5F5F5]/70 uppercase tracking-wider">
                            Action
                          </th>
                          <th className="px-6 py-3 text-sm font-medium text-[#F5F5F5]/70 uppercase tracking-wider">
                            Timestamp
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#CD7F32]/10">
                        {[
                          [
                            "Sophia Clark",
                            "Uploaded a new song",
                            "2 hours ago",
                          ],
                          [
                            "Liam Carter",
                            "Updated profile information",
                            "3 hours ago",
                          ],
                          [
                            "Ava Bennett",
                            "Added a new playlist",
                            "5 hours ago",
                          ],
                          ["Noah Foster", "Changed password", "1 day ago"],
                          ["Isabella Hayes", "Reported a bug", "2 days ago"],
                        ].map(([user, action, time], i) => (
                          <tr key={i}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[#F5F5F5]/70">
                              {action}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[#F5F5F5]/70">
                              {time}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#181818] border border-[#CD7F32]/20 rounded-lg p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-4">
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: "#CD7F32",
                        "&:hover": { backgroundColor: "#b46f2a" },
                        fontWeight: "bold",
                        borderRadius: "0.5rem",
                        padding: "0.75rem",
                      }}
                    >
                      Add User
                    </Button>

                    <Button
                      onClick={() => setShowAddAdmin(true)}
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: "#CD7F32",
                        "&:hover": { backgroundColor: "#b46f2a" },
                        fontWeight: "bold",
                        borderRadius: "0.5rem",
                        padding: "0.75rem",
                      }}
                    >
                      Add Admin
                    </Button>

                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: "#CD7F32",
                        "&:hover": { backgroundColor: "#b46f2a" },
                        fontWeight: "bold",
                        borderRadius: "0.5rem",
                        padding: "0.75rem",
                      }}
                    >
                      Add Song
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
        <AddAdminPopup
          showPopup={showAddAdmin}
          setShowPopup={setShowAddAdmin}
        />
      </div>
    </div>
  );
};

export default Dashboard;
