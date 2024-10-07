import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } from '$env/static/private';

export async function GET({request}) {
  // Get the current user session
  const authHeader = request.headers.get('Authorization');
  const accessToken = authHeader?.split(' ')[1];

  if (!accessToken) {
    return json({ success: false, message: 'No access token provided' }, { status: 401 });
  }
  // Verify the access token by checking it with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)

  if (error || !user) {
    return json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
  }

  const userId = user.id;
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
  const expires_at = new Date(Date.now() + expires_in * 1000).toISOString();

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      spotify_access_token: access_token,
      spotify_token_expires: expires_at
    })
    .eq('id', userId);
  
  if (updateError) {
    console.error('Error updating Spotify access token:', updateError);
    return json({ success: false, message: updateError.message }, { status: 500 });
  }

  return json({ success: true, access_token, expires_in });
}
