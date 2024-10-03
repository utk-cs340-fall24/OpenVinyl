import { supabase } from "$lib/supabaseClient";

export async function load() {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      likes (
        profile_id
      )
    `);

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
    liked_by: post.likes.map(like => like.profile_id)  
  }));
console.log(postsWithLikeData)
  return {
    success: true,
    posts: postsWithLikeData ?? [],
  };
}
