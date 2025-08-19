import React from 'react';

// helper stays the same
const formatDuration = (ms = 0) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const TrackList = ({ items = [] }) => {
  const tracks = items.filter(Boolean);

  return (
    <section className="w-full py-8 md:py-12 bg-[#121212]">
      <div className="px-4 md:px-8 flex items-end justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#F5F5F5]">Recommended Tracks</h2>
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
                className="flex items-center gap-3 rounded-xl bg-[#1C2B2D] p-3 hover:bg-[#243638] transition-colors"
              >
                <div className="w-10 text-sm shrink-0 text-[#F5F5F5]/70">{idx + 1}</div>
                <img
                  src={art || 'https://placehold.co/64x64?text=♪'}
                  alt=""
                  className="w-12 h-12 rounded object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[#F5F5F5] font-medium truncate">{track?.name || 'Unknown Track'}</div>
                  <div className="text-[#CD7F32] text-sm truncate">{artists}</div>
                  <div className="text-[#F5F5F5]/60 text-xs truncate">{track?.album?.name || 'Unknown Album'}</div>
                </div>
                <div className="text-[#F5F5F5]/70 text-xs shrink-0">{formatDuration(track?.duration_ms)}</div>
                <button
                  className="ml-2 px-3 py-1 rounded-full bg-[#CD7F32] text-[#121212] text-sm hover:bg-[#F5F5F5] hover:text-[#1C2B2D] transition-colors"
                >
                  Play
                </button>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl bg-[#1C2B2D] p-6 text-center text-[#F5F5F5]/80">
            No tracks available
          </div>
        )}
      </div>

      {/* Desktop/tablet: table view */}
      <div className="hidden md:block px-4 md:px-8">
        <div className="overflow-x-auto rounded-xl shadow-lg">
          <table className="w-full min-w-[900px] bg-[#1C2B2D] text-[#F5F5F5] rounded-xl overflow-hidden">
            <thead className="sticky top-0 bg-[#1C2B2D] z-10">
              <tr className="border-b border-[#CD7F32]">
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
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
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
                            <div className="text-xs text-[#CD7F32] truncate">
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
                        <button className="px-5 py-2 bg-[#CD7F32] text-[#121212] rounded-full hover:bg-[#F5F5F5] hover:text-[#1C2B2D] transition-colors text-sm md:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CD7F32]">
                          Play
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 px-6 text-center text-[#F5F5F5]/80">
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
