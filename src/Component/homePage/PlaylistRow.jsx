import React from 'react';

const PlaylistCard = ({ title, description, image }) => (
  <div className="bg-[var(--bg-tertiary)] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-transform hover:-translate-y-1">
    <div className="w-full aspect-square overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover" />
    </div>
    <div className="p-3 text-[var(--text-primary)]">
      <h4 className="text-base font-semibold truncate text-[var(--text-primary)]">{title}</h4>
      <p className="text-xs text-[var(--accent-primary)] mt-1 line-clamp-2">{description}</p>
    </div>
  </div>
);

const PlaylistRow = ({ title, items }) => {
  const filteredItems = (items || []).filter(item => item !== null);

  return (
    <div className="w-full py-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 px-1 md:px-0">{title}</h2>
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
        <p className="text-[var(--text-primary)]">No {title.toLowerCase()} available</p>
      )}
    </div>
  );
};

export default PlaylistRow;