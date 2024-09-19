import { json } from '@sveltejs/kit';
import { SPOTIFY_CLIENT_SECRET } from "$env/static/private";
import { SPOTIFY_CLIENT_ID } from "$env/static/private";

async function getSpotifyToken() {
  const client_id = SPOTIFY_CLIENT_ID; 
  const client_secret = SPOTIFY_CLIENT_SECRET; 

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret)
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

export async function load() {
  const token = await getSpotifyToken();
  return json({ token });
}