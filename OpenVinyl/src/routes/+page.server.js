import { supabase } from "$lib/supabaseClient";

export async function load() {
  const { data } = await supabase.from("posts_dummy").select();
  return {
    posts_dummy: data ?? [],
  };
}