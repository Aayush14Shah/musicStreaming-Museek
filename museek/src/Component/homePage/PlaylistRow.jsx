import React from 'react';

const PlaylistCard = ({ title, description, image }) => (
  <div className="bg-[#1C2B2D] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-transform transform hover:scale-105">
    <img src={image} alt={title} className="w-full h-40 object-cover" />
    <div className="p-3 text-[#F5F5F5]">
      <h4 className="text-base font-semibold truncate">{title}</h4>
      <p className="text-xs text-[#CD7F32] mt-1 line-clamp-2">{description}</p>
    </div>
  </div>
);

const PlaylistRow = ({ title, items }) => {
  const filteredItems = (items || []).filter(item => item !== null);

  return (
    <div className="w-full py-6 bg-[#121212]">
      <h2 className="text-2xl font-bold text-[#F5F5F5] mb-4 px-4">{title}</h2>
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 px-4">
          {filteredItems.map((item, index) => (
            <PlaylistCard
              key={item.id || index}
              title={item.name || 'Unknown'}
              description={item.description || item.artists?.map(a => a.name).join(', ') || 'No description'}
              image={item.images?.[0]?.url || 'https://placehold.co/300x300?text=Playlist'}
            />
          ))}
        </div>
      ) : (
        <p className="text-[#F5F5F5] px-4">No {title.toLowerCase()} available</p>
      )}
    </div>
  );
};

export default PlaylistRow;