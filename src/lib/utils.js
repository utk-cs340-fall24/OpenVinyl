import { supabase } from "./supabaseClient";
import { spotify, setAccessToken } from "./spotifyClient";

// Currently this function must be called on any page that uses spotify
export async function authenticateClientCredentials() {
  try {
    if (!spotify.getAccessToken()) {
      const response = await fetch("/api/spotify/token");
      const data = await response.json();
      // console.log("data here: ", data);
      setAccessToken(data.access_token);
    }
  } catch (error) {
    console.error("Error authenticating with client credentials:", error);
  }
}

/*
 * profile_id: required
 * title: optional (default is '')
 * content: optional (default is '')
 * song_id: required (song 'id' field from spotify api)
 * rating: required (int from 1 to 10 inclusive, no half scores yet)
 */
export async function createPost(userId, content, songId, rating) {
  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        profile_id: userId,
        content,
        song_id: songId,
        rating,
        created_at: new Date().toISOString(),
      }
    ])
    .select('*, likes (profile_id)')
    .single(); 
  if (error) {
    return { error };
  }
  if (!data.likes) {
    data.likes = [];
  }

  return { data };
}
/*
 * profile_id: required
 * username: required
 */
export async function updateUsername(profile_id, username) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ username: username })
      .eq("id", profile_id);
    if (error) {
      console.log("Error updating username: ", error);
      return { success: false, error: error.message };
    }
    console.log("Username updated successfully:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: err.message };
  }
}

/*
 * song_id: required (song 'id' field from spotify api)
 * Returns an array of recommended songs
 */
export async function getRecommendationsFromSong(song_id) {
  try {
    const data = await spotify.getRecommendations({
      seed_tracks: song_id,
    });
    if (data) {
      console.log("Got recommendations successfully", data);
      return { success: true, data };
    }
    console.log("Failed to fetch recommendations");
    return { success: false, data };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: err.message };
  }
}

export async function getSearchSuggestions(query) {
  try {
    const { data } = await spotify.searchTracks(query, {
      limit: 5
    });
    if (data) {
      console.log("Got search results successfully", data);
      return { success: true, data };
    }
    console.log("Failed to fetch search results");
    return { success: false, data };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: err.message };
  }
}

const getURL = () => {
  let url = 
    import.meta.env.VITE_APP_BASE_URL ?? 
    import.meta.env.VITE_APP_VERCEL_URL ?? 
    'http://localhost:5173/';
  url = url.startsWith('http') ? url : `https://${url}`
  url = url.endsWith('/') ? url : `${url}/`
  return url
}

export async function signInWithGoogle() {
  console.log("Initiating Google sign-in");

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error('Error during sign in:', error.message);
    } else {
      console.log('Sign-in initiated successfully');
    }
  } catch (err) {
    console.error('Unexpected error during sign in:', err);
  }
};

export async function signInWithSpotify() {

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'spotify',
    options: {
      scopes: 'streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state user-read-currently-playing user-top-read user-read-recently-played user-library-read playlist-modify-private playlist-modify-public',
    }
  });
  if (error) {
    console.error('Error during sign in:', error.message);
  }

};

export async function updateFirstName(profile_id, fname) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ first_name: fname })
      .eq("id", profile_id);
    if (error) {
      console.log("Error updating first name: ", error);
      return { success: false, error: error.message };
    }
    console.log("Username updated successfully:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: err.message };
  }
}

export async function updateLastName(profile_id, lname) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ last_name: lname })
      .eq("id", profile_id);
    if (error) {
      console.log("Error updating first name: ", error);
      return { success: false, error: error.message };
    }
    console.log("Username updated successfully:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: err.message

     };
    }
  }
// Provide with an array on song id's (MAX 50)
export async function getSongs(song_list) {
  try {
    if (song_list.length > 50) {
      console.log("Too many songs requested (>50)");
      return { success: false, message: "Too many songs requested" };
    }
    console.log(song_list)
    await authenticateClientCredentials();
    const {data, error} = await spotify.getTracks(song_list);
    // console.log("error is ", error)
    console.log("data is ", data)
    if (data) {
      console.log("Got " + song_list.length + " songs successfully");
      return { success: true, data };
    }
    console.log("Failed to fetch " + song_list.length + " songs");
    return { success: false, data };
  } catch (err) {
    console.error("Unexpected error: ", err);
    return { success: false, error: err.message};
  }
}

// Provide with an array of album id's (MAX 20)
export async function getAlbums(album_list) {
  try {
    if (album_list.length > 20) {
      console.log("Too many albums requested (>20)");
      return { success: false, message: "Too many albums requested" };
    }
    const data = await spotify.getAlbums(album_list);
    if (data) {
      console.log("Got " + album_list.length + " albums successfully");
      return { success: true, data };
    }
    console.log("Failed to fetch " + album_list.length + " albums");
    return { success: false, data };
  } catch (err) {
    console.error("Unexpected error: ", err);
    return { success: false, error: err.message};
  }
}

// Provide with a playlist ID
export async function getPlaylist(playlist_id) {
  try {
    const data = await spotify.getPlaylist(playlist_id);
    if (data) {
      console.log("Got playlist successfully");
      return { success: true, data };
    }
    console.log("Failed to fetch playlist");
    return { success: false, data };
  } catch (err) {
    console.error("Unexpected error: ", err);
    return { success: false, error: err.message};
  }
}

// Provide with an array of artist id's (MAX 50)
export async function getArtists(artist_list) {
  try {
    if (artist_list.length > 50) {
      console.log("Too many artists requested");
      return { success: false, message: "Too many artists requested" };
    }
    const data = await spotify.getArtists(artist_list);
    if (data) {
      console.log("Got " + artist_list.length + " artists successfully");
      return { success: true, data };
    }
    console.log("Failed to fetch " + artist_list.length + " artists");
    return { success: false, data };
  } catch (err) {
    console.error("Unexpected error: ", err);
    return { success: false, error: err.message};
  }
}

/*
 * Provide with a single artist ID,
 * returns a list (I think) of related artists.
 * Docs don't say how many items this returns
 * */
export async function getRelatedArtists(artist_id) {
  try {
    const data= await spotify.getArtistRelatedArtists(artist_id);
    if (data) {
      console.log("Got related artists successfully");
      return { success: true, data };
    }
    console.log("Failed to fetch related artists");
    return { success: false, data };
  } catch (err) {
    console.error("Unexpected error: ", err);
    return { success: false, error: err.message};
  }
}

/*
 * Provide with a single artist ID,
 * returns a list (I think) of popular songs by that artist.
 * Docs don't say how many items this returns
 */
export async function getTopTracks(artist_id) {
  try {
    const data = await spotify.getArtistTopTracks(artist_id);
    if (data) {
      console.log("Got artist popular songs successfully");
      return { success: true, data };
    }
    console.log("Failed to fetch artist popular songs");
    return { success: false, data };
  } catch (err) {
    console.error("Unexpected error: ", err);
    return { success: false, error: err.message};
  }
}

export async function refreshTokenIfNeeded() {
  const expires_at = parseInt(localStorage.getItem('spotify_expires_at'), 10);
  
  if (Date.now() >= expires_at) {
    const refresh_token = localStorage.getItem('spotify_refresh_token');
    const response = await fetch('/api/spotify/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token })
    });
    
    const { access_token, expires_in } = await response.json();
    localStorage.setItem('spotify_access_token', access_token);
    localStorage.setItem('spotify_expires_at', Date.now() + expires_in * 1000);
  }
}

// Function to follow a user
export const followUser = async (userId) => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error("Error getting session:", sessionError.message);
    return { success: false, error: sessionError };
  }

  const user = sessionData?.session?.user;
  
  if (!user) {
    console.error("User not logged in.");
    return { success: false, error: "User not logged in." };
  }

  const { data, error } = await supabase
    .from('follows')
    .insert([{ owner_id: user.id, followed_id: userId }]);

  if (error) {
    console.error('Error following user:', error.message);
    return { success: false, error };
  }

  return { success: true, data };
};

export const unfollowUser = async (userId) => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error("Error getting session:", sessionError.message);
    return { success: false, error: sessionError };
  }

  const user = sessionData?.session?.user;
  
  if (!user) {
    console.error("User not logged in.");
    return { success: false, error: "User not logged in." };
  }

  const { data, error } = await supabase
    .from('follows')
    .delete()
    .match({ owner_id: user.id, followed_id: userId });

  if (error) {
    console.error('Error unfollowing user:', error.message);
    return { success: false, error };
  }

  return { success: true, data };
};
export async function getValidSpotifyAccessToken(userId) {
  console.log("Checking call ")
  try {
    console.log("waiting")
    const response = await fetch('/api/refresh-spotify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return data.access_token;
    } else {
      console.error('Failed to refresh Spotify access token:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Unexpected error while refreshing Spotify access token:', error);
    return null;
  }
}

export async function fetchSongsDetails(songIds) {
  try {
    // Ensure the Spotify client is authenticated
      // await authenticateClientCredentials();
      console.log("data: beofre")

    const data = await spotify.getTracks(songIds);
    console.log("data: ", data)
    if (data && data.body && data.body.tracks) {
      const songDetailsMap = {};
      data.body.tracks.forEach((track) => {
        if (track) {
          songDetailsMap[track.id] = {
            title: track.name,
            artist: track.artists.map((artist) => artist.name).join(', '),
            image_url: track.album.images[0]?.url || 'https://placehold.co/300',
          };
        }
      });
      return songDetailsMap;
    } else {
      console.log('No tracks found for the given IDs.');
      return {};
    }
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return {};
  }
}