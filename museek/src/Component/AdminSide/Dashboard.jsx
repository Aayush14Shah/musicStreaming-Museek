import React, { useState, useEffect } from "react";
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
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeAdmins: 0,
    totalCustomSongs: 0,
    listeningHours: 0 // Now dynamic
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logout clicked");
    // TODO: Add real logout logic
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [usersResponse, adminsResponse, songsResponse, listeningResponse] = await Promise.all([
        fetch('http://localhost:5000/api/users'),
        fetch('http://localhost:5000/api/admins'),
        fetch('http://localhost:5000/api/custom-songs/stats/overview'),
        fetch('http://localhost:5000/api/listening-hours/total')
      ]);

      const [usersData, adminsData, songsData, listeningData] = await Promise.all([
        usersResponse.json(),
        adminsResponse.json(),
        songsResponse.json(),
        listeningResponse.json()
      ]);

      setStats({
        totalUsers: usersData.length || 0,
        activeAdmins: adminsData.length || 0,
        totalCustomSongs: songsData.totalSongs || 0,
        listeningHours: listeningData.totalHours || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  // Load stats on component mount
  useEffect(() => {
    fetchDashboardStats();
  }, []);

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
                  { 
                    title: "Total Users", 
                    value: loading ? "..." : stats.totalUsers.toLocaleString(),
                    icon: <PeopleIcon />
                  },
                  { 
                    title: "Active Admins", 
                    value: loading ? "..." : stats.activeAdmins.toString(),
                    icon: <AdminIcon />
                  },
                  { 
                    title: "Total Songs in Custom API", 
                    value: loading ? "..." : stats.totalCustomSongs.toLocaleString(),
                    icon: <MusicIcon />
                  },
                  { 
                    title: "Listening Hours", 
                    value: loading ? "..." : stats.listeningHours.toLocaleString(),
                    icon: <HomeIcon />
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-[#CD7F32]/10 rounded-lg p-6 flex items-center gap-6 shadow-md"
                  >
                    <div className="bg-[#CD7F32]/20 p-3 rounded-full text-[#CD7F32] shadow-inner">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-sm text-[#F5F5F5]/70">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions - Centered */}
              <div className="flex justify-start">
                <div className="bg-[#181818] border border-[#CD7F32]/20 rounded-lg p-6 shadow-lg w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4 text-center">Quick Actions</h3>
                  <div className="space-y-4">
                    {/* <Button
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
                    </Button> */}

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
                      onClick={() => navigate("/admin/songs/add")}
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
