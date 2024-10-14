<script>
  import { onMount, onDestroy } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { followUser, unfollowUser } from "$lib/utils.js"; 
  import { page } from '$app/stores'; 
  import {user } from "$lib/stores"
  let currentUser = null;
    const unsubscribe = user.subscribe(value => {
      currentUser = value;
      // if (currentUser) {
        // checkIfLiked();
      // }
    });
  
    onDestroy(() => {
      unsubscribe();
    });
  let profile = null;
  let isFriend = false;
  let slug = $page.params.slug; 
  
  onMount(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', slug)
      .single();
      
    if (error) {
      console.error('Error fetching user profile:', error);
    } else {
      profile = data;
    }
    console.log("current user", currentUser)
    if (currentUser && currentUser.id) {
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select('*')
        .eq('owner_id', currentUser.id)
        .eq('followed_id', profile.id);
      
      if (followError) {
        console.error('Error fetching follow data:', followError);
      } else if (followData && followData.length > 0) {
        isFriend = true;
      }
    }
  });
  
  async function follow() {
    const userSession = await supabase.auth.getSession();
    const userId = userSession?.data?.session?.user?.id;

    if (userId && profile) {
      const { success, error } = await followUser(profile.id);
      if (success) {
        isFriend = true;
      } else {
        console.error('Error following user:', error.message);
      }
    }
  }

  async function unfollow() {
    const userSession = await supabase.auth.getSession();
    const userId = userSession?.data?.session?.user?.id;

    if (userId && profile) {
      const { success, error } = await unfollowUser(profile.id);
      if (success) {
        isFriend = false;
      } else {
        console.error('Error unfollowing user:', error.message);
      }
    }
  }
</script>

{#if profile}
  <div class="profile-container">
    <div class="profile-header">
      <img class="profile-avatar" src={profile.avatar_url || 'https://placehold.co/150'} alt={`${profile.username}'s avatar`} />
      <div class="profile-info">
        <h1 class="profile-username">{profile.username}</h1>
        <p class="profile-bio">{profile.bio || 'No bio available.'}</p>
        <div class="profile-actions">
          <!-- {#if profile.id !== $user?.id} Prevent users from following themselves -->
            {#if isFriend}
              <button class="unfollow-button" on:click={unfollow}>Unfollow</button>
            {:else}
              <button class="follow-button" on:click={follow}>Follow</button>
            {/if}
          <!-- {/if} -->
        </div>
      </div>
    </div>

    <div class="profile-stats">
      <div class="stat">
        <span class="stat-number">{profile.posts_count || 0}</span>
        <span class="stat-label">Posts</span>
      </div>
      <div class="stat">
        <span class="stat-number">{profile.followers_count || 0}</span>
        <span class="stat-label">Followers</span>
      </div>
      <div class="stat">
        <span class="stat-number">{profile.following_count || 0}</span>
        <span class="stat-label">Following</span>
      </div>
    </div>

    <!-- Optional: Display User's Posts -->
    <div class="user-posts">
      <h2>Recent Posts</h2>
      <!-- {#each profile.posts as post (post.id)}
        <Post
          logged_in_user_uuid={currentUser?.id}
          uuid={post.profile_id}
          rating={post.rating}
          desc={post.content}
          song_id={post.song_id}
          song_title={post.song?.title}
          song_artist={post.song?.artist}
          song_image={post.song?.image}
          likes_cnt={post.likes_count}
          post_id={post.id}
        />
      {/each}
      {#if profile.posts.length === 0}
        <p class="no-posts">This user hasn't made any posts yet.</p>
      {/if} -->
    </div>
  </div>
{:else}
  <p class="loading">Loading profile...</p>
{/if}

<style>
  /* Base Styles */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    background-color: #121212; /* Dark background consistent with main page */
    color: #f3f1f1;
    font-family: 'Concert One', sans-serif;
  }

  .profile-container {
    max-width: 1000px;
    margin: 40px auto;
    padding: 20px;
    background-color: #1d1f25;
    color: #f3f1f1;
    border: 1px solid #26282c;
    border-radius: 8px;
  }

  .profile-header {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
  }

  .profile-avatar {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 30px;
    border: 3px solid #26282c;
  }

  .profile-info {
    flex: 1;
  }

  .profile-username {
    font-size: 2rem;
    margin: 0 0 10px 0;
    color: #e4e4e4;
  }

  .profile-bio {
    font-size: 1.1rem;
    color: #b9b9b9;
    margin-bottom: 20px;
  }

  .profile-actions {
    display: flex;
    gap: 10px;
  }

  .follow-button,
  .unfollow-button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;
  }

  .follow-button {
    background-color: #007bff;
    color: #ffffff;
  }

  .follow-button:hover {
    background-color: #0056b3;
  }

  .unfollow-button {
    background-color: #dc3545;
    color: #ffffff;
  }

  .unfollow-button:hover {
    background-color: #c82333;
  }

  .profile-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 30px;
    padding: 20px;
    background-color: #2a2d35;
    border-radius: 8px;
  }

  .stat {
    text-align: center;
  }

  .stat-number {
    display: block;
    font-size: 1.5rem;
    font-weight: bold;
    color: #ffc107;
  }

  .stat-label {
    font-size: 1rem;
    color: #a9a9a9;
  }

  .user-posts {
    margin-top: 30px;
  }

  .user-posts h2 {
    margin-bottom: 20px;
    color: #ffffff;
    font-size: 1.8rem;
  }

  .no-posts {
    color: #a9a9a9;
    font-style: italic;
    text-align: center;
  }

  .loading {
    text-align: center;
    color: #a9a9a9;
    font-size: 1.2rem;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .profile-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .profile-avatar {
      margin-right: 0;
      margin-bottom: 20px;
      width: 120px;
      height: 120px;
    }

    .profile-stats {
      flex-direction: column;
      gap: 15px;
    }

    .user-posts h2 {
      font-size: 1.5rem;
    }
  }
</style>
