import { supabase } from "$lib/supabaseClient";

const PAGE_SIZE = 10; // Number of posts per page

export async function GET({ url }) {
  const page = parseInt(url.searchParams.get("page")) || 1;
  const filter = url.searchParams.get("filter") || "all";
  const sort = url.searchParams.get("sort") || "recent";
  let data;
  if (sort == "recent") {
    const { data2, error } = await supabase
      .from("posts")
      .select(`*, likes (profile_id)`)
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (error) {
      console.error("Error fetching posts and likes:", error);
      return new Response(
        JSON.stringify({
          success: false,
          posts: [],
          nextPage: null,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    data = data2;
  }else if (sort === 'popular') {
    // Define the number of items per page
    const PAGE_SIZE = 10; // Adjust this value as needed
  
    // Calculate the range for pagination
    const from = (page - 1) * PAGE_SIZE;
    const to = page * PAGE_SIZE - 1;
  
    try {
      // Fetch posts along with their associated likes and dislikes
      const { data: posts, error, count } = await supabase
        .from('posts')
        .select(`
          *,
          likes (profile_id, isLiked)
        `, { count: 'exact' }) // Enables exact count for pagination
        .order('created_at', { ascending: false }) // Initial ordering by creation date
        .range(from, to); // Apply pagination
  
      // Handle any errors that occur during the fetch
      if (error) {
        console.error('Error fetching posts and likes:', error);
        return new Response(
          JSON.stringify({
            success: false,
            posts: [],
            nextPage: null,
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
  
      // Compute net likes for each post
      const formattedPosts = posts.map(post => {
        // Calculate the number of likes (isLiked = true)
        const likeCount = post.likes.filter(like => like.isLiked).length;
  
        // Calculate the number of dislikes (isLiked = false)
        const dislikeCount = post.likes.filter(like => !like.isLiked).length;
  
        // Compute net likes
        const netLikes = likeCount - dislikeCount;
  
        return {
          ...post,
          likeCount,
          dislikeCount,
          netLikes,
        };
      });
  
      // Sort posts based on netLikes in descending order (most popular first)
      formattedPosts.sort((a, b) => b.netLikes - a.netLikes);
  
      // Determine if there is a next page based on the total count
      const hasMore = to + 1 < count;
  
      // Return the response with sorted posts and pagination info
      return new Response(
        JSON.stringify({
          success: true,
          posts: formattedPosts,
          nextPage: hasMore ? page + 1 : null, // Increment page number if more pages are available
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
  
    } catch (exception) {
      // Handle unexpected exceptions
      console.error('Unexpected error:', exception);
      return new Response(
        JSON.stringify({
          success: false,
          posts: [],
          nextPage: null,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  const postsWithLikeData = data.map((post) => ({
    ...post,
    likes_count: post.likes.length,
  }));

  const hasNextPage = data.length === PAGE_SIZE;
  const nextPage = hasNextPage ? page + 1 : null;

  return new Response(
    JSON.stringify({
      success: true,
      posts: postsWithLikeData ?? [],
      nextPage: nextPage,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
