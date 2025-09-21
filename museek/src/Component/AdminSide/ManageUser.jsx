// src/pages/UsersPage.jsx
import React, { useEffect, useState } from "react";
import { Button, IconButton, CircularProgress } from "@mui/material";
import {
  Delete as DeleteIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);


  // Handle delete user (soft delete)
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowConfirmPopup(true);
  };

  // Confirm delete action
  const confirmDeleteUser = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${selectedUser._id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to deactivate user');
      }

      await fetchUsers(); // Refresh users list
      setShowConfirmPopup(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error deactivating user:', err);
      alert('Error deactivating user: ' + err.message);
    }
  };

  // Cancel delete action
  const cancelDelete = () => {
    setShowConfirmPopup(false);
    setSelectedUser(null);
  };

  // Handle user details popup
  const handleUserDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsPopup(true);
  };

  const closeDetailsPopup = () => {
    setShowDetailsPopup(false);
    setSelectedUser(null);
  };

  // Get status color
  const getStatusColor = (isActive) => {
    return isActive === 1 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400";
  };

  return (
    <div className="flex h-screen bg-[#181818] text-[#F5F5F5] relative">
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
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <CircularProgress sx={{ color: '#CD7F32' }} />
                  <span className="ml-3 text-[#F5F5F5]/70">Loading users...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <span className="text-[#F5F5F5]/70">No users found.</span>
                </div>
              ) : (
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
                        className={`hover:bg-[#CD7F32]/10 transition cursor-pointer ${user.is_active === 0 ? 'opacity-60' : ''}`}
                        onClick={() => handleUserDetails(user)}
                      >
                        <td className="px-6 py-3">{index + 1}</td>{" "}
                        {/* Serial number */}
                        <td className="px-6 py-3">{user.name}</td>
                        <td className="px-6 py-3">{user.email}</td>
                        <td className="px-6 py-3">{user.role || "User"}</td>
                        <td className="px-6 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.is_active)}`}>
                            {user.is_active === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td
                          className={`px-6 py-3 flex gap-2 justify-center ${user.is_active === 0 ? 'opacity-60' : ''}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {user.is_active === 1 && (
                            <IconButton
                              onClick={() => handleDeleteUser(user)}
                              size="small"
                              sx={{ color: "red" }}
                              title="Deactivate User"
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>


          {/* Confirm Delete Popup */}
          {showConfirmPopup && selectedUser && (
            <div className="absolute inset-0 flex items-center justify-center z-50">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={cancelDelete}
              ></div>

              <div className="relative bg-[#282828]/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-[#CD7F32]/30">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-red-500/20">
                    <DeleteIcon sx={{ fontSize: 40, color: '#ef4444' }} />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-[#F5F5F5] mb-2 text-center">
                  Deactivate User
                </h1>

                <p className="text-[#F5F5F5]/70 text-center mb-6 leading-relaxed">
                  Are you sure you want to <span className="font-semibold text-[#F5F5F5]">deactivate</span> the user{' '}
                  <span className="font-semibold text-[#CD7F32]">"{selectedUser.name}"</span>?
                  <br />
                  <span className="text-sm text-[#F5F5F5]/50">This will set their status to inactive.</span>
                </p>

                <div className="flex gap-3">
                  <Button
                    onClick={cancelDelete}
                    fullWidth
                    variant="outlined"
                    sx={{
                      borderColor: "#CD7F32/50",
                      color: "#F5F5F5/70",
                      "&:hover": { 
                        borderColor: "#CD7F32",
                        backgroundColor: "#CD7F32/10"
                      },
                      fontWeight: "bold",
                      borderRadius: "0.75rem",
                      padding: "0.75rem",
                      textTransform: "none",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDeleteUser}
                    fullWidth
                    variant="contained"
                    sx={{
                      backgroundColor: "#ef4444",
                      "&:hover": { backgroundColor: "#dc2626" },
                      fontWeight: "bold",
                      borderRadius: "0.75rem",
                      padding: "0.75rem",
                      textTransform: "none",
                    }}
                  >
                    Deactivate
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* User Details Popup */}
          {showDetailsPopup && selectedUser && (
            <div className="absolute inset-0 flex items-center justify-center z-50">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={closeDetailsPopup}
              ></div>

              <div className="relative bg-[#282828]/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-[#CD7F32]/30">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-[#CD7F32]/20">
                    <PersonIcon sx={{ fontSize: 40, color: '#CD7F32' }} />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-[#F5F5F5] mb-6 text-center">
                  User Details
                </h1>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-[#CD7F32]/20">
                    <span className="text-[#F5F5F5]/70">Name:</span>
                    <span className="text-[#F5F5F5] font-medium">{selectedUser.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-[#CD7F32]/20">
                    <span className="text-[#F5F5F5]/70">Email:</span>
                    <span className="text-[#F5F5F5] font-medium">{selectedUser.email}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-[#CD7F32]/20">
                    <span className="text-[#F5F5F5]/70">Mobile:</span>
                    <span className="text-[#F5F5F5] font-medium">{selectedUser.mobile || 'Not provided'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-[#CD7F32]/20">
                    <span className="text-[#F5F5F5]/70">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.is_active)}`}>
                      {selectedUser.is_active === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-[#CD7F32]/20">
                    <span className="text-[#F5F5F5]/70">Joined:</span>
                    <span className="text-[#F5F5F5] font-medium">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {selectedUser.favoriteArtists && selectedUser.favoriteArtists.length > 0 && (
                    <div className="py-2 border-b border-[#CD7F32]/20">
                      <span className="text-[#F5F5F5]/70 block mb-2">Favorite Artists:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.favoriteArtists.map((artist, index) => (
                          <span key={index} className="px-2 py-1 bg-[#CD7F32]/20 text-[#CD7F32] rounded text-xs">
                            {artist}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedUser.languages && selectedUser.languages.length > 0 && (
                    <div className="py-2">
                      <span className="text-[#F5F5F5]/70 block mb-2">Languages:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.languages.map((language, index) => (
                          <span key={index} className="px-2 py-1 bg-[#CD7F32]/20 text-[#CD7F32] rounded text-xs">
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center mt-6">
                  <Button
                    onClick={closeDetailsPopup}
                    variant="contained"
                    sx={{
                      backgroundColor: "#CD7F32",
                      "&:hover": { backgroundColor: "#b46f2a" },
                      fontWeight: "bold",
                      borderRadius: "0.75rem",
                      padding: "0.75rem 2rem",
                      textTransform: "none",
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUser;
