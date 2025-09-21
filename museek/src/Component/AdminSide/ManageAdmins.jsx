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

        <div className="flex-1 p-6 overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Admins</h1>
            <Button
              variant="contained"
              onClick={() => setShowAddAdmin(true)}
              sx={{
                backgroundColor: "#CD7F32",
                "&:hover": { backgroundColor: "#b46f2a" },
                fontWeight: "bold",
                borderRadius: "0.75rem",
                padding: "0.6rem 1.2rem",
              }}
            >
              + Add New Admin
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search admins by name, email..."
              className="w-full bg-[#222] text-[#F5F5F5] px-4 py-2 rounded-lg border border-[#CD7F32]/30 focus:outline-none"
            />
          </div>

          {/* Admin Table */}
          <div className="bg-[#222]/80 rounded-lg border border-[#CD7F32]/30 shadow-lg overflow-auto max-h-[calc(100vh-200px)]">
            <table className="w-full">
              <thead className="bg-[#333]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, index) => (
                  <tr
                    key={admin._id}
                    className="hover:bg-[#CD7F32]/10 transition cursor-pointer"
                    onClick={() => setSelectedAdmin(admin)}
                  >
                    <td className="px-6 py-3">{index + 1}</td>
                    <td className="px-6 py-3">{admin.name}</td>
                    <td className="px-6 py-3">{admin.email}</td>
                    <td className="px-6 py-3">{admin.role || "Admin"}</td>
                    <td className="px-6 py-3">
                      {admin.status ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      className="px-6 py-3 flex gap-2 justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton
                        onClick={() => setEditAdmin(admin)}
                        size="small"
                        sx={{ color: "#CD7F32" }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => setDeleteAdmin(admin)}
                        size="small"
                        sx={{ color: "red" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      </div>
    </div>
  );
};

export default ManageAdmins;
