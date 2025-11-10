import React, { useEffect, useState } from 'react';
import usePlaylists from '../../hooks/usePlaylists';

const LeftSidebar = ({ onLikedSongsClick, onPlaylistClick }) => {
  const userId = localStorage.getItem('userId');
  const { playlists, loading, createPlaylist, deletePlaylist } = usePlaylists(userId);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const addPlaylist = async () => {
    const name = newName.trim();
    if (!name || !userId) return;
    
    const result = await createPlaylist({
      name,
      description: newDescription.trim(),
      isPublic: false
    });
    
    if (result.success) {
      setNewName('');
      setNewDescription('');
      setShowCreate(false);
    }
  };

  const removePlaylist = async (playlistId) => {
    const result = await deletePlaylist(playlistId);
    if (result.success) {
      console.log('Playlist deleted successfully');
    }
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-[60px] bottom-16 w-64 lg:w-72 bg-transparent text-[#F5F5F5] z-40">
      {/* Outer card */}
      <div className="m-1.5 w-full h-[calc(100%-12px)] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.45)] bg-[#0e0e0e] p-2">
        {/* Inner card */}
        <div className="w-full h-full rounded-2xl bg-[#181818] overflow-hidden">
          <div className="flex flex-col h-full overflow-y-auto p-4 gap-4 group scrollbar-thin scrollbar-thumb-transparent hover:scrollbar-thumb-[#CD7F32] scrollbar-track-transparent scrollbar-thumb-rounded-full">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm uppercase tracking-wide text-[#F5F5F5]/80">Your Library</h2>
              <button 
                onClick={() => setShowCreate(v => !v)} 
                className="bg-[#CD7F32] text-[#121212] text-sm font-medium px-2 py-1 rounded-md transition-colors hover:bg-[#CD7F32]/90"
              >
                + New
              </button>
            </div>

            {showCreate && (
              <div className="bg-[#1f1f1f] rounded-lg p-4 border border-[#CD7F32]/30">
                <h3 className="text-sm font-medium text-[#F5F5F5] mb-3">Create New Playlist</h3>
                <div className="space-y-3">
                  <input
                    className="w-full bg-[#242424] border border-[#CD7F32]/40 rounded-md px-3 py-2 outline-none text-sm placeholder-[#8ea5a8] focus:border-[#CD7F32]/60 transition-colors"
                    placeholder="Playlist name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && addPlaylist()}
                    autoFocus
                  />
                  <textarea
                    className="w-full bg-[#242424] border border-[#CD7F32]/40 rounded-md px-3 py-2 outline-none text-sm placeholder-[#8ea5a8] focus:border-[#CD7F32]/60 transition-colors resize-none"
                    placeholder="Description (optional)"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={addPlaylist} 
                      className="px-4 py-2 text-sm bg-[#CD7F32] text-[#121212] rounded-md hover:bg-[#CD7F32]/90 transition-colors font-medium disabled:opacity-60"
                      disabled={!newName.trim() || loading}
                    >
                      {loading ? 'Creating...' : 'Create'}
                    </button>
                    <button 
                      onClick={() => {setShowCreate(false); setNewName(''); setNewDescription('');}} 
                      className="px-4 py-2 text-sm bg-transparent border border-[#CD7F32]/40 text-[#F5F5F5] rounded-md hover:bg-[#CD7F32]/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <nav className="space-y-1">
              <a href="/" className="block px-3 py-2 rounded-md hover:bg-[#242424] text-sm transition-colors">Home</a>
            </nav>

            <div className="border-t border-white/5 pt-3">
              <div className="px-3 pb-2 text-xs uppercase tracking-wide text-[#8ea5a8]">Your Playlists</div>
              <ul className="space-y-1">
                <li key="liked">
                  <div 
                    className="px-3 py-2 rounded-md hover:bg-[#242424] text-sm cursor-pointer transition-colors flex items-center gap-2"
                    onClick={onLikedSongsClick}
                  >
                    <span className="text-[#CD7F32]">❤️</span>
                    Liked Songs
                  </div>
                </li>
                {loading ? (
                  <li className="px-3 py-2 text-xs text-[#8ea5a8]">Loading playlists...</li>
                ) : playlists.length > 0 ? (
                  playlists.map((playlist) => (
                    <li key={playlist._id} className="group">
                      <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#242424] transition-colors">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => onPlaylistClick && onPlaylistClick(playlist)}
                        >
                          <div className="text-sm truncate">{playlist.name}</div>
                          <div className="text-xs text-[#8ea5a8]">{playlist.songCount} songs</div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removePlaylist(playlist._id);
                          }} 
                          className="opacity-0 group-hover:opacity-100 text-xs text-[#8ea5a8] hover:text-[#F5F5F5] transition-opacity ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-xs text-[#8ea5a8]">
                    {userId ? 'No playlists yet. Click New to create one.' : 'Please log in to see your playlists.'}
                  </li>
                )}
              </ul>
            </div>

            <div className="mt-auto">
              <div className="bg-[#1f1f1f] rounded-lg p-3 text-xs text-[#8ea5a8] border border-[#CD7F32]/20">
                {userId ? 'Tip: Your playlists are synced to your account.' : 'Tip: Log in to create and sync playlists.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;