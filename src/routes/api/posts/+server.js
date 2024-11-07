import { supabase } from "$lib/supabaseClient";

const PAGE_SIZE = 10; // Number of posts per page

export async function GET({ url }) {
  console.log(url);

  // Extract query parameters with default values
  const page = parseInt(url.searchParams.get("page")) || 1;
  const filter = url.searchParams.get("filter") || "all"; // e.g., "all" or "following"
  const sort = url.searchParams.get("sort") || "recent";
  const userId = url.searchParams.get("user_id") || null; // User ID passed as a query parameter
  
  // Initialize data and totalCount variables
  let data = [];
  let totalCount = 0;

  // Initialize an array to hold followed user IDs if filtering by following
  let followedUserIds = [];

  // Handle filtering based on following
  if (filter === "following") {
    if (!userId) {
      // If user_id is not provided, return an error
      return new Response(
        JSON.stringify({
          success: false,
          message: "user_id query parameter is required for following filter.",
          posts: [],
          nextPage: null,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      // Fetch the list of followed user IDs for the specified user_id
      const { data: followingData, error: followingError } = await supabase
        .from("follows") // Ensure this matches your actual table name
        .select("followed_id")
        .eq("owner_id", userId);

      if (followingError) {
        console.error("Error fetching followed users:", followingError);
        return new Response(
          JSON.stringify({
            success: false,
            message: "Error fetching followed users.",
            posts: [],
            nextPage: null,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      followedUserIds = followingData.map((f) => f.followed_id);

      if (followedUserIds.length === 0) {
        // If the user follows no one, return an empty list
        return new Response(
          JSON.stringify({
            success: true,
            posts: [],
            nextPage: null,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (exception) {
      console.error("Unexpected error fetching followed users:", exception);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unexpected error fetching followed users.",
          posts: [],
          nextPage: null,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  if (sort === "recent") {
    // Handling "recent" sort: Fetch paginated recent posts
    const from = (page - 1) * PAGE_SIZE;
    const to = page * PAGE_SIZE - 1;

    try {
      let query = supabase
        .from("posts")
        .select(`*, likes (profile_id, isLiked)`, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (filter === "following" && followedUserIds.length > 0) {
        query = query.in("profile_id", followedUserIds); // Ensure "profile_id" is the correct field for author
      }

      const { data: recentPosts, error, count } = await query;

      if (error) {
        console.error("Error fetching recent posts and likes:", error);
        return new Response(
          JSON.stringify({
            success: false,
            message: "Error fetching recent posts.",
            posts: [],
            nextPage: null,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      data = recentPosts;
      totalCount = count;
    } catch (exception) {
      console.error("Unexpected error fetching recent posts:", exception);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unexpected error fetching recent posts.",
          posts: [],
          nextPage: null,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } else if (sort === "popular") {
    // Handling "popular" sort: Fetch all relevant posts, compute net likes, sort, and paginate
    try {
      // Build the base query
      let query = supabase
        .from("posts")
        .select(`*, likes (profile_id, isLiked)`, { count: "exact" });

      if (filter === "following" && followedUserIds.length > 0) {
        query = query.in("profile_id", followedUserIds); // Ensure "profile_id" is the correct field for author
      }

      // Execute the query without pagination
      const { data: allPosts, error, count } = await query;

      if (error) {
        console.error("Error fetching all posts and likes for popular sort:", error);
        return new Response(
          JSON.stringify({
            success: false,
            message: "Error fetching popular posts.",
            posts: [],
            nextPage: null,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // Compute net likes for each post
      const formattedPosts = allPosts.map((post) => {
        const likeCount = post.likes.filter((like) => like.isLiked).length;
        const dislikeCount = post.likes.filter((like) => !like.isLiked).length;
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

      // Calculate pagination indices
      const from = (page - 1) * PAGE_SIZE;
      const to = page * PAGE_SIZE;

      // Slice the sorted array to get the current page's posts
      const paginatedPosts = formattedPosts.slice(from, to);

      data = paginatedPosts;
      totalCount = formattedPosts.length;
    } catch (exception) {
      console.error("Unexpected error processing popular posts:", exception);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unexpected error processing popular posts.",
          posts: [],
          nextPage: null,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } else if (sort === "asc" || sort === "desc") {
    // Handling "rating" sort: Fetch paginated posts sorted by rating ascending or descending
    const sortOrder = sort === "asc" ? "asc" : "desc";

    const from = (page - 1) * PAGE_SIZE;
    const to = page * PAGE_SIZE - 1;

    try {
      let query = supabase
        .from("posts")
        .select(`*, likes (profile_id, isLiked)`, { count: "exact" })
        .order("rating", { ascending: sortOrder === "asc" })
        .range(from, to);

      if (filter === "following" && followedUserIds.length > 0) {
        query = query.in("profile_id", followedUserIds); // Ensure "profile_id" is the correct field for author
      }

      const { data: ratingSortedPosts, error, count } = await query;

      if (error) {
        console.error("Error fetching rating-sorted posts and likes:", error);
        return new Response(
          JSON.stringify({
            success: false,
            message: "Error fetching rating-sorted posts.",
            posts: [],
            nextPage: null,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      data = ratingSortedPosts;
      totalCount = count;
    } catch (exception) {
      console.error("Unexpected error fetching rating-sorted posts:", exception);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unexpected error fetching rating-sorted posts.",
          posts: [],
          nextPage: null,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } else {
    // Handle other sorting options if necessary
    console.warn(`Unknown sort option: ${sort}. Defaulting to recent.`);

    // Default to recent sort if an unknown sort option is provided
    const from = (page - 1) * PAGE_SIZE;
    const to = page * PAGE_SIZE - 1;

    try {
      let query = supabase
        .from("posts")
        .select(`*, likes (profile_id, isLiked)`, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (filter === "following" && followedUserIds.length > 0) {
        query = query.in("profile_id", followedUserIds); // Ensure "profile_id" is the correct field for author
      }

      const { data: unknownSortPosts, error, count } = await query;

      if (error) {
        console.error("Error fetching posts and likes with unknown sort:", error);
        return new Response(
          JSON.stringify({
            success: false,
            message: "Error fetching posts with unknown sort.",
            posts: [],
            nextPage: null,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      data = unknownSortPosts;
      totalCount = count;
    } catch (exception) {
      console.error("Unexpected error with unknown sort option:", exception);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unexpected error with unknown sort option.",
          posts: [],
          nextPage: null,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Prepare the posts with additional like data
  const postsWithLikeData = data.map((post) => ({
    ...post,
    likes_count: post.likes.length,
    // Include computed fields for popular sort
    ...(sort === "popular" && {
      dislikeCount: post.dislikeCount,
      netLikes: post.netLikes,
    }),
  }));

  // Determine if there is a next page
  let hasNextPage = false;

  if (sort === "popular") {
    // For popular sort, totalCount is the total number of filtered and sorted posts
    hasNextPage = page * PAGE_SIZE < totalCount;
  } else if (sort === "asc" || sort === "desc") {
    // For rating sort, totalCount is the total number of filtered posts
    hasNextPage = page * PAGE_SIZE < totalCount;
  } else {
    // For recent sort, totalCount is the total number of filtered posts
    hasNextPage = page * PAGE_SIZE < totalCount;
  }

  const nextPage = hasNextPage ? page + 1 : null;

  // Return the final response
  return new Response(
    JSON.stringify({
      success: true,
      posts: postsWithLikeData ?? [],
      nextPage: nextPage,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}