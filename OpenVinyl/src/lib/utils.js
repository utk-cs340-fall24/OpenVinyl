import { supabase } from "./supabaseClient";
import { spotify, setAccessToken } from "./spotifyClient";

// Currently this function must be called on any page that uses spotify
export async function authenticateClientCredentials() {
  try {
    if (!spotify.getAccessToken()) {
      const response = await fetch("/api/spotify/token");
      const data = await response.json();
      console.log("data here: ", data);
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
      .from("public.profiles")
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
    const { data } = await spotify.getRecommendations({
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
