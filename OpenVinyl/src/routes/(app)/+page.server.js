import { supabase } from "$lib/supabaseClient";

export async function load() {
  const { data } = await supabase.from("posts").select();
  return {
    success: true,
    posts: data ?? [],
  };
}
