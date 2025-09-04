import React from 'react';
// import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, MoreHorizontal, Download, Clock, Heart, Share } from 'lucide-react';
import { Button } from '@mui/material';

const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatFollowers = (count) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

export const PlaylistView = ({ playlist, tracks, onTrackClick, onBack }) => {
  const totalDuration = tracks?.reduce((sum, track) => sum + track.duration_ms, 0) || 0;
  const totalHours = Math.floor(totalDuration / 3600000);
  const totalMinutes = Math.floor((totalDuration % 3600000) / 60000);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #121212 0%, #0e0e0e 100%)' }}>
      {/* Header Section */}
      <div 
        className="relative pb-6"
        style={{ 
          background: 'linear-gradient(to bottom, rgba(205, 127, 50, 0.2) 0%, rgba(24, 24, 24, 0.8) 50%, transparent 100%)' 
        }}
      >
        <div 
          className="absolute inset-0 opacity-60"
          style={{ background: 'linear-gradient(to right, rgba(205, 127, 50, 0.1) 0%, transparent 100%)' }}
        />
        
        {/* Back Button */}
        <div className="relative z-10 flex items-center p-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-4 hover:scale-105 transition-all duration-300 w-10 h-10 rounded-full"
            style={{ 
              color: '#F5F5F5',
              borderColor: 'rgba(205, 127, 50, 0.3)',
              border: '1px solid',
              backgroundColor: 'rgba(205, 127, 50, 0.1)'
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Playlist Info */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end gap-6 px-6 pb-6">
          {/* Album Art */}
          <div className="flex-shrink-0">
            <div 
              className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden"
              style={{ 
                backgroundColor: '#181818',
                border: '1px solid rgba(205, 127, 50, 0.2)',
                boxShadow: '0 10px 30px -10px rgba(205, 127, 50, 0.3)'
              }}
            >
              {playlist?.images?.[0]?.url ? (
                <img
                  src={playlist.images[0].url}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.2) 0%, rgba(205, 127, 50, 0.1) 100%)' }}
                >
                  <div className="text-6xl font-bold" style={{ color: '#CD7F32' }}>
                    {playlist?.name?.charAt(0) || 'P'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Playlist Details */}
          <div className="flex-1 min-w-0">
            <div className="text-sm uppercase tracking-wide font-semibold mb-2" style={{ color: '#CD7F32' }}>
              {playlist?.public ? 'Public Playlist' : 'Playlist'}
            </div>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 break-words"
              style={{ color: '#F5F5F5' }}
            >
              {playlist?.name || 'Untitled Playlist'}
            </h1>
            <div className="text-sm mb-4" style={{ color: '#B3B3B3' }}>
              {playlist?.description || 'No description provided'}
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#F5F5F5' }}>
              <div className="w-6 h-6 rounded-full overflow-hidden" style={{ backgroundColor: '#181818' }}>
                {playlist?.owner?.images?.[0]?.url ? (
                  <img
                    src={playlist.owner.images[0].url}
                    alt={playlist.owner.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: '#CD7F32' }}>
                    {playlist?.owner?.display_name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <span className="font-semibold">{playlist?.owner?.display_name || 'Anonymous'}</span>
              <span className="mx-1" style={{ color: '#B3B3B3' }}>•</span>
              <span>{formatFollowers(playlist?.followers?.total || 0)} followers</span>
              <span className="mx-1" style={{ color: '#B3B3B3' }}>•</span>
              <span>{tracks?.length || 0} songs</span>
              <span className="mx-1" style={{ color: '#B3B3B3' }}>•</span>
              <span>{totalHours > 0 ? `${totalHours} hr ` : ''}{totalMinutes} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="px-6 pb-4 mt-[20px] flex items-center gap-4">
        <Button
          variant="contained"
          className="rounded-full p-3 hover:scale-105 transition-all duration-300"
          style={{ 
            backgroundColor: '#CD7F32',
            color: '#121212',
            textTransform: 'none',
            fontWeight: 'bold'
          }}
          onClick={() => tracks.length > 0 && onTrackClick(tracks[0])}
        >
          Play
        </Button>
        <Button
          variant="outlined"
          className="rounded-full p-3 hover:scale-105 transition-all duration-300"
          style={{ 
            color: '#F5F5F5',
            borderColor: '#CD7F32',
            textTransform: 'none'
          }}
        >
          <Share className="w-5 h-5 mr-2" /> Share
        </Button>
        <Button
          variant="outlined"
          className="rounded-full p-3 hover:scale-105 transition-all duration-300"
          style={{ 
            color: '#F5F5F5',
            borderColor: '#CD7F32',
            textTransform: 'none'
          }}
        >
          <Heart className="w-5 h-5 mr-2" /> Like
        </Button>
        <Button
          variant="outlined"
          className="rounded-full p-3 hover:scale-105 transition-all duration-300"
          style={{ 
            color: '#F5F5F5',
            borderColor: '#CD7F32',
            textTransform: 'none'
          }}
        >
          <Download className="w-5 h-5 mr-2" /> Download
        </Button>
        <Button
          variant="outlined"
          size="small"
          className="rounded-full p-3 hover:scale-105 transition-all duration-300 ml-auto"
          style={{ 
            color: '#F5F5F5',
            borderColor: '#CD7F32',
            textTransform: 'none'
          }}
        >
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Track List Header */}
      <div className="px-6 pb-2 grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto] items-center gap-4 text-sm uppercase font-semibold" style={{ color: '#B3B3B3' }}>
        <div>#</div>
        <div>Title</div>
        <div className="hidden md:block">Album</div>
        <div className="flex justify-end">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* Track List */}
      <div className="px-6 space-y-2">
        {tracks.map((track, index) => (
          <div 
            key={track.id || index}
            className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto] items-center gap-4 p-2 rounded-lg hover:bg-[#181818] cursor-pointer transition-all duration-300"
            onClick={() => onTrackClick(track)}
          >
            {/* Index */}
            <div className="w-8 text-center" style={{ color: '#B3B3B3' }}>
              {index + 1}
            </div>

            {/* Track Info */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0" style={{ backgroundColor: '#181818' }}>
                {track?.album?.images?.[0]?.url ? (
                  <img
                    src={track.album.images[0].url}
                    alt={track.album.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center text-xl font-bold"
                    style={{ background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.2) 0%, rgba(205, 127, 50, 0.1) 100%)', color: '#CD7F32' }}
                  >
                    {track?.name?.charAt(0) || 'T'}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate" style={{ color: '#F5F5F5' }}>
                  {track?.name || 'Unknown Track'}
                </div>
                <div className="text-sm truncate" style={{ color: '#B3B3B3' }}>
                  {track?.artists?.map(artist => artist?.name).join(', ') || 'Unknown Artist'}
                </div>
              </div>
            </div>

            {/* Album Name (Desktop) */}
            <div className="hidden md:block text-sm truncate" style={{ color: '#B3B3B3' }}>
              {track?.album?.name || 'Unknown Album'}
            </div>

            {/* Duration */}
            <div className="text-sm text-right" style={{ color: '#B3B3B3' }}>
              {formatDuration(track?.duration_ms || 0)}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Spacing for Music Player */}
      <div className="h-24" />
    </div>
  );
};