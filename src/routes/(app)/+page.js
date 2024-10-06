import { supabase } from "$lib/supabaseClient";

const PAGE_SIZE = 10; // Set the number of posts per page
export async function load({ url }) {
  const page = parseInt(url.searchParams.get('page')) || 1; // Get the current page number from the URL
  // console.log("Current page:", page);

  const { data, error } = await supabase
    .from("posts")
    .select(`*, likes (profile_id)`)
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, (page * PAGE_SIZE) - 1);

  if (error) {
    console.error("Error fetching posts and likes:", error);
    return {
      success: false,
      posts: [],
    };
  }

  const postsWithLikeData = data.map(post => ({
    ...post,
    likes_count: post.likes.length,
  }));

  return {
    success: true,
    posts: postsWithLikeData ?? [],
    nextPage: page + 1,  // Prepare for the next page load
  };
}
