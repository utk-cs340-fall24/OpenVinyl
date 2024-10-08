import { supabase } from "$lib/supabaseClient";

const PAGE_SIZE = 10; 
export async function load({ url }) {
  const page = parseInt(url.searchParams.get('page')) || 1; // Get the current page number from the URL

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
      nextPage: null,
    };
  }

  const postsWithLikeData = data.map(post => ({
    ...post,
    likes_count: post.likes.length,
  }));

  // Determine if there's a next page
  const hasNextPage = data.length === PAGE_SIZE;
  const nextPage = hasNextPage ? page + 1 : null;

  return {
    success: true,
    posts: postsWithLikeData ?? [],
    nextPage: nextPage,  // Prepare for the next page load or null if no more pages
  };
}
