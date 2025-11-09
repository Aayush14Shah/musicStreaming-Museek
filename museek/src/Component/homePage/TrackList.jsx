import React from 'react';

// helper stays the same
const formatDuration = (ms = 0) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const TrackList = ({ title = 'Recommended Tracks', items = [], onTrackClick }) => {
  // Backend now sends mixed content - prioritize tracks with previews
  const tracks = items.filter(t => {
    const track = t.track || t; // Handle both playlist items and direct tracks
    if (track && track.name) {
      if (track.preview_url) {
        console.log(`✅ TrackList: Showing track with preview: "${track?.name}"`);
      } else {
        console.log(`🔄 TrackList: Showing track without preview (will use fallback): "${track?.name}"`);
      }
      return true;
    }
    return false;
  });

  const handleTrackPlay = (track) => {
    console.log('Playing track from list:', track);
    if (onTrackClick) {
      onTrackClick(track);
    }
  };

  return (
    <section className="w-full py-8 md:py-12 bg-[var(--bg-secondary)]">
      <div className="px-4 md:px-8 flex items-end justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Recommended Tracks</h2>
      </div>

      {/* Mobile-first: card list */}
      <div className="px-4 md:px-8 md:hidden space-y-3">
        {tracks.length ? (
          tracks.map((track, idx) => {
            const art =
              track?.album?.images?.[2]?.url ||
              track?.album?.images?.[1]?.url ||
              track?.album?.images?.[0]?.url;
            const artists = track?.artists?.map(a => a.name).join(', ') || 'Unknown Artist';

            return (
              <div
                key={track.id || idx}
                className="flex items-center gap-3 rounded-xl bg-[var(--bg-tertiary)] p-3 hover:bg-[var(--border-primary)] transition-colors"
              >
                <div className="w-10 text-sm shrink-0 text-[var(--text-secondary)]">{idx + 1}</div>
                <img
                  src={art || 'https://placehold.co/64x64?text=♪'}
                  alt=""
                  className="w-12 h-12 rounded object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[var(--text-primary)] font-medium truncate">{track?.name || 'Unknown Track'}</div>
                  <div className="text-[var(--accent-primary)] text-sm truncate">{artists}</div>
                  <div className="text-[var(--text-tertiary)] text-xs truncate">{track?.album?.name || 'Unknown Album'}</div>
                </div>
                <div className="text-[var(--text-secondary)] text-xs shrink-0">{formatDuration(track?.duration_ms)}</div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-[var(--accent-primary)] text-xs font-semibold">30s Preview</div>
                  <button
                    onClick={() => handleTrackPlay(track)}
                    className="px-3 py-1 rounded-full bg-[var(--accent-primary)] text-[var(--bg-primary)] text-sm hover:bg-[var(--text-primary)] hover:text-[var(--bg-tertiary)] transition-colors"
                  >
                    Play
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl bg-[var(--bg-tertiary)] p-6 text-center text-[var(--text-secondary)]">
            No tracks available
          </div>
        )}
      </div>

      {/* Desktop/tablet: table view */}
      <div className="hidden md:block px-4 md:px-8">
        <div className="overflow-x-auto rounded-xl shadow-lg">
          <table className="w-full min-w-[900px] bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-xl overflow-hidden">
            <thead className="sticky top-0 bg-[var(--bg-tertiary)] z-10">
              <tr className="border-b border-[var(--accent-primary)]">
                <th className="py-3 px-6 text-left text-sm md:text-base font-semibold w-12">#</th>
                <th className="py-3 px-6 text-left text-sm md:text-base font-semibold">Title</th>
                <th className="py-3 px-6 text-left text-sm md:text-base font-semibold">Artist</th>
                <th className="py-3 px-6 text-left text-sm md:text-base font-semibold">Album</th>
                <th className="py-3 px-6 text-left text-sm md:text-base font-semibold w-24">Duration</th>
                <th className="py-3 px-6 text-left text-sm md:text-base font-semibold w-28">Action</th>
              </tr>
            </thead>
            <tbody>
              {tracks.length ? (
                tracks.map((track, idx) => {
                  const art =
                    track?.album?.images?.[2]?.url ||
                    track?.album?.images?.[1]?.url ||
                    track?.album?.images?.[0]?.url;
                  const artists = track?.artists?.map(a => a.name).join(', ') || 'Unknown Artist';

                  return (
                    <tr
                      key={track.id || idx}
                      className="border-b border-[var(--border-primary)] hover:bg-[var(--border-primary)] transition-colors"
                    >
                      <td className="py-3 px-6 text-sm md:text-base">{idx + 1}</td>

                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={art || 'https://placehold.co/64x64?text=♪'}
                            alt=""
                            className="w-10 h-10 rounded object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-sm md:text-base font-medium truncate">
                              {track?.name || 'Unknown Track'}
                            </div>
                            <div className="text-xs text-[var(--accent-primary)] truncate">
                              {artists}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-6 text-sm md:text-base truncate">
                        {artists}
                      </td>

                      <td className="py-3 px-6 text-sm md:text-base truncate">
                        {track?.album?.name || 'Unknown Album'}
                      </td>

                      <td className="py-3 px-6 text-sm md:text-base">
                        {formatDuration(track?.duration_ms)}
                      </td>

                      <td className="py-3 px-6">
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-[var(--accent-primary)] text-xs font-semibold">30s Preview</div>
                          <button 
                            onClick={() => handleTrackPlay(track)}
                            className="px-4 py-1.5 bg-[var(--accent-primary)] text-[var(--bg-primary)] rounded-full hover:bg-[var(--text-primary)] hover:text-[var(--bg-tertiary)] transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                          >
                            Play
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 px-6 text-center text-[var(--text-secondary)]">
                    No tracks available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default TrackList;