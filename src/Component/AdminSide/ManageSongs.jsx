import React, { useState, useEffect } from "react";
import { Button, IconButton, Chip, CircularProgress } from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Edit as EditIcon,
  Add as AddIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

const ManageSongs = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [songsData, setSongsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    genre: ''
  });
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  // Fetch songs from API - always shows both active and inactive
  const fetchSongs = async (page = 1, search = '', status = '', genre = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(status && { status }),
        ...(genre && { genre })
      });

      const response = await fetch(`http://localhost:5000/api/custom-songs?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }

      const data = await response.json();
      setSongsData(data.songs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching songs:', error);
      alert('Error fetching songs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load songs on component mount
  useEffect(() => {
    fetchSongs();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchSongs(1, query, filters.status, filters.genre);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Handle toggle song active status - show custom popup
  const handleToggleStatus = (songId, songTitle, currentStatus) => {
    setSelectedSong({ id: songId, title: songTitle, status: currentStatus });
    setShowConfirmPopup(true);
  };

  // Confirm toggle action
  const confirmToggleStatus = async () => {
    if (!selectedSong) return;

    try {
      const response = await fetch(`http://localhost:5000/api/custom-songs/${selectedSong.id}/toggle-status`, {
        method: 'PATCH'
      });

      if (!response.ok) {
        throw new Error('Failed to toggle song status');
      }

      const result = await response.json();
      // Refresh the songs list
      fetchSongs(pagination.page, searchQuery, filters.status, filters.genre);
      setShowConfirmPopup(false);
      setSelectedSong(null);
    } catch (error) {
      console.error('Error toggling song status:', error);
      alert('Error toggling song status: ' + error.message);
    }
  };

  // Cancel toggle action
  const cancelToggleStatus = () => {
    setShowConfirmPopup(false);
    setSelectedSong(null);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    fetchSongs(newPage, searchQuery, filters.status, filters.genre);
  };

  // Get status color for is_active
  const getActiveStatusColor = (isActive) => {
    return isActive === 1 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Published":
        return "success";
      case "Draft":
        return "warning";
      case "Error":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "Published":
        return "bg-green-500/20 text-green-400";
      case "Draft":
        return "bg-yellow-500/20 text-yellow-400";
      case "Error":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const handleAddNewSong = () => {
    navigate("/admin/songs/add");
  };

  // Get action details for popup
  const getActionDetails = () => {
    if (!selectedSong) return { action: '', color: '', bgColor: '' };
    const action = selectedSong.status === 1 ? 'deactivate' : 'activate';
    const color = selectedSong.status === 1 ? '#ef4444' : '#22c55e';
    const bgColor = selectedSong.status === 1 ? 'bg-red-500/20' : 'bg-green-500/20';
    return { action, color, bgColor };
  };

  return (
    <div className="flex h-screen bg-[#181818] text-[#F5F5F5] relative">
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
                  <h2 className="text-3xl font-bold">Manage Songs</h2>
                </div>
                <Button
                  onClick={handleAddNewSong}
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    backgroundColor: "#CD7F32",
                    "&:hover": { backgroundColor: "#b46f2a" },
                    fontWeight: "bold",
                    borderRadius: "0.5rem",
                    padding: "0.75rem 1.5rem",
                    textTransform: "none",
                  }}
                >
                  Add New Song
                </Button>
              </div>

              {/* Search and Filter Bar */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#F5F5F5]/50" />
                  <input
                    type="text"
                    placeholder="Search songs, artists, albums..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full bg-[#2a2a2a] border border-[#CD7F32]/20 rounded-lg pl-10 pr-4 py-3 text-[#F5F5F5] placeholder-[#F5F5F5]/70 focus:outline-none focus:border-[#CD7F32] focus:ring-1 focus:ring-[#CD7F32]"
                  />
                </div>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  sx={{
                    borderColor: "#CD7F32",
                    color: "#F5F5F5",
                    "&:hover": { 
                      borderColor: "#b46f2a",
                      backgroundColor: "#CD7F32/10"
                    },
                    textTransform: "none",
                    padding: "0.75rem 1.5rem",
                  }}
                >
                  Filter
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SortIcon />}
                  sx={{
                    borderColor: "#CD7F32",
                    color: "#F5F5F5",
                    "&:hover": { 
                      borderColor: "#b46f2a",
                      backgroundColor: "#CD7F32/10"
                    },
                    textTransform: "none",
                    padding: "0.75rem 1.5rem",
                  }}
                >
                  Sort
                </Button>
              </div>

              {/* Songs Table */}
              <div className="bg-[#181818] border border-[#CD7F32]/20 rounded-lg overflow-hidden shadow-lg">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <CircularProgress sx={{ color: '#CD7F32' }} />
                    <span className="ml-3 text-[#F5F5F5]/70">Loading songs...</span>
                  </div>
                ) : songsData.length === 0 ? (
                  <div className="flex justify-center items-center py-12">
                    <span className="text-[#F5F5F5]/70">No songs found. Upload your first song!</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#CD7F32]/5">
                        <tr>
                          <th className="px-6 py-4 text-sm font-medium text-[#F5F5F5]/70 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-6 py-4 text-sm font-medium text-[#F5F5F5]/70 uppercase tracking-wider">
                            Artist
                          </th>
                          <th className="px-6 py-4 text-sm font-medium text-[#F5F5F5]/70 uppercase tracking-wider">
                            Album
                          </th>
                          <th className="px-6 py-4 text-sm font-medium text-[#F5F5F5]/70 uppercase tracking-wider">
                            Genre
                          </th>
                          <th className="px-6 py-4 text-sm font-medium text-[#F5F5F5]/70 uppercase tracking-wider">
                            Release Date
                          </th>
                          <th className="px-6 py-4 text-sm font-medium text-[#F5F5F5]/70 uppercase tracking-wider">
                            API Status
                          </th>
                          <th className="px-6 py-4 text-sm font-medium text-[#F5F5F5]/70 uppercase tracking-wider">
                            Active Status
                          </th>
                          <th className="px-6 py-4 text-sm font-medium text-[#F5F5F5]/70 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#CD7F32]/10">
                        {songsData.map((song) => (
                          <tr key={song._id} className={`hover:bg-[#CD7F32]/5 ${song.is_active === 0 ? 'opacity-60' : ''}`}>
                            <td className="px-6 py-4 whitespace-nowrap font-medium">
                              {song.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[#F5F5F5]/70">
                              {song.artist}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[#F5F5F5]/70">
                              {song.album || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[#F5F5F5]/70">
                              {song.genre}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[#F5F5F5]/70">
                              {song.releaseDate ? new Date(song.releaseDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBgColor(song.apiStatus)}`}>
                                {song.apiStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActiveStatusColor(song.is_active)}`}>
                                {song.is_active === 1 ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex gap-2">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/admin/songs/edit/${song._id}`)}
                                  sx={{ 
                                    color: "#CD7F32",
                                    "&:hover": { backgroundColor: "#CD7F32/10" }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                
                                {/* Toggle Active/Inactive Button */}
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleStatus(song._id, song.title, song.is_active)}
                                  sx={{ 
                                    color: song.is_active === 1 ? "#ef4444" : "#22c55e",
                                    "&:hover": { 
                                      backgroundColor: song.is_active === 1 ? "#ef4444/10" : "#22c55e/10" 
                                    }
                                  }}
                                  title={song.is_active === 1 ? 'Deactivate Song' : 'Activate Song'}
                                >
                                  {song.is_active === 1 ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
                                </IconButton>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {!loading && songsData.length > 0 && (
                  <div className="px-6 py-4 border-t border-[#CD7F32]/10 flex items-center justify-between">
                    <div className="text-sm text-[#F5F5F5]/70">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={pagination.page <= 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                        sx={{
                          borderColor: "#CD7F32/30",
                          color: "#F5F5F5/70",
                          "&:hover": { 
                            borderColor: "#CD7F32",
                            backgroundColor: "#CD7F32/10"
                          },
                          "&:disabled": {
                            borderColor: "#CD7F32/10",
                            color: "#F5F5F5/30"
                          },
                          textTransform: "none",
                        }}
                      >
                        Previous
                      </Button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                        const pageNum = i + 1;
                        const isActive = pageNum === pagination.page;
                        return (
                          <Button
                            key={pageNum}
                            variant={isActive ? "contained" : "outlined"}
                            size="small"
                            onClick={() => handlePageChange(pageNum)}
                            sx={{
                              backgroundColor: isActive ? "#CD7F32" : "transparent",
                              borderColor: "#CD7F32/30",
                              color: isActive ? "#F5F5F5" : "#F5F5F5/70",
                              "&:hover": { 
                                borderColor: "#CD7F32",
                                backgroundColor: isActive ? "#b46f2a" : "#CD7F32/10"
                              },
                              minWidth: "40px",
                            }}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={pagination.page >= pagination.pages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                        sx={{
                          borderColor: "#CD7F32/30",
                          color: "#F5F5F5/70",
                          "&:hover": { 
                            borderColor: "#CD7F32",
                            backgroundColor: "#CD7F32/10"
                          },
                          "&:disabled": {
                            borderColor: "#CD7F32/10",
                            color: "#F5F5F5/30"
                          },
                          textTransform: "none",
                        }}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Custom Confirmation Popup */}
      {showConfirmPopup && selectedSong && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          {/* Blurred background overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={cancelToggleStatus}
          ></div>

          {/* Popup box */}
          <div className="relative bg-[#282828]/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-[#CD7F32]/30">
            
            {/* Action Icon */}
            <div className="flex justify-center mb-4">
              <div className={`p-3 rounded-full ${getActionDetails().bgColor}`}>
                {selectedSong.status === 1 ? (
                  <ToggleOffIcon sx={{ fontSize: 40, color: getActionDetails().color }} />
                ) : (
                  <ToggleOnIcon sx={{ fontSize: 40, color: getActionDetails().color }} />
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-[#F5F5F5] mb-2 text-center capitalize">
              {getActionDetails().action} Song
            </h1>

            {/* Message */}
            <p className="text-[#F5F5F5]/70 text-center mb-6 leading-relaxed">
              Are you sure you want to <span className="font-semibold text-[#F5F5F5]">{getActionDetails().action}</span> the song{' '}
              <span className="font-semibold text-[#CD7F32]">"{selectedSong.title}"</span>?
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={cancelToggleStatus}
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
                onClick={confirmToggleStatus}
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: getActionDetails().color,
                  "&:hover": { 
                    backgroundColor: selectedSong.status === 1 ? "#dc2626" : "#16a34a"
                  },
                  fontWeight: "bold",
                  borderRadius: "0.75rem",
                  padding: "0.75rem",
                  textTransform: "none",
                }}
              >
                {getActionDetails().action === 'activate' ? 'Activate' : 'Deactivate'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSongs;
