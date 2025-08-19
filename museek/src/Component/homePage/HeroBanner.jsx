import React from 'react';

const HeroBanner = () => {
  // Static data for now, to be replaced with API data later
  const featured = {
    name: "Today's Top Hits",
    description: "The hottest tracks of the moment, updated daily.",
    image: "https://via.placeholder.com/1200x400?text=Album+Cover", // Placeholder image
  };

  console.log('HeroBanner rendered'); // Debug log to confirm rendering

  return (
    <div className="relative w-full h-80 md:h-96 bg-[#121212] text-[#F5F5F5] flex items-center justify-center overflow-hidden z-10">
      {/* Background Image with Overlay */}
      <img
        src={featured.image}
        alt={featured.name}
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      />
      {/* Content */}
      <div className="relative z-20 text-center px-4">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">{featured.name}</h1>
        <p className="text-base md:text-lg max-w-xl mx-auto mb-6 text-[#CD7F32]">{featured.description}</p>
        <button className="px-6 py-2 bg-[#CD7F32] rounded-full text-[#121212] font-semibold hover:bg-[#1C2B2D] hover:text-[#F5F5F5] transition-colors duration-200">
          Play Now
        </button>
      </div>
    </div>
  );
};

export default HeroBanner;