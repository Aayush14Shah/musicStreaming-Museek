// Updated HeroBanner.jsx (improved responsiveness and spacing)
import React from 'react';

const HeroBanner = ({ featured }) => {
  const defaultFeatured = {
    name: "Today's Top Hits",
    description: "The hottest tracks of the moment, updated daily.",
    image: "https://placehold.co/1200x400?text=Album+Cover",
  };

  const banner = featured || defaultFeatured;

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 bg-[#121212] text-[#F5F5F5] flex items-center justify-center overflow-hidden z-10 mb-8">
      <img
        src={banner.images?.[0]?.url || banner.image}
        alt={banner.name}
        className="absolute inset-0 w-full h-full object-cover opacity-60 filter brightness-50"
      />
      <div className="relative z-20 text-center px-4 md:px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4">{banner.name}</h1>
        <p className="text-sm sm:text-base md:text-xl max-w-2xl mx-auto mb-6 text-[#CD7F32] line-clamp-3">{banner.description}</p>
        <button className="px-6 py-3 md:px-8 md:py-4 bg-[#CD7F32] rounded-full text-[#121212] font-semibold hover:bg-[#1C2B2D] hover:text-[#F5F5F5] transition-colors duration-200 text-sm md:text-base">
          Play Now
        </button>
      </div>
    </div>
  );
};

export default HeroBanner;