import React from 'react';

const Genres = () => {
  // Static data for now, to be replaced with API data later
  const genres = [
    { name: "Rock", color: "bg-[#CD7F32]" },
    { name: "Pop", color: "bg-[#1C2B2D]" },
    { name: "Jazz", color: "bg-[#F5F5F5]" },
    { name: "Chill", color: "bg-[#CD7F32]/70" },
    { name: "Hip-Hop", color: "bg-[#1C2B2D]/70" },
    { name: "Classical", color: "bg-[#F5F5F5]/70" },
  ];

  return (
    <div className="w-full py-8 bg-[#121212]">
      <h2 className="text-2xl md:text-3xl font-bold text-[#F5F5F5] mb-6 px-4">Explore Genres</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 px-4">
        {genres.map((genre, index) => (
          <div
            key={index}
            className={`${genre.color} text-center rounded-lg p-4 cursor-pointer hover:opacity-90 transition-opacity duration-200`}
            style={{ minHeight: "120px" }}
          >
            <h3 className="text-white text-sm sm:text-base md:text-lg font-semibold line-clamp-2">
              {genre.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Genres;