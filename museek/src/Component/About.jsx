import React from "react";
import { useEffect, useState } from "react";

const About = () => {
    const [albums, setAlbums] = useState([]);

  useEffect(() => {
    (async () => {
        const res = await fetch("http://localhost:5000/api/new-releases?country=IN&limit=12");
        const data = await res.json();
        console.log(data);
        setAlbums(data.albums?.items || []);
    })();
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
      {albums.map(a => (
        <div key={a.id} className="rounded-lg bg-[var(--bg-tertiary)] p-3 hover:bg-[var(--border-primary)] transition">
          <img src={a.images?.[0]?.url} alt={a.name} className="rounded mb-2" />
          <div className="font-semibold truncate text-[var(--text-primary)]">{a.name}</div>
          <div className="text-sm text-[var(--text-secondary)] truncate">{a.artists?.map(x => x.name).join(", ")}</div>
        </div>
      ))}
    </div>
  );
}

export default About;