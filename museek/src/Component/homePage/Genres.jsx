import React from 'react';

const GenreCard = ({ genre, idx, onClick }) => {
  // subtle base backgrounds to keep your brand palette
  const bases = [
    'from-[#1C2B2D] to-[#0f1a1b]',
    'from-[#CD7F32] to-[#a96728]',
    'from-[#2a2a2a] to-[#121212]',
    'from-[#1C2B2D] to-[#162224]',
    'from-[#CD7F32] to-[#7e4e1d]',
    'from-[#2a2a2a] to-[#101010]',
  ];
  const base = bases[idx % bases.length];
  const icon = genre?.icons?.[0]?.url;

  return (
    <button
      type="button"
      aria-label={genre?.name || 'Genre'}
      onClick={() => onClick?.(genre)}
      className="group relative overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CD7F32] transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className={`relative w-full aspect-square bg-gradient-to-br ${base}`}>
        {icon && (
          <img
            src={icon}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-semibold text-base sm:text-lg line-clamp-2 drop-shadow">
            {genre?.name || 'Unknown Genre'}
          </h3>
        </div>
      </div>
    </button>
  );
};

const Genres = ({ items = [], onSelect }) => {
  const filtered = items.filter(Boolean);

  return (
    <section className="w-full py-8 md:py-12 bg-[#121212]">
      <h2 className="px-4 md:px-8 text-2xl md:text-3xl font-bold text-[#F5F5F5] mb-6">
        Explore Genres
      </h2>

      {filtered.length ? (
        <div className="px-4 md:px-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
          {filtered.map((genre, i) => (
            <GenreCard key={genre.id || i} genre={genre} idx={i} onClick={onSelect} />
          ))}
        </div>
      ) : (
        <p className="px-4 md:px-8 text-[#F5F5F5]/80">No genres available</p>
      )}
    </section>
  );
};

export default Genres;
