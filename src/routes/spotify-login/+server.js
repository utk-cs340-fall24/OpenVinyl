  // This file handles the OAuth redirection to Spotify
  import { redirect } from '@sveltejs/kit';
  import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } from '$env/static/private';

  export async function GET() {
    const client_id = SPOTIFY_CLIENT_ID;
    const redirect_uri =  SPOTIFY_REDIRECT_URI;
    const scopes = [
      'streaming',
      'user-read-email',
      'user-read-private',
      'user-modify-playback-state',
      'user-read-playback-state',
      'user-read-currently-playing',
      'user-top-read',
      'user-read-recently-played', 
      'user-library-read',
      'playlist-modify-private',
      'playlist-modify-public'
    ].join(' ');

    // const state = generateRandomString(16); // Implement a function to generate a random string
    const authQueryParameters = new URLSearchParams({
      response_type: 'code',
      client_id,
      scope: scopes,
      redirect_uri,
    });
    throw redirect(302, `https://accounts.spotify.com/authorize?${authQueryParameters.toString()}`);
  }
