import React from 'react';

const GenreCard = ({ genre, idx, onClick }) => {
  // subtle base backgrounds to keep your brand palette
  const bases = [
    'from-[var(--bg-tertiary)] to-[var(--bg-secondary)]',
    'from-[var(--bg-tertiary)] to-[var(--bg-primary)]',
    'from-[var(--bg-tertiary)] to-[var(--bg-secondary)]',
    'from-[var(--bg-tertiary)] to-[var(--bg-secondary)]',
  ];
  const base = bases[idx % bases.length];
  const icon = genre?.icons?.[0]?.url;

  return (
    <button
      type="button"
      aria-label={genre?.name || 'Genre'}
      onClick={() => onClick?.(genre)} 
      className="group relative overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl"
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
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <h3 className="text-[var(--text-primary)] font-semibold text-xs sm:text-sm line-clamp-2 drop-shadow leading-tight">
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
    <section className="w-full py-8 md:py-12">
      <h2 className="px-1 md:px-0 text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-6">
        Explore Genres
      </h2>

      {filtered.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
          {filtered.map((genre, i) => (
            <GenreCard key={genre.id || i} genre={genre} idx={i} onClick={onSelect} />
          ))}
        </div>
      ) : (
        <p className="text-[var(--text-secondary)]">No genres available</p>
      )}
    </section>
  );
};

export default Genres;
