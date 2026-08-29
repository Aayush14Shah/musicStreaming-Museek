import React, { useState, useEffect } from "react";
import { Avatar } from "@mui/material";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import ShieldIcon from "@mui/icons-material/Shield";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import axios from "axios";

const AdminProfile = () => {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  const adminId = localStorage.getItem("userId");
  const adminName = localStorage.getItem("userName") || "Admin";
  const adminEmail = localStorage.getItem("userEmail") || "";

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/admins`
        );
        // Find the logged-in admin from the list
        const me = data.find((a) => a._id === adminId || a.email === adminEmail);
        setAdminData(me || null);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [adminId, adminEmail]);

  const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center gap-4 p-4 bg-[#CD7F32]/5 rounded-lg border border-[#CD7F32]/10">
      <div className="text-[#CD7F32]/70 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-[#F5F5F5]/50 uppercase tracking-wider">{label}</p>
        <p className="text-[#F5F5F5] font-medium mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#181818] text-[#F5F5F5]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-2xl mx-auto">
            {/* Page title */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold">My Profile</h2>
              <p className="text-[#F5F5F5]/50 mt-1">Your admin account details</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-2 border-[#CD7F32] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="bg-[#1e1e1e] border border-[#CD7F32]/20 rounded-2xl shadow-xl overflow-hidden">
                {/* Header banner */}
                <div className="h-24 bg-gradient-to-r from-[#CD7F32]/30 via-[#CD7F32]/10 to-transparent" />

                {/* Avatar + name */}
                <div className="px-8 pb-8 -mt-12">
                  <Avatar
                    alt={adminName}
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=CD7F32&color=fff&size=128`}
                    sx={{ width: 88, height: 88 }}
                    className="ring-4 ring-[#181818] shadow-lg"
                  />
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold">{adminData?.name || adminName}</h3>
                    <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#CD7F32]/20 text-[#CD7F32] border border-[#CD7F32]/30">
                      <ShieldIcon sx={{ fontSize: 13 }} />
                      {adminData?.role || "Admin"}
                    </span>
                  </div>

                  {/* Info grid */}
                  <div className="mt-6 space-y-3">
                    <InfoRow
                      icon={<PersonIcon />}
                      label="Full Name"
                      value={adminData?.name || adminName}
                    />
                    <InfoRow
                      icon={<EmailIcon />}
                      label="Email Address"
                      value={adminData?.email || adminEmail}
                    />
                    <InfoRow
                      icon={<ShieldIcon />}
                      label="Role"
                      value={adminData?.role || "Admin"}
                    />
                    <InfoRow
                      icon={<CalendarTodayIcon />}
                      label="Account Created"
                      value={
                        adminData?.createdAt
                          ? new Date(adminData.createdAt).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "—"
                      }
                    />
                  </div>

                  {/* Status badge */}
                  <div className="mt-4 flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        adminData?.is_active === 1 ? "bg-green-400" : "bg-red-400"
                      }`}
                    />
                    <span className="text-sm text-[#F5F5F5]/60">
                      {adminData?.is_active === 1 ? "Active" : "Inactive"} account
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminProfile;
