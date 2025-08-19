import React, { useState } from 'react';

const NowPlayingSidebar = ({ currentTrack, onClose, isOpen, playlistName = "Liked Songs" }) => {
  const [isLiked, setIsLiked] = useState(true); // Default to liked for demo
  
  const artistInfo = {
    name: "Shankar-Ehsaan-Loy",
    description: "25,179,504 monthly listeners. Following the popular practice in Bollywood music where individuals with varied musical backgrounds collaborate together, Shankar Ehsaan Loy are the first trio music composers.",
    credits: [
      { role: "Main Artist", name: "Shankar-Ehsaan-Loy" },
      { role: "Main Artist", name: "Shankar Mahadevan" },
      { role: "Main Artist", name: "Caralisa Monteiro" },
    ],
    queue: {
      title: "Dil Mein Ho Tum (From 'Cheat India')",
      artist: "Armaan Malik, Rochak Kohli, Bappi Lahiri",
    },
  };

  const toggleLike = () => setIsLiked(!isLiked);
  const shareSong = () => console.log('Share song');
  const addToPlaylist = () => console.log('Add to playlist');

  return (
    <div
      className={`fixed top-[60px] bottom-16 right-0 bg-transparent text-[#F5F5F5] z-40 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ width: '20rem' }}
    >
      {/* Outer card */}
      <div className="m-1.5 w-full h-[calc(100%-12px)] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.45)] bg-[#0e0e0e] p-2">
        {/* Inner card */}
        <div className="w-full h-full rounded-2xl bg-[#181818] overflow-y-auto p-4 group scrollbar-thin scrollbar-thumb-transparent hover:scrollbar-thumb-[#1C2B2D] scrollbar-track-transparent scrollbar-thumb-rounded-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{playlistName}</h2>
            <button onClick={onClose} className="bg-[#1C2B2D] text-[#F5F5F5] px-2 py-1 rounded-md hover:bg-[#1C2B2D]/80 transition-colors" aria-label="Close now playing">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {/* Main Content Card */}
            <div className="bg-[#1f1f1f] rounded-lg p-4 shadow-md">
              <img src={currentTrack.image} alt={currentTrack.title} className="w-full h-48 object-cover rounded-lg mb-4" />
              <h2 className="text-2xl font-bold mb-2">{currentTrack.title}</h2>
              <p className="text-[#CD7F32] mb-2">{currentTrack.artist}</p>
              
              {/* Song Actions */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleLike}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isLiked ? 'bg-[#1C2B2D] text-[#F5F5F5]' : 'bg-[#242424] text-[#F5F5F5] hover:bg-[#1C2B2D]'}`}
                  title={isLiked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
                >
                  {isLiked ? 'In Liked' : 'Like'}
                </button>
                
                <button 
                  onClick={shareSong}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#242424] text-[#F5F5F5] hover:bg-[#1C2B2D] transition-colors"
                  title="Share"
                >
                  Share
                </button>
                
                <button 
                  onClick={addToPlaylist}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#242424] text-[#F5F5F5] hover:bg-[#1C2B2D] transition-colors"
                  title="Add to Playlist"
                >
                  Add
                </button>
              </div>
            </div>
            
            {/* Artist Info Card */}
            <div className="bg-[#1f1f1f] rounded-lg p-4 shadow-md">
              <h3 className="text-xl font-semibold mb-2">About the artist</h3>
              <p className="text-sm mb-4">{artistInfo.description}</p>
            </div>
            {/* Credits Card */}
            <div className="bg-[#1f1f1f] rounded-lg p-4 shadow-md">
              <h3 className="text-xl font-semibold mb-2">Credits</h3>
              <ul className="list-disc pl-5 mb-4">
                {artistInfo.credits.map((credit, index) => (
                  <li key={index} className="text-sm">{credit.role}: {credit.name}</li>
                ))}
              </ul>
            </div>
            {/* Queue Card */}
            <div className="bg-[#1f1f1f] rounded-lg p-4 shadow-md">
              <h3 className="text-xl font-semibold mb-2">Next in queue</h3>
              <div className="bg-[#171717] p-2 rounded-lg">
                <p className="text-sm font-bold">{artistInfo.queue.title}</p>
                <p className="text-xs text-[#CD7F32]">{artistInfo.queue.artist}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingSidebar;