import React from 'react';

const NowPlayingSidebar = ({ currentTrack, onClose, isOpen, playlistName = "Liked Songs" }) => {
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

  return (
    <div
      className={`fixed top-[60px] bottom-16 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 bg-[#1C2B2D] text-[#F5F5F5] overflow-y-auto p-4 z-50 transition-all duration-300 ease-in-out ${
        isOpen ? 'right-0' : '-right-full'
      }`}
      style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{playlistName}</h2>
        <button onClick={onClose} className="text-[#CD7F32] hover:text-[#F5F5F5]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {/* Main Content Card */}
        <div className="bg-[#162224] rounded-lg p-4 shadow-md">
          <img src={currentTrack.image} alt={currentTrack.title} className="w-full h-48 object-cover rounded-lg mb-4" />
          <h2 className="text-2xl font-bold mb-2">{currentTrack.title}</h2>
          <p className="text-[#CD7F32] mb-4">{currentTrack.artist}</p>
        </div>
        {/* Artist Info Card */}
        <div className="bg-[#162224] rounded-lg p-4 shadow-md">
          <h3 className="text-xl font-semibold mb-2">About the artist</h3>
          <p className="text-sm mb-4">{artistInfo.description}</p>
        </div>
        {/* Credits Card */}
        <div className="bg-[#162224] rounded-lg p-4 shadow-md">
          <h3 className="text-xl font-semibold mb-2">Credits</h3>
          <ul className="list-disc pl-5 mb-4">
            {artistInfo.credits.map((credit, index) => (
              <li key={index} className="text-sm">{credit.role}: {credit.name}</li>
            ))}
          </ul>
        </div>
        {/* Queue Card */}
        <div className="bg-[#162224] rounded-lg p-4 shadow-md">
          <h3 className="text-xl font-semibold mb-2">Next in queue</h3>
          <div className="bg-[#111A1B] p-2 rounded-lg">
            <p className="text-sm font-bold">{artistInfo.queue.title}</p>
            <p className="text-xs text-[#CD7F32]">{artistInfo.queue.artist}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingSidebar;