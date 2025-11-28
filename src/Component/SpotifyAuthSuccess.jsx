import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SpotifyAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresIn = parseInt(params.get('expires_in') || '3600', 10);

    if (accessToken) {
      const expiryTs = Date.now() + expiresIn * 1000;
      localStorage.setItem('spotify_access_token', accessToken);
      localStorage.setItem('spotify_refresh_token', refreshToken || '');
      localStorage.setItem('spotify_token_expires', expiryTs.toString());
    }
    // Redirect back to home (or previous page)
    navigate('/');
  }, [navigate]);

  return <p className="text-white p-4">Connecting to Spotify…</p>;
};

export default SpotifyAuthSuccess;
