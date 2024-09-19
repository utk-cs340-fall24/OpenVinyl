import { supabase } from "./supabaseClient";

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

async function updateUsername(profile_id, username) {
  try {
    const { data, error } = await supabase
      .from("public.profiles")
      .update({username: username})
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
