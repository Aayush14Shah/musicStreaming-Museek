import React from "react";
import { Button } from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";

const AdminDetailsPopup = ({ admin, setAdmin }) => {
  if (!admin) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setAdmin(null)}
      ></div>

      <div className="relative bg-[#282828]/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-4xl w-full mx-4 border border-[#CD7F32]/30 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#CD7F32]/20">
              <PersonIcon sx={{ fontSize: 40, color: '#CD7F32' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5F5F5]">
                Admin Profile
              </h1>
              <p className="text-[#F5F5F5]/70">Complete admin information</p>
            </div>
          </div>
          <Button
            onClick={() => setAdmin(null)}
            variant="outlined"
            sx={{
              borderColor: "#CD7F32/50",
              color: "#F5F5F5/70",
              "&:hover": { 
                borderColor: "#CD7F32",
                backgroundColor: "#CD7F32/10"
              },
              minWidth: "auto",
              padding: "0.5rem",
            }}
          >
            ✕
          </Button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-4">
            <div className="bg-[#2a2a2a]/50 rounded-lg p-4 border border-[#CD7F32]/20">
              <h3 className="text-lg font-semibold text-[#CD7F32] mb-3">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-[#CD7F32]/10">
                  <span className="text-[#F5F5F5]/70 font-medium">Name:</span>
                  <span className="text-[#F5F5F5] font-semibold">{admin.name}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-[#CD7F32]/10">
                  <span className="text-[#F5F5F5]/70 font-medium">Email:</span>
                  <span className="text-[#F5F5F5] font-semibold">{admin.email}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-[#CD7F32]/10">
                  <span className="text-[#F5F5F5]/70 font-medium">Role:</span>
                  <span className="text-[#F5F5F5] font-semibold">{admin.role || "Admin"}</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#F5F5F5]/70 font-medium">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${admin.status ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {admin.status ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-[#2a2a2a]/50 rounded-lg p-4 border border-[#CD7F32]/20">
              <h3 className="text-lg font-semibold text-[#CD7F32] mb-3">Account Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-[#CD7F32]/10">
                  <span className="text-[#F5F5F5]/70 font-medium">Created:</span>
                  <span className="text-[#F5F5F5] font-semibold">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#F5F5F5]/70 font-medium">Last Login:</span>
                  <span className="text-[#F5F5F5] font-semibold">2 days ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="space-y-4">
            {/* Admin Stats */}
            <div className="bg-[#2a2a2a]/50 rounded-lg p-4 border border-[#CD7F32]/20">
              <h3 className="text-lg font-semibold text-[#CD7F32] mb-3">Admin Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-[#F5F5F5]">15</div>
                  <div className="text-xs text-[#F5F5F5]/70">Users Managed</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-[#F5F5F5]">4</div>
                  <div className="text-xs text-[#F5F5F5]/70">Requests Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-[#F5F5F5]">23</div>
                  <div className="text-xs text-[#F5F5F5]/70">Songs Added</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-[#F5F5F5]">8</div>
                  <div className="text-xs text-[#F5F5F5]/70">Reports Resolved</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#2a2a2a]/50 rounded-lg p-4 border border-[#CD7F32]/20">
              <h3 className="text-lg font-semibold text-[#CD7F32] mb-3">Recent Activity</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 py-1 border-b border-[#CD7F32]/10">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-[#F5F5F5]/70">Added new song</span>
                </div>
                <div className="flex items-center gap-2 py-1 border-b border-[#CD7F32]/10">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-xs text-[#F5F5F5]/70">Approved user registration</span>
                </div>
                <div className="flex items-center gap-2 py-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-xs text-[#F5F5F5]/70">Updated permissions</span>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-[#2a2a2a]/50 rounded-lg p-4 border border-[#CD7F32]/20">
              <h3 className="text-lg font-semibold text-[#CD7F32] mb-3">Permissions</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-[#F5F5F5]">User Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-[#F5F5F5]">Content Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-[#F5F5F5]">System Settings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-xs text-[#F5F5F5]">Analytics Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDetailsPopup;
