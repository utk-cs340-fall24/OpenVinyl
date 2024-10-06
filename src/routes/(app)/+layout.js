import { supabase } from '$lib/supabaseClient';

export async function load({ fetch }) {
  // Fetch the current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return { session: null, spotifyAuth: null };
  }

  const user = session.user;

  // Check if the user has authenticated with Spotify
  const { data: spotifyData, error: spotifyError } = await supabase
    .from('profiles')
    .select('spotify_access_token, spotify_refresh_token, spotify_token_expires')
    .eq('id', user.id)
    .single();

  if (spotifyError || !spotifyData.spotify_access_token) {
    return {
      session,
      spotifyAuth: null, // User hasn't authenticated with Spotify
    };
  }

  // Return the session and Spotify auth data
  return {
    session,
    spotifyAuth: {
      access_token: spotifyData.spotify_access_token,
      refresh_token: spotifyData.spotify_refresh_token,
      token_expires: spotifyData.spotify_token_expires,
    },
  };
}
