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
export async function createPost(profile_id, content, song_id, rating) {
  try {
    //TODO: Change this back to public.posts
    const { data, error } = await supabase.from("posts").insert({
      profile_id: profile_id,
      content: content,
      song_id: song_id,
      rating: rating,
    });
    if (error) {
      console.log("Error inserting data: ", error);
      return { success: false, error: error.message };
    }
    console.log("Data inserted successfully:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: err.message };
  }
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
  console.log(query);
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

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
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
    return { success: false, error: err.message };
// Provide with an array on song id's (MAX 50)
export async function getSongs(song_list) {
  try {
    if (song_list.length > 50) {
      console.log("Too many songs requested (>50)");
      return { success: false, message: "Too many songs requested" };
    }
    const data = await spotify.getTracks(song_list);
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