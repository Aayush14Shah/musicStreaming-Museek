import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Upload, 
  Database, 
  Shield, 
  Palette,
  Music,
  Users,
  Mail,
  Eye,
  Clock
} from 'lucide-react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

const Settings = () => {
  const [settings, setSettings] = useState({
    // App Settings
    maxFileSize: 50, // MB
    allowedFormats: ['MP3', 'WAV', 'FLAC'],
    
    // User Settings
    allowRegistration: true,
    maxPlaylistsPerUser: 50,
    
    // Security Settings
    sessionTimeout: 24, // hours
    enableAuditLogs: true
  });

  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.log('Using default settings');
    }
  };

  const loadAuditLogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/audit-logs?limit=20');
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.logs);
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  };


  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFormatToggle = (format) => {
    const currentFormats = settings.allowedFormats;
    if (currentFormats.includes(format)) {
      // Don't allow removing the last format
      if (currentFormats.length > 1) {
        handleInputChange('allowedFormats', currentFormats.filter(f => f !== format));
      }
    } else {
      handleInputChange('allowedFormats', [...currentFormats, format]);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const renderGeneralSettings = () => {
    const availableFormats = ['MP3', 'WAV', 'FLAC', 'M4A', 'OGG', 'AAC'];
    
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max File Size (MB)
          </label>
          <input
            type="number"
            value={settings.maxFileSize}
            onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value))}
            className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-[#CD7F32]/20 focus:outline-none focus:border-[#CD7F32]"
            min="1"
            max="100"
          />
          <p className="text-xs text-gray-500 mt-1">Maximum size for audio file uploads</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Allowed Audio Formats
          </label>
          <div className="grid grid-cols-3 gap-3">
            {availableFormats.map((format) => {
              const isChecked = settings.allowedFormats.includes(format);
              const isLastFormat = settings.allowedFormats.length === 1 && isChecked;
              
              return (
                <label 
                  key={format} 
                  className={`flex items-center space-x-2 ${isLastFormat ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleFormatToggle(format)}
                    disabled={isLastFormat}
                    className="w-4 h-4 text-[#CD7F32] bg-[#2a2a2a] border-gray-600 rounded focus:ring-[#CD7F32] focus:ring-2 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-300">{format}</span>
                </label>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Selected: {settings.allowedFormats.join(', ') || 'None'}
          </p>
        </div>
      </div>
    );
  };

  const renderUserSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Allow New User Registration
          </label>
          <p className="text-xs text-gray-500">Enable users to create new accounts</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.allowRegistration}
            onChange={(e) => handleInputChange('allowRegistration', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#CD7F32]"></div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Max Playlists Per User
        </label>
        <input
          type="number"
          value={settings.maxPlaylistsPerUser}
          onChange={(e) => handleInputChange('maxPlaylistsPerUser', parseInt(e.target.value) || 0)}
          className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-[#CD7F32]/20 focus:outline-none focus:border-[#CD7F32]"
          min="1"
          max="1000"
        />
        <p className="text-xs text-gray-500 mt-1">Maximum number of playlists each user can create</p>
      </div>
    </div>
  );

  const renderMusicSettings = () => (
    <div className="space-y-6">
      <div className="bg-[#222]/50 rounded-lg p-6 border border-[#CD7F32]/20">
        <h3 className="text-lg font-semibold text-[#CD7F32] mb-4 flex items-center gap-2">
          <Music size={20} />
          Suggested Music Settings
        </h3>
        <div className="space-y-4 text-sm text-gray-300">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-[#CD7F32] rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Auto-Moderation:</strong> Automatically scan uploaded songs for explicit content or copyright issues
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-[#CD7F32] rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Quality Control:</strong> Set minimum audio quality requirements (bitrate, sample rate)
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-[#CD7F32] rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Genre Auto-Detection:</strong> Automatically detect and suggest genres for uploaded songs
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-[#CD7F32] rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Playlist Limits:</strong> Max songs per playlist, auto-cleanup of empty playlists
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-[#CD7F32] rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Recommendation Engine:</strong> Configure how the system suggests music to users
            </div>
          </div>
        </div>
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-400 text-sm">
            💡 <strong>Implementation Priority:</strong> These features can be added based on user needs and feedback.
          </p>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Session Timeout (hours)
        </label>
        <input
          type="number"
          value={settings.sessionTimeout}
          onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value) || 1)}
          className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-[#CD7F32]/20 focus:outline-none focus:border-[#CD7F32]"
          min="1"
          max="168"
        />
        <p className="text-xs text-gray-500 mt-1">How long admin sessions stay active (1-168 hours)</p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Enable Audit Logs
          </label>
          <p className="text-xs text-gray-500">Track admin actions and changes</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enableAuditLogs}
            onChange={(e) => handleInputChange('enableAuditLogs', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#CD7F32]"></div>
        </label>
      </div>

      {settings.enableAuditLogs && (
        <div className="bg-[#222]/50 rounded-lg p-4 border border-[#CD7F32]/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-300 flex items-center gap-2">
              <Eye size={18} />
              Recent Audit Logs
            </h4>
            <button
              onClick={() => {
                setShowAuditLogs(!showAuditLogs);
                if (!showAuditLogs) loadAuditLogs();
              }}
              className="px-3 py-1 bg-[#CD7F32] hover:bg-[#b46f2a] text-white text-sm rounded transition-colors"
            >
              {showAuditLogs ? 'Hide' : 'View Logs'}
            </button>
          </div>
          
          {showAuditLogs && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="bg-[#181818] p-3 rounded border border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#CD7F32] font-medium text-sm">{log.action}</span>
                      <span className="text-gray-500 text-xs flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{log.details}</p>
                    <p className="text-gray-500 text-xs mt-1">Admin: {log.adminId} | IP: {log.ip}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No audit logs available yet
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );


  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'users': return renderUserSettings();
      case 'music': return renderMusicSettings();
      case 'security': return renderSecuritySettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="flex h-screen bg-[#181818] text-[#F5F5F5]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        
        <div className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <SettingsIcon className="text-[#CD7F32]" size={32} />
              Settings
            </h1>
            <p className="text-gray-400">Configure your music streaming platform</p>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Tabs */}
            <div className="w-64 flex-shrink-0">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-[#CD7F32]/20 text-[#CD7F32] border border-[#CD7F32]/30'
                          : 'hover:bg-[#CD7F32]/10 text-gray-300 hover:text-white'
                      }`}
                    >
                      <Icon size={20} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              <div className="bg-[#222]/80 rounded-lg p-6 border border-[#CD7F32]/30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    {tabs.find(tab => tab.id === activeTab)?.label} Settings
                  </h2>
                  
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      saved 
                        ? 'bg-green-600 text-white' 
                        : 'bg-[#CD7F32] hover:bg-[#b46f2a] text-white'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Save size={16} />
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                  </button>
                </div>

                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
