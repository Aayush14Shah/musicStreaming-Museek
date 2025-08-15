import React from 'react';

const PlaylistCard = ({ title, description, image }) => (
  <div className="w-48 h-48 mr-4 bg-[#1C2B2D] rounded-lg overflow-hidden shadow-lg">
    <img src={image} alt={title} className="w-full h-32 object-cover" />
    <div className="p-2 text-[#F5F5F5]">
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="text-xs text-[#CD7F32]">{description}</p>
    </div>
  </div>
);

const PlaylistRow = ({ title, playlists }) => {
  // Static data for now, to be replaced with API data later
  const dummyPlaylists = [
    { title: "Recently Played", description: "Your latest listens", image: "https://via.placeholder.com/150?text=Playlist+1" },
    { title: "Made for You", description: "Personalized picks", image: "https://via.placeholder.com/150?text=Playlist+2" },
    { title: "Popular Playlists", description: "Trending now", image: "https://via.placeholder.com/150?text=Playlist+3" },
  ];

  return (
    <div className="w-full py-6 bg-[#121212]">
      <h2 className="text-2xl font-bold text-[#F5F5F5] mb-4 px-4">{title}</h2>
      <div className="flex overflow-x-auto space-x-4 px-4 pb-4 scrollbar-hide w-full">
        {dummyPlaylists.map((playlist, index) => (
          <PlaylistCard key={index} {...playlist} />
        ))}
      </div>
    </div>
  );
};

export default PlaylistRow;