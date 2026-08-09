import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { 
  TrendingUp, 
  Users, 
  Music, 
  BarChart3, 
  PieChart, 
  Activity,
  Calendar,
  PlayCircle,
  UserCheck,
  Clock,
  HardDrive,
  Zap
} from 'lucide-react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/analytics/overview');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      console.log('📊 Analytics data received:', data);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#F5F5F5'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#F5F5F5'
        },
        grid: {
          color: '#444'
        }
      },
      y: {
        ticks: {
          color: '#F5F5F5'
        },
        grid: {
          color: '#444'
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#F5F5F5',
          padding: 20
        }
      }
    }
  };

  // Prepare chart data
  const getUserStatusData = () => {
    if (!analyticsData) return null;
    return {
      labels: ['Active Users', 'Inactive Users'],
      datasets: [
        {
          data: [analyticsData.users.active, analyticsData.users.inactive],
          backgroundColor: ['#22c55e', '#ef4444'],
          borderColor: ['#16a34a', '#dc2626'],
          borderWidth: 2,
        },
      ],
    };
  };

  const getSongStatusData = () => {
    if (!analyticsData) return null;
    return {
      labels: ['Published', 'Draft', 'Error'],
      datasets: [
        {
          data: [
            analyticsData.customSongs.published,
            analyticsData.customSongs.draft,
            analyticsData.customSongs.error
          ],
          backgroundColor: ['#CD7F32', '#f59e0b', '#ef4444'],
          borderColor: ['#b46f2a', '#d97706', '#dc2626'],
          borderWidth: 2,
        },
      ],
    };
  };

  const getPopularSongsData = () => {
    if (!analyticsData || !analyticsData.customSongs.popular || analyticsData.customSongs.popular.length === 0) {
      // Return sample data if no songs exist
      return {
        labels: ['No songs yet'],
        datasets: [
          {
            label: 'Play Count',
            data: [0],
            backgroundColor: '#CD7F32',
            borderColor: '#b46f2a',
            borderWidth: 2,
          },
        ],
      };
    }
    return {
      labels: analyticsData.customSongs.popular.map(song => 
        song.title.length > 15 ? song.title.substring(0, 15) + '...' : song.title
      ),
      datasets: [
        {
          label: 'Play Count',
          data: analyticsData.customSongs.popular.map(song => song.playCount || 0),
          backgroundColor: '#CD7F32',
          borderColor: '#b46f2a',
          borderWidth: 2,
        },
      ],
    };
  };

  const getGenreDistributionData = () => {
    if (!analyticsData || !analyticsData.genres || analyticsData.genres.length === 0) {
      // Return sample data if no genres exist
      return {
        labels: ['No genres yet'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#CD7F32'],
            borderColor: ['#b46f2a'],
            borderWidth: 2,
          },
        ],
      };
    }
    return {
      labels: analyticsData.genres.map(genre => genre._id || 'Unknown'),
      datasets: [
        {
          data: analyticsData.genres.map(genre => genre.count || 0),
          backgroundColor: [
            '#CD7F32', '#22c55e', '#3b82f6', '#f59e0b', 
            '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'
          ],
          borderColor: [
            '#b46f2a', '#16a34a', '#2563eb', '#d97706',
            '#dc2626', '#7c3aed', '#db2777', '#0891b2'
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const getUserTrendsData = () => {
    if (!analyticsData || !analyticsData.users.trends || analyticsData.users.trends.length === 0) {
      // Return sample data if no trends exist
      return {
        labels: ['No data yet'],
        datasets: [
          {
            label: 'New Users',
            data: [0],
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      };
    }
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      labels: analyticsData.users.trends.map(trend => 
        `${monthNames[trend._id.month - 1]} ${trend._id.year}`
      ),
      datasets: [
        {
          label: 'New Users',
          data: analyticsData.users.trends.map(trend => trend.count || 0),
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const getAdminActivityData = () => {
    if (!analyticsData || !analyticsData.admins.songsPerAdmin || analyticsData.admins.songsPerAdmin.length === 0) {
      return {
        labels: ['No admin activity yet'],
        datasets: [
          {
            label: 'Songs Uploaded',
            data: [0],
            backgroundColor: '#8b5cf6',
            borderColor: '#7c3aed',
            borderWidth: 2,
          },
        ],
      };
    }
    
    return {
      labels: analyticsData.admins.songsPerAdmin.map(admin => 
        admin._id ? `Admin ${admin._id.substring(0, 8)}...` : 'Unknown Admin'
      ),
      datasets: [
        {
          label: 'Songs Uploaded',
          data: analyticsData.admins.songsPerAdmin.map(admin => admin.songCount || 0),
          backgroundColor: '#8b5cf6',
          borderColor: '#7c3aed',
          borderWidth: 2,
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#181818] text-[#F5F5F5]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminNavbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CD7F32] mx-auto mb-4"></div>
              <p className="text-lg">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-[#181818] text-[#F5F5F5]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminNavbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-2">Error Loading Analytics</h2>
              <p className="text-gray-400 mb-4">{error}</p>
              <button 
                onClick={fetchAnalyticsData}
                className="bg-[#CD7F32] hover:bg-[#b46f2a] px-6 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#181818] text-[#F5F5F5]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        
        <div className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <BarChart3 className="text-[#CD7F32]" size={32} />
              Analytics Dashboard
            </h1>
            <p className="text-gray-400">Comprehensive insights into your music streaming platform</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-[#222]/80 rounded-lg p-6 border border-[#CD7F32]/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold">{analyticsData?.users?.total || 0}</p>
                </div>
                <Users className="text-[#CD7F32]" size={32} />
              </div>
            </div>

            <div className="bg-[#222]/80 rounded-lg p-6 border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-green-500">{analyticsData?.users?.active || 0}</p>
                </div>
                <UserCheck className="text-green-500" size={32} />
              </div>
            </div>

            <div className="bg-[#222]/80 rounded-lg p-6 border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Custom Songs</p>
                  <p className="text-2xl font-bold text-blue-500">{analyticsData?.customSongs?.total || 0}</p>
                </div>
                <Music className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-[#222]/80 rounded-lg p-6 border border-yellow-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Published Songs</p>
                  <p className="text-2xl font-bold text-yellow-500">{analyticsData?.customSongs?.published || 0}</p>
                </div>
                <PlayCircle className="text-yellow-500" size={32} />
              </div>
            </div>

            {/* NEW: Recent Activity Card */}
            <div className="bg-[#222]/80 rounded-lg p-6 border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">New This Week</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {(analyticsData?.recentActivity?.newSongs || 0) + (analyticsData?.recentActivity?.newUsers || 0)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {analyticsData?.recentActivity?.newSongs || 0} songs, {analyticsData?.recentActivity?.newUsers || 0} users
                  </p>
                </div>
                <Zap className="text-purple-500" size={32} />
              </div>
            </div>

          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Status Pie Chart */}
            <div className="bg-[#222]/80 rounded-lg p-6 border border-[#CD7F32]/30">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <PieChart size={20} />
                User Status Distribution
              </h3>
              <div className="h-64">
                {getUserStatusData() && (
                  <Pie data={getUserStatusData()} options={pieOptions} />
                )}
              </div>
            </div>

            {/* Song Status Pie Chart */}
            <div className="bg-[#222]/80 rounded-lg p-6 border border-[#CD7F32]/30">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <PieChart size={20} />
                Custom Songs Status
              </h3>
              <div className="h-64">
                {getSongStatusData() && (
                  <Pie data={getSongStatusData()} options={pieOptions} />
                )}
              </div>
            </div>
          </div>

          {/* Popular Songs Bar Chart */}
          <div className="bg-[#222]/80 rounded-lg p-6 border border-[#CD7F32]/30 mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Most Popular Custom Songs
            </h3>
            <div className="h-80">
              {getPopularSongsData() && (
                <Bar data={getPopularSongsData()} options={chartOptions} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Genre Distribution */}
            <div className="bg-[#222]/80 rounded-lg p-6 border border-[#CD7F32]/30">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Music size={20} />
                Genre Distribution
              </h3>
              <div className="h-64">
                {getGenreDistributionData() && (
                  <Pie data={getGenreDistributionData()} options={pieOptions} />
                )}
              </div>
            </div>

            {/* User Registration Trends */}
            <div className="bg-[#222]/80 rounded-lg p-6 border border-[#CD7F32]/30">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} />
                User Registration Trends
              </h3>
              <div className="h-64">
                {getUserTrendsData() && (
                  <Line data={getUserTrendsData()} options={chartOptions} />
                )}
              </div>
            </div>
          </div>

          {/* NEW: Admin Activity Chart */}
          <div className="bg-[#222]/80 rounded-lg p-6 border border-[#CD7F32]/30 mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity size={20} />
              Admin Activity - Songs Uploaded
            </h3>
            <div className="h-80">
              {getAdminActivityData() && (
                <Bar data={getAdminActivityData()} options={chartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
