import { json } from '@sveltejs/kit';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } from '$env/static/private';

export async function GET({ url }) {
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    console.error('Error during Spotify authentication:', error);
    return json({ success: false, message: error });
  }

  if (!code) {
    return json({ success: false, message: 'No code provided' });
  }
  console.log("spotify callback here ")
  const client_id = SPOTIFY_CLIENT_ID;
  const client_secret = SPOTIFY_CLIENT_SECRET;
  const redirect_uri = SPOTIFY_REDIRECT_URI;

  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${client_id}:${client_secret}`)
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri
    })
  });

  const tokenData = await tokenResponse.json();
  if (tokenData.error) {
    console.error('Error fetching tokens:', tokenData.error);
    return json({ success: false, message: tokenData.error_description });
  }

  const { access_token, refresh_token, expires_in } = tokenData;

  // Return the token data to the client
  return json({
    success: true,
    access_token,
    refresh_token,
    expires_in
  });
}
