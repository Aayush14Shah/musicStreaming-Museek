import React from 'react';

const TrackList = () => {
  // Static data for now, to be replaced with API data later
  const tracks = [
    { id: 1, title: "Song One", artist: "Artist A", album: "Album X", duration: "3:45" },
    { id: 2, title: "Song Two", artist: "Artist B", album: "Album Y", duration: "4:12" },
    { id: 3, title: "Song Three", artist: "Artist C", album: "Album Z", duration: "3:28" },
  ];

  return (
    <div className="w-full py-6 bg-[#121212] px-2">
      <h2 className="text-2xl md:text-3xl font-bold text-[#F5F5F5] mb-4 px-4">Recommended Tracks</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] bg-[#1C2B2D] text-[#F5F5F5] rounded-lg overflow-hidden">
          <thead>
            <tr className="border-b border-[#CD7F32]">
              <th className="py-2 px-4 text-left text-sm sm:text-base">#</th>
              <th className="py-2 px-4 text-left text-sm sm:text-base">Title</th>
              <th className="py-2 px-4 text-left text-sm sm:text-base">Artist</th>
              <th className="py-2 px-4 text-left text-sm sm:text-base">Album</th>
              <th className="py-2 px-4 text-left text-sm sm:text-base">Duration</th>
              <th className="py-2 px-4 text-left text-sm sm:text-base">Action</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track) => (
              <tr key={track.id} className="border-b border-[#1C2B2D]/50 hover:bg-[#CD7F32]/20 transition-colors duration-200">
                <td className="py-2 px-4 text-sm sm:text-base">{track.id}</td>
                <td className="py-2 px-4 text-sm sm:text-base">{track.title}</td>
                <td className="py-2 px-4 text-sm sm:text-base">{track.artist}</td>
                <td className="py-2 px-4 text-sm sm:text-base">{track.album}</td>
                <td className="py-2 px-4 text-sm sm:text-base">{track.duration}</td>
                <td className="py-2 px-4">
                  <button className="px-3 py-1 bg-[#CD7F32] text-[#121212] rounded-full hover:bg-[#F5F5F5] hover:text-[#1C2B2D] transition-colors duration-200 text-sm sm:text-base">
                    Play
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrackList;