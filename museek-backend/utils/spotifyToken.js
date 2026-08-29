import axios from "axios";

let tokenCache = {
  access_token: null,
  expires_at: null,
};

/**
 * Gets an app-level Spotify access token using the Client Credentials flow.
 * Caches the token and only refreshes when it is about to expire.
 */
export async function getAppToken() {
  const now = Date.now();
  if (tokenCache.access_token && tokenCache.expires_at > now + 60000) {
    return { access_token: tokenCache.access_token };
  }

  const body = new URLSearchParams({ grant_type: "client_credentials" });
  const basic = Buffer.from(
    process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
  ).toString("base64");

  const { data } = await axios.post(
    "https://accounts.spotify.com/api/token",
    body,
    {
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  tokenCache = {
    access_token: data.access_token,
    expires_at: now + data.expires_in * 1000,
  };

  return { access_token: data.access_token };
}
