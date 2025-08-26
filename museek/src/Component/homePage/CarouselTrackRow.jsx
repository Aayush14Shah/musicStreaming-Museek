import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../components/lightswind/carousel';

const TrackCard = ({ title, artist, image, album, duration, onClick }) => (
  <div 
    className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-[#2a2a2a] hover:border-[#CD7F32]/30 group"
    onClick={onClick}
  >
    <div className="w-full aspect-square overflow-hidden relative min-h-[140px] sm:min-h-[160px] md:min-h-[180px] lg:min-h-[200px] xl:min-h-[220px]">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-300" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="w-12 h-12 bg-[#CD7F32] rounded-full flex items-center justify-center opacity-90 shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
    </div>
    <div className="p-3 text-[#F5F5F5] bg-gradient-to-b from-[#1a1a1a] to-[#151515] h-[100px]">
      <h4 className="text-lg font-bold truncate mb-2 group-hover:text-[#CD7F32] transition-colors duration-300">{title}</h4>
      <p className="text-sm text-[#CD7F32] truncate mb-1 opacity-90 group-hover:opacity-100 transition-opacity duration-300 font-medium">{artist}</p>
      {album && <p className="text-xs text-[#888] truncate opacity-80 group-hover:opacity-100 transition-opacity duration-300">{album}</p>}
      {duration && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-[#888] opacity-80 group-hover:opacity-100 transition-opacity duration-300 font-medium">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
        </div>
      )}
    </div>
  </div>
);

const CarouselTrackRow = ({ title, items, showArrows = true, onTrackClick }) => {
  const filteredItems = (items || []).filter(item => item !== null);

  const handleTrackClick = (track) => {
    console.log('Track clicked:', track);
    if (onTrackClick) {
      onTrackClick(track);
    }
  };

  if (filteredItems.length === 0) {
    return (
      <div className="w-full py-8">
        <h2 className="text-2xl font-bold text-[#F5F5F5] mb-4 px-1 md:px-0">{title}</h2>
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-[#1a1a1a] rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-[#CD7F32]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <p className="text-[#F5F5F5] text-lg">No {title.toLowerCase()} available</p>
          <p className="text-[#CD7F32] text-sm mt-2">Check back later for new content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <h2 className="text-2xl font-bold text-[#F5F5F5] mb-6 px-1 md:px-0">{title}</h2>
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: true,
            slidesToScroll: 1,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4 pr-4">
            {filteredItems.map((item, index) => (
              <CarouselItem 
                key={item.id || index} 
                className="pl-2 md:pl-4 basis-[140px] sm:basis-[160px] md:basis-[180px] lg:basis-[200px] xl:basis-[220px]"
              >
                <TrackCard
                  title={item.name || 'Unknown Track'}
                  artist={item.artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
                  image={item.album?.images?.[0]?.url || item.images?.[0]?.url || 'https://placehold.co/300x300?text=Track'}
                  album={item.album?.name}
                  duration={item.duration_ms ? Math.floor(item.duration_ms / 1000) : null}
                  onClick={() => handleTrackClick(item)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {showArrows && filteredItems.length > 3 && (
            <>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#F5F5F5] border border-[#CD7F32] shadow-lg opacity-70 hover:opacity-100 transition-opacity duration-300" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#F5F5F5] border border-[#CD7F32] shadow-lg opacity-70 hover:opacity-100 transition-opacity duration-300" />
            </>
          )}
        </Carousel>
      </div>
    </div>
  );
};

export default CarouselTrackRow;