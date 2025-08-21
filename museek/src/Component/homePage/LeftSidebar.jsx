import React, { useEffect, useState } from 'react';

const LeftSidebar = () => {
  const [playlists, setPlaylists] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('museek.playlists') || '[]');
      setPlaylists(Array.isArray(stored) ? stored : []);
    } catch {
      setPlaylists([]);
    }
  }, []);

  const persistPlaylists = (next) => {
    setPlaylists(next);
    try {
      localStorage.setItem('museek.playlists', JSON.stringify(next));
    } catch {}
  };

  const addPlaylist = () => {
    const name = newName.trim();
    if (!name) return;
    const next = [
      ...playlists,
      { id: Date.now().toString(), name }
    ];
    persistPlaylists(next);
    setNewName('');
    setShowCreate(false);
  };

  const removePlaylist = (id) => {
    const next = playlists.filter(p => p.id !== id);
    persistPlaylists(next);
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-[60px] bottom-16 w-64 lg:w-72 bg-transparent text-[#F5F5F5] z-40">
      {/* Outer card */}
      <div className="m-1.5 w-full h-[calc(100%-12px)] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.45)] bg-[#0e0e0e] p-2">
        {/* Inner card */}
        <div className="w-full h-full rounded-2xl bg-[#181818] overflow-hidden">
          <div className="flex flex-col h-full overflow-y-auto p-4 gap-4 group scrollbar-thin scrollbar-thumb-transparent hover:scrollbar-thumb-[#1C2B2D] scrollbar-track-transparent scrollbar-thumb-rounded-full">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm uppercase tracking-wide text-[#F5F5F5]/80">Your Library</h2>
              <button 
                onClick={() => setShowCreate(v => !v)} 
                className="bg-[#1C2B2D] text-[#F5F5F5] text-sm font-medium px-2 py-1 rounded-md transition-colors hover:bg-[#1C2B2D]/80"
              >
                + New
              </button>
            </div>

            {showCreate && (
              <div className="bg-[#1f1f1f] rounded-lg p-4 border border-[#1C2B2D]/30">
                <h3 className="text-sm font-medium text-[#F5F5F5] mb-3">Create New Playlist</h3>
                <div className="space-y-3">
                  <input
                    className="w-full bg-[#242424] border border-[#1C2B2D]/40 rounded-md px-3 py-2 outline-none text-sm placeholder-[#8ea5a8] focus:border-[#1C2B2D]/70 transition-colors"
                    placeholder="Playlist name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addPlaylist()}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={addPlaylist} 
                      className="px-4 py-2 text-sm bg-[#1C2B2D] text-[#F5F5F5] rounded-md hover:bg-[#1C2B2D]/80 transition-colors font-medium disabled:opacity-60"
                      disabled={!newName.trim()}
                    >
                      Create
                    </button>
                    <button 
                      onClick={() => {setShowCreate(false); setNewName('');}} 
                      className="px-4 py-2 text-sm bg-transparent border border-[#1C2B2D]/40 text-[#F5F5F5] rounded-md hover:bg-[#1C2B2D]/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <nav className="space-y-1">
              <a href="/" className="block px-3 py-2 rounded-md hover:bg-[#242424] text-sm transition-colors">Home</a>
              <a href="#" className="block px-3 py-2 rounded-md hover:bg-[#242424] text-sm transition-colors">Search</a>
            </nav>

            <div className="border-t border-white/5 pt-3">
              <div className="px-3 pb-2 text-xs uppercase tracking-wide text-[#8ea5a8]">Your Playlists</div>
              <ul className="space-y-1">
                <li key="liked">
                  <div className="px-3 py-2 rounded-md hover:bg-[#242424] text-sm cursor-pointer transition-colors">Liked Songs</div>
                </li>
                {playlists.map((p) => (
                  <li key={p.id} className="group">
                    <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#242424] transition-colors">
                      <span className="text-sm truncate">{p.name}</span>
                      <button onClick={() => removePlaylist(p.id)} className="opacity-0 group-hover:opacity-100 text-xs text-[#8ea5a8] hover:text-[#F5F5F5] transition-opacity">Remove</button>
                    </div>
                  </li>
                ))}
                {playlists.length === 0 && (
                  <li className="px-3 py-2 text-xs text-[#8ea5a8]">No playlists yet. Click New to create one.</li>
                )}
              </ul>
            </div>

            <div className="mt-auto">
              <div className="bg-[#1f1f1f] rounded-lg p-3 text-xs text-[#8ea5a8] border border-[#1C2B2D]/20">
                Tip: Playlists are saved locally on this device.
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;