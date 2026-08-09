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
    <div className="min-h-screen text-[var(--text-primary)]" style={{ background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
      {/* Header Section */}
      <div 
        className="relative pb-6"
        style={{ 
          background: 'linear-gradient(to bottom, rgba(var(--accent-primary-rgb), 0.2) 0%, rgba(var(--bg-primary-rgb), 0.8) 50%, transparent 100%)' 
        }}
      >
        <div className="absolute inset-0 opacity-60" style={{ background: 'linear-gradient(to right, rgba(var(--accent-primary-rgb), 0.1) 0%, transparent 100%)' }} />
        {/* Back Button */}
        <div className="relative z-10 flex items-center p-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-4 hover:scale-105 transition-all duration-300 w-10 h-10 rounded-full"
            style={{ 
              color: 'var(--text-primary)',
              borderColor: 'var(--accent-primary)',
              backgroundColor: 'var(--bg-tertiary)'
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
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                boxShadow: 'var(--shadow-primary)'
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
                    style={{ background: 'linear-gradient(135deg, rgba(var(--accent-primary-rgb), 0.2) 0%, rgba(var(--accent-primary-rgb), 0.1) 100%)' }}
                >
                  <div className="text-6xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                    {playlist?.name?.charAt(0) || 'P'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Playlist Details */}
          <div className="flex-1 min-w-0">
            <div className="text-sm uppercase tracking-wide font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>
              {playlist?.public ? 'Public Playlist' : 'Playlist'}
            </div>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 break-words"
              style={{ color: 'var(--text-primary)' }}
            >
              {playlist?.name || 'Untitled Playlist'}
            </h1>
            <div className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {playlist?.description || 'No description provided'}
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
              <div className="w-6 h-6 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                {playlist?.owner?.images?.[0]?.url ? (
                  <img
                    src={playlist.owner.images[0].url}
                    alt={playlist.owner.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: 'var(--accent-primary)' }}>
                    {playlist?.owner?.display_name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <span className="font-semibold">{playlist?.owner?.display_name || 'Anonymous'}</span>
              <span className="mx-1" style={{ color: 'var(--text-secondary)' }}>•</span>
              <span>{formatFollowers(playlist?.followers?.total || 0)} followers</span>
              <span className="mx-1" style={{ color: 'var(--text-secondary)' }}>•</span>
              <span>{tracks?.length || 0} songs</span>
              <span className="mx-1" style={{ color: 'var(--text-secondary)' }}>•</span>
              <span>{totalHours > 0 ? `${totalHours} hr ` : ''}{totalMinutes} min</span>
            </div>
          </div>
        </div>
      </div>

     
      {/* Track List Header */}
      <div className="px-6 pb-2 grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto] items-center gap-4 text-sm uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>
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
            key={`${track.id}-${index}` || `track-${index}`}
            className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto] items-center gap-4 p-2 rounded-lg hover:bg-[var(--bg-tertiary)] cursor-pointer transition-all duration-300"
            onClick={() => onTrackClick(track)}
          >
            {/* Index */}
            <div className="w-8 text-center" style={{ color: 'var(--text-secondary)' }}>
              {index + 1}
            </div>

            {/* Track Info */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                {track?.album?.images?.[0]?.url ? (
                  <img
                    src={track.album.images[0].url}
                    alt={track.album.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center text-xl font-bold"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-primary)' }}
                  >
                    {track?.name?.charAt(0) || 'T'}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {track?.name || 'Unknown Track'}
                </div>
                <div className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                  {track?.artists?.map(artist => artist?.name).join(', ') || 'Unknown Artist'}
                </div>
              </div>
            </div>

            {/* Album Name (Desktop) */}
            <div className="hidden md:block text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
              {track?.album?.name || 'Unknown Album'}
            </div>

            {/* Duration */}
            <div className="text-sm text-right" style={{ color: 'var(--text-secondary)' }}>
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