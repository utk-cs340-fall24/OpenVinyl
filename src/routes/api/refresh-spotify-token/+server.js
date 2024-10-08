// src/routes/api/refresh-spotify-token/+server.js

import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';
import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
} from '$env/static/private';
import pkg from 'base-64';
const { encode } = pkg;

/**
 * Handles POST requests to refresh Spotify access tokens.
 * Expects a JSON body containing the userId.
 */
export async function POST({ request }) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch the user's refresh token from Supabase
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('spotify_refresh_token')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.spotify_refresh_token) {
      return json(
        { success: false, message: 'No refresh token available' },
        { status: 400 }
      );
    }

    const refresh_token = profile.spotify_refresh_token;

    // Prepare the request to Spotify's token endpoint
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          encode(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Error refreshing Spotify token:', tokenData.error);
      return json(
        { success: false, message: tokenData.error_description || tokenData.error },
        { status: 400 }
      );
    }

    const { access_token, expires_in } = tokenData;
    const expires_at = new Date(Date.now() + expires_in * 1000).toISOString();

    // Update the user's profile in Supabase with the new access token and expiration time
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        spotify_access_token: access_token,
        spotify_token_expires: expires_at,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating Spotify access token:', updateError);
      return json(
        { success: false, message: updateError.message },
        { status: 500 }
      );
    }

    return json({ success: true, access_token, expires_in });
  } catch (error) {
    console.error('Unexpected error in refresh-spotify-token:', error);
    return json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
