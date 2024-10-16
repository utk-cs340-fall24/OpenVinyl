
import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const { slug } = params; 

  const { data: reviews, error: reviewsError } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (
        username,
        avatar_url
      )
    `)
    .eq('song_id', slug)
    .order('created_at', { ascending: false });

  if (reviewsError) {
    console.error('Error fetching reviews:', reviewsError);
    throw error(500, 'Error fetching reviews');
  }

  return {
    song_id: slug,
    reviews
  };
}