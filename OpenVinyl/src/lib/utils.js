import { supabase } from "./supabaseClient";
import { spotify } from "./spotifyClient";

/*
 * profile_id: required
 * title: optional (default is '')
 * content: optional (default is '')
 * song_id: required (song 'id' field from spotify api)
 * rating: required (int from 1 to 10 inclusive, no half scores yet)
 */
async function createPost(profile_id, title, content, song_id, rating) {
  try {
    const { data, error } = await supabase.from("public.posts").insert({
      profile_id: profile_id,
      title: title,
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
async function updateUsername(profile_id, username) {
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
async function getRecommendationsFromSong(song_id) {
  try {
    const { data } = spotify.getRecommendations({
      seed_tracks: song_id,
    });
    if (data) {
      console.log("Got recommendations successfully", data);
      return { success: true, data };
    }
    console.log("Failed to fetch recommendations");
    return {success: false, data};
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: err.message };
  }
}
