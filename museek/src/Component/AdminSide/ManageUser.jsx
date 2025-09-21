// src/pages/UsersPage.jsx
import React, { useEffect, useState } from "react";
import { Button, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UserDetailsPopup from "./UserDetailsPopup";
import EditUserPopup from "./EditUserPopup";
import ConfirmPopup from "./ConfirmPop-up";
import { Man } from "@mui/icons-material";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="flex h-screen bg-[#181818] text-[#F5F5F5]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <div className="flex h-screen bg-[#181818] text-[#F5F5F5]">
          <div className="flex-1 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Users</h1>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#CD7F32",
                  "&:hover": { backgroundColor: "#b46f2a" },
                  fontWeight: "bold",
                  borderRadius: "0.75rem",
                  padding: "0.6rem 1.2rem",
                }}
              >
                + Add New User
              </Button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users by name, email..."
                className="w-full bg-[#222] text-[#F5F5F5] px-4 py-2 rounded-lg border border-[#CD7F32]/30 focus:outline-none"
              />
            </div>

            {/* User Table */}
            <div className="bg-[#222]/80 rounded-lg border border-[#CD7F32]/30 shadow-lg overflow-auto max-h-[calc(100vh-200px)]">
              <table className="w-full">
                <thead className="bg-[#333]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">#</th>
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
                  {users.map((user, index) => (
                    <tr
                      key={user._id}
                      className="hover:bg-[#CD7F32]/10 transition cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="px-6 py-3">{index + 1}</td>{" "}
                      {/* Serial number */}
                      <td className="px-6 py-3">{user.name}</td>
                      <td className="px-6 py-3">{user.email}</td>
                      <td className="px-6 py-3">{user.role || "User"}</td>
                      <td className="px-6 py-3">
                        {user.status ? (
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
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td
                        className="px-6 py-3 flex gap-2 justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconButton
                          onClick={() => setEditUser(user)}
                          size="small"
                          sx={{ color: "#CD7F32" }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => setDeleteUser(user)}
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
          </div>

          {/* Popups */}
          {selectedUser && (
            <UserDetailsPopup user={selectedUser} setUser={setSelectedUser} />
          )}
          {editUser && <EditUserPopup user={editUser} setUser={setEditUser} />}
          {deleteUser && (
            <ConfirmPopup user={deleteUser} setUser={setDeleteUser} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUser;
