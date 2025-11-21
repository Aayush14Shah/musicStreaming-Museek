import React, { useState, useEffect } from 'react';
import { Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import useLikes from '../../hooks/useLikes';
import AddToPlaylistModal from '../Playlists/AddToPlaylistModal';

const NowPlayingSidebar = ({ currentTrack, onClose, isOpen, playlistName = "Now Playing" }) => {
  const userId = localStorage.getItem('userId');
  const { isLiked, toggleLike, loading } = useLikes(userId);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  
  // Dynamic playlist name from album (handle both string and object)
  const dynamicPlaylistName = (() => {
    if (!currentTrack) return playlistName;
    const alb = currentTrack.album;
    if (typeof alb === 'string') return alb;
    if (alb && typeof alb === 'object') return alb.name || playlistName;
    return playlistName;
  })();

  // Empty state when no track is loaded
  if (!currentTrack) {
    return (
      <div
        className={`fixed top-[60px] bottom-16 right-0 bg-[var(--bg-primary)] text-[var(--text-primary)] z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } w-[18rem] md:w-[20rem] lg:w-[22rem]`}
      >
        <div className="m-1.5 w-full h-[calc(100%-12px)] rounded-2xl shadow-[var(--shadow-primary)] bg-[var(--bg-secondary)] border border-[var(--border-tertiary)] p-2">
          <div className="w-full h-full rounded-2xl bg-[var(--bg-primary)] border border-[var(--card-border)] overflow-y-auto p-4 group scrollbar-thin scrollbar-thumb-transparent hover:scrollbar-thumb-[var(--accent-primary)] scrollbar-track-transparent scrollbar-thumb-rounded-full">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-semibold">{playlistName}</h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(); // This now only controls sidebar visibility
                }}
                className="bg-[var(--accent-primary)] text-white px-2 py-1 rounded-md hover:bg-[var(--accent-secondary)] transition-colors"
                aria-label="Close sidebar"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center justify-center h-full text-center"> 
              <div className="w-16 h-16 mx-auto mb-3 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[var(--accent-primary)]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold mb-2">No track playing</h3>
              <p className="text-sm text-[var(--accent-primary)] leading-tight">
                Select a track to start listening
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const artistInfo = {
    name: currentTrack.artist || "Unknown Artist",
    description: currentTrack.artistDescription || "",
    credits: currentTrack.credits || [],
  };

  const handleLikeToggle = async () => {
    if (!currentTrack || !userId) return;
    
    const songData = {
      songId: currentTrack.id,
      songType: 'spotify', // Assuming Spotify for now, can be dynamic
      songTitle: currentTrack.title,
      songArtist: currentTrack.artist,
      songAlbum: currentTrack.album,
      songImage: currentTrack.image,
      songPreviewUrl: currentTrack.audioUrl,
      spotifyUri: currentTrack.uri
    };
    
    const result = await toggleLike(songData);
    if (result.success) {
      console.log('Like toggled successfully');
    }
  };
  
  const shareSong = async () => {
    if (!currentTrack) return;
    const shareUrl = `${window.location.origin}?track=${encodeURIComponent(currentTrack.id || '')}`;
    const shareText = `Check out ${currentTrack.title} by ${currentTrack.artist} on Museek!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: currentTrack.title, text: shareText, url: shareUrl });
        return;
      } catch (err) { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Track link copied to clipboard!');
    } catch {
      prompt('Copy this track link:', shareUrl);
    }
  };
  const addToPlaylist = () => setShowPlaylistModal(true);

  return (
    <div
      className={`fixed top-[60px] bottom-20 right-0 bg-[var(--bg-primary)] text-[var(--text-primary)] z-40 transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } w-[18rem] md:w-[20rem] lg:w-[22rem]`}
    >
      <div className="m-1.5 h-[calc(100%-12px)] rounded-2xl shadow-[var(--shadow-primary)] bg-[var(--bg-secondary)] border border-[var(--border-tertiary)] p-2">
        <div className="w-full h-full rounded-2xl bg-[var(--bg-primary)] border border-[var(--card-border)] overflow-y-auto p-4 group scrollbar-thin scrollbar-thumb-transparent hover:scrollbar-thumb-[var(--accent-primary)] scrollbar-track-transparent scrollbar-thumb-rounded-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold line-clamp-1">
              {dynamicPlaylistName}
            </h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(); // this will call setIsSidebarOpen(false)
              }}
              className="bg-[var(--accent-primary)] text-white px-2 py-1 rounded-md hover:bg-[var(--accent-secondary)] transition-colors"
              aria-label="Close sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-gradient-to-b from-[var(--bg-tertiary)]/50 to-[var(--bg-primary)]/30 rounded-lg p-4 shadow-[var(--shadow-card)] border border-[var(--card-border)]">
              <div className="w-full aspect-square mb-3 rounded-lg overflow-hidden bg-[var(--bg-tertiary)]">
                <img
                  src={currentTrack.image}
                  alt={currentTrack.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-lg font-semibold mb-2 mt-4 text-[var(--text-primary)]">
                {currentTrack.title}
              </h2>
              <p className="text-sm text-[var(--accent-primary)] mb-3 font-normal">
                {currentTrack.artist}
              </p>
              <div className="flex items-center gap-3">
                <Tooltip title={isLiked(currentTrack?.id, 'spotify') ? 'Remove from Liked Songs' : 'Add to Liked Songs'} arrow>
                  <button
                    onClick={handleLikeToggle}
                    disabled={loading}
                    aria-label="Toggle like"
                    className={`w-7 h-7 flex items-center justify-center p-1.5 rounded-full transition-colors ${
                      isLiked(currentTrack?.id, 'spotify') 
                        ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]' 
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-[var(--bg-primary)]'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLiked(currentTrack?.id, 'spotify') ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                  </button>
                </Tooltip>
                <Tooltip title="Share" arrow>
                  <button
                    onClick={shareSong}
                    aria-label="Share song"
                    className="w-7 h-7 flex items-center justify-center p-1.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-colors"
                  >
                    <ShareIcon fontSize="small" />
                  </button>
                </Tooltip>
                <Tooltip title="Download" arrow>
                  <button
                    onClick={() => {
                      if(currentTrack?.audioUrl){
                        const link=document.createElement('a');
                        link.href=currentTrack.audioUrl;
                        link.download=(currentTrack.title||'track')+'.mp3';
                        link.click();
                      }
                    }}
                    aria-label="Download song"
                    className="w-7 h-7 flex items-center justify-center p-1.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16l4-5h-3V4h-2v7H8l4 5zm-7 2h14v2H5v-2z"/></svg>
                  </button>
                </Tooltip>

                <Tooltip title="Add to Playlist" arrow>
                  <button
                    onClick={addToPlaylist}
                    aria-label="Add to playlist"
                    className="w-7 h-7 flex items-center justify-center p-1.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-colors"
                  >
                    <PlaylistAddIcon fontSize="small" />
                  </button>
                </Tooltip>
              </div>
            </div>
            {artistInfo.description && (
              <div className="bg-gradient-to-b from-[var(--bg-tertiary)]/50 to-[var(--bg-primary)]/30 rounded-lg p-4 shadow-[var(--shadow-card)] border border-[var(--card-border)]">
                <h3 className="text-base font-semibold mb-2 text-[var(--text-primary)]">About the artist</h3>
                <p className="text-sm leading-tight text-[var(--text-secondary)]">{artistInfo.description}</p>
              </div>) }
            {artistInfo.credits && artistInfo.credits.length>0 && (
              <div className="bg-gradient-to-b from-[var(--bg-tertiary)]/50 to-[var(--bg-primary)]/30 rounded-lg p-4 shadow-[var(--shadow-card)] border border-[var(--card-border)]">
                <h3 className="text-base font-semibold mb-2 text-[var(--text-primary)]">Credits</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {artistInfo.credits.map((credit, index) => (
                    <li key={index} className="text-sm leading-tight text-[var(--text-secondary)]">
                      {credit.role}: {credit.name}
                    </li>
                  ))}
                </ul>
              </div>) }
            {currentTrack?.lyrics && (
              <div className="bg-gradient-to-b from-[var(--bg-tertiary)]/50 to-[var(--bg-primary)]/30 rounded-lg p-4 shadow-[var(--shadow-card)] border border-[var(--card-border)] whitespace-pre-wrap">
                <h3 className="text-base font-semibold mb-2 text-[var(--text-primary)]">Lyrics</h3>
                <p className="text-sm leading-tight text-[var(--text-secondary)]">{currentTrack.lyrics}</p>
              </div>) }
          </div>
        </div>
      </div>

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        open={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        song={currentTrack}
        userId={userId}
      />
    </div>
  );
};

export default NowPlayingSidebar;
