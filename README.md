# TuneIn
A music streaming website


express → Web server framework
cors → Allow requests from React
dotenv → Store API keys securely
axios → For making HTTP requests (Spotify API)
nodemon → Auto-restart server during dev

🔑 How the Spotify API Authentication Works
-> Spotify API uses OAuth 2.0. For your project, the simplest flow is the Client Credentials Flow, because you’re not building a real login system with personal user libraries (yet).
-> You send your clientID and clientSecret to Spotify’s token endpoint.
-> Spotify responds with an access token (a string).
-> You use that access token to fetch data (songs, albums, playlists, etc.).
-> Token usually expires in 1 hour, so you’ll need to refresh it automatically.

## Jamendo API Setup
- Create a Jamendo developer application and copy the `client_id` and `client_secret`.
- Store them in `museek-backend/.env` as `JAMENDO_CLIENT_ID` and `JAMENDO_CLIENT_SECRET` (do not commit the file).
- The backend uses these credentials to power `/api/jamendo/preview`, giving the frontend a legal fallback when other preview sources fail.