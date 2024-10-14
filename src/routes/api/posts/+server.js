import { supabase } from '$lib/supabaseClient';

const PAGE_SIZE = 10; // Number of posts per page

export async function GET({ url }) {
  const page = parseInt(url.searchParams.get('page')) || 1;

  const { data, error } = await supabase
    .from("posts")
    .select(`*, likes (profile_id)`)
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, (page * PAGE_SIZE) - 1);

  if (error) {
    console.error("Error fetching posts and likes:", error);
    return new Response(JSON.stringify({
      success: false,
      posts: [],
      nextPage: null,
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const postsWithLikeData = data.map(post => ({
    ...post,
    likes_count: post.likes.length,
  }));

  const hasNextPage = data.length === PAGE_SIZE;
  const nextPage = hasNextPage ? page + 1 : null;

  return new Response(JSON.stringify({
    success: true,
    posts: postsWithLikeData ?? [],
    nextPage: nextPage,
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
