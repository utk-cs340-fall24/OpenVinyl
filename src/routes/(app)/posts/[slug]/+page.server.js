// src/routes/posts/[slug]/+page.server.js

import { supabase } from '$lib/supabaseClient';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const { slug } = params; // Assuming you're using 'slug' as post_id
console.log(slug)
  // Fetch the post along with the creator's profile
  const { data: post, error } = await supabase
  .from('posts')
  .select(`
    id,
    profile_id,
    content,
    song_id,
    rating,
    created_at,
    updated_at,
    profiles(username)  -- Include related profile data
  `)
  .eq('id', slug)  // Ensure 'slug' corresponds to 'id'
  .single();

console.log("error: ", error);

  if (error) {
    return {
      status: error.status || 500,
      error: new Error(error.message || 'Failed to fetch post')
    };
  }



  // Fetch comments related to the post (assuming you have a comments table)
  
  const { data: comments, error: commentsError } = await supabase
  .from('comments')
  .select(`
    id,
    profile_id,
    comment,
    created_at,
    profiles(username)
  `)
  .eq('post_id', slug)
  .order('created_at', { ascending: true });

  if (commentsError) {
    console.error('Error fetching comments:', commentsError);
  }

  return {
    post,
    comments: comments || []
  };
}
