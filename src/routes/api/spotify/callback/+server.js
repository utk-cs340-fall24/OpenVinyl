import { json } from '@sveltejs/kit';
import fetch from 'node-fetch';

const client_id = '74993b84e7ca4167a76581201d4f58f1';
const client_secret = '91710a7ff19648a994c76e9990a478f7';
const redirect_uri = 'http://localhost:5173/api/spotify/callback';

export async function POST({ request }) {
  const { code } = await request.json(); // The authorization code from Spotify
  
  // Exchange the authorization code for access and refresh tokens
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri
    })
  });

  const tokenData = await tokenResponse.json();

  // Send back the access token, refresh token, etc.
  return json({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_in: tokenData.expires_in
  });
}
