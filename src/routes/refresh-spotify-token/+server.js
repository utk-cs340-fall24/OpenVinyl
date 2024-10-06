import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } from '$env/static/private';

export async function GET() {
  // Get the current user session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  const { data, error } = await supabase.auth.getSession()
  console.log(data, error);

  // console.log(session)
  if (sessionError || !session?.user) {
    return json({ success: false, message: 'User not authenticated' }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch the user's refresh token from Supabase
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('spotify_refresh_token')
    .eq('id', userId)
    .single();

  if (profileError || !profile?.spotify_refresh_token) {
    return json({ success: false, message: 'No refresh token available' }, { status: 400 });
  }

  const refresh_token = profile.spotify_refresh_token;
  const client_id = SPOTIFY_CLIENT_ID;
  const client_secret = SPOTIFY_CLIENT_SECRET;

  // Request a new access token
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${client_id}:${client_secret}`)
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token
    })
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    console.error('Error refreshing Spotify token:', tokenData.error);
    return json({ success: false, message: tokenData.error_description }, { status: 400 });
  }

  const { access_token, expires_in } = tokenData;

  // Update the access token and expiration time in Supabase
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      spotify_access_token: access_token,
      spotify_token_expires: new Date(Date.now() + expires_in * 1000)
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating Spotify access token:', updateError);
    return json({ success: false, message: updateError.message }, { status: 500 });
  }

  return json({ success: true, access_token, expires_in });
}
