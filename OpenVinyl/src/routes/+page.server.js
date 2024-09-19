import { supabase } from "$lib/supabaseClient";
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '$env/static/private';


export async function load() {
  const { data } = await supabase.from("posts_dummy").select();
 

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'grant_type': 'client_credentials',
        }),
      });
    
      if (!response.ok) {
        const error = await response.json();
        console.error('Error fetching token:', error);
        throw new Error('Failed to get Spotify token');
      }
    
      const tmp2 = await response.json();
      const token = tmp2.access_token;
      console.log(token);
      const s = "tests";
  return {
    posts_dummy: data ?? [],
    s
  };

}