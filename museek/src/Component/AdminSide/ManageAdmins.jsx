// src/pages/ManageAdmins.jsx
import React, { useEffect, useState } from "react";
import { Button, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import AdminDetailsPopup from "./AdminDetailsPopup"; // similar to UserDetailsPopup but for stats
import EditAdminPopup from "./EditAdminPopup"; // optional, if edit required
import ConfirmPopup from "./ConfirmPop-up";
import AddAdminPopup from "./AddAdminPopup";
import AddAdminPopup2 from "./AddAdminPopup2";
import ConfirmAdminPopup from "./ConfirmAdminPop-up";

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editAdmin, setEditAdmin] = useState(null);
  const [deleteAdmin, setDeleteAdmin] = useState(null);
  const [showAddAdmin, setShowAddAdmin] = useState(false);

  // Fetch admins from backend
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admins"); // make sure backend endpoint exists
        const data = await res.json();
        setAdmins(data);
      } catch (err) {
        console.error("Error fetching admins:", err);
      }
    };
    fetchAdmins();
  }, []);

  return (
    <div className="flex h-screen bg-[#181818] text-[#F5F5F5]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">

              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold">Admins</h2>
                  <p className="text-[#F5F5F5]/70 mt-1">
                    Manage admin accounts and permissions
                  </p>
                </div>
                <Button
                  variant="contained"
                  onClick={() => setShowAddAdmin(true)}
                  sx={{
                    backgroundColor: "#CD7F32",
                    "&:hover": { backgroundColor: "#b46f2a" },
                    fontWeight: "bold",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 1.5rem",
                    textTransform: "none",
                  }}
                >
                  + Add New Admin
                </Button>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search admins by name, email..."
                  className="w-full bg-[#2a2a2a] text-[#F5F5F5] px-4 py-3 rounded-lg border border-[#CD7F32]/20 focus:outline-none focus:border-[#CD7F32] focus:ring-1 focus:ring-[#CD7F32] placeholder-[#F5F5F5]/70"
                />
              </div>

              {/* Admin Table */}
              <div className="bg-[#181818] border border-[#CD7F32]/20 rounded-lg overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#CD7F32]/5">
                      <tr>
                        <th className="px-6 py-4 text-sm font-medium text-[#F5F5F5]/70 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-4 text-sm font-medium text-[#F5F5F5]/70 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-4 text-sm font-medium text-[#F5F5F5]/70 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-sm font-medium text-[#F5F5F5]/70 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-sm font-medium text-[#F5F5F5]/70 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-sm font-medium text-[#F5F5F5]/70 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-[#F5F5F5]/70 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#CD7F32]/10">
                      {admins.map((admin, index) => (
                        <tr
                          key={admin._id}
                          className="hover:bg-[#CD7F32]/5 transition cursor-pointer"
                          onClick={() => setSelectedAdmin(admin)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{admin.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-[#F5F5F5]/70">{admin.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-[#F5F5F5]/70">{admin.role || "Admin"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {admin.is_active === 1 ? (
                              <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                                Active
                              </span>
                            ) : (
                              <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[#F5F5F5]/70">
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap flex gap-2 justify-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <IconButton
                              onClick={() => setEditAdmin(admin)}
                              size="small"
                              sx={{
                                color: "#CD7F32",
                                "&:hover": { backgroundColor: "#CD7F32/10" }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => setDeleteAdmin(admin)}
                              size="small"
                              sx={{
                                color: "#ef4444",
                                "&:hover": { backgroundColor: "#ef4444/10" }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Popups */}
      {selectedAdmin && (
        <AdminDetailsPopup
          admin={selectedAdmin}
          setAdmin={setSelectedAdmin}
        />
      )}

      {editAdmin && (
        <EditAdminPopup admin={editAdmin} setAdmin={setEditAdmin} />
      )}

      {deleteAdmin && (
        <ConfirmAdminPopup
          deleteAdmin={deleteAdmin}
          setDeleteAdmin={setDeleteAdmin}
        />
      )}

      {showAddAdmin && (
        <AddAdminPopup2
          showPopup={showAddAdmin}
          setShowPopup={setShowAddAdmin}
        />
      )}
    </div>
  );
};

export default ManageAdmins;
