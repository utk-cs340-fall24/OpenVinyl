
import { supabase } from '$lib/supabaseClient';

export async function load() {
  const { data: popularSongs, error } = await supabase.rpc('get_popular_songs');

  if (error) {
    console.error('Error fetching popular songs:', error);
    return { popularSongs: [] };
  }

  return {
    popularSongs,
  };
}