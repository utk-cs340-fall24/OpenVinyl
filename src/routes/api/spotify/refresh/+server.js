// +server.js
import { json } from '@sveltejs/kit';
import fetch from 'node-fetch';

const client_id = '74993b84e7ca4167a76581201d4f58f1';
const client_secret = 'your_spotify_client_secret';

export async function POST({ request }) {
  const { refresh_token } = await request.json();

  // Exchange the refresh token for a new access token
  const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token
    })
  });

  const refreshData = await refreshResponse.json();

  // Return new access token
  return json({
    access_token: refreshData.access_token,
    expires_in: refreshData.expires_in
  });
}
