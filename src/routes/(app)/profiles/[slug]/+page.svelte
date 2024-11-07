<script>
  import { onMount, onDestroy } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { followUser, unfollowUser } from "$lib/utils.js"; 
  import { page } from '$app/stores'; 
  import { user } from "$lib/stores"
  import Post from "$lib/post.svelte";
  import { spotify } from "$lib/spotifyClient.js";
  import { authenticateClientCredentials } from "$lib/utils";
  import { sidebarHidden } from "$lib/stores";
  
  let currentUser = null;
  let unsubscribe;
  let profile = null;
  let isFriend = false;
  let slug = $page.params.slug; 
  let posts = [];
  let songError = null;
  let session_uuid;
  let songData = {};
  let loading = true;
  let follower_count = 0;
  let following_count = 0;

  $: {
    unsubscribe = user.subscribe(value => {
      currentUser = value;
      session_uuid = currentUser?.id;
      console.log(session_uuid);
    });
  }

  onDestroy(() => {
    unsubscribe();
  });

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
      posts = await getUserPosts(profile.id);
    }
    try {
      await authenticateClientCredentials();
      const songIds = posts.map((post) => post.song_id);
  
      const songResponse = await spotify.getTracks(songIds);
  
      if (songResponse && songResponse.tracks) {
        songResponse.tracks.forEach((track) => {
          if (track) {
            songData[track.id] = {
              title: track.name,
              artist: track.artists.map((artist) => artist.name).join(", "),
              image_url:
                track.album.images[0]?.url || "https://placehold.co/300",
            };
          }
        });
      } else {
        console.log("No tracks found for the given IDs.");
      }
    } catch (err) {
      console.error("Error fetching song details:", err);
      songError = err.message;
    } finally {
      loading = false;
    }
    if(profile && profile.id) {
      const { data: followData, error: followError } = await supabase
      .from('follows')
      .select('*')
      
      if (followError) {
        console.error('Error fetching follow data:', followError);
      } else if (followData && followData.length > 0) {
        console.log(followData);
        follower_count = followData.filter((follow) => follow.followed_id === profile.id).length;
        following_count = followData.filter((follow) => follow.owner_id === profile.id).length;
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

  async function getUserPosts(userId) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
    return data;
  }
</script>

{#if profile}
  <div class="profile-container { $sidebarHidden ? '' : 'sidebarHidden' }">
    <div class="profile-header">
      <img class="profile-avatar" src={profile.avatar_url || 'https://placehold.co/150'} alt={`${profile.username}'s avatar`} />
      <div class="profile-info">
        <h1 class="profile-username">{profile.username}</h1>
        <p class="profile-bio">{profile.bio || 'No bio available.'}</p>
        <div class="profile-actions">
          {#if profile.id !== $user?.id}
            {#if isFriend}
              <button class="unfollow-button" on:click={unfollow}>Unfollow</button>
            {:else}
              <button class="follow-button" on:click={follow}>Follow</button>
            {/if}
          {/if}

          {#if profile.id == $user?.id} 
            <a href="/account">
              <button class="settings">Settings</button>
            </a>
          {/if}
        </div>
      </div>
    </div>

    <div class="profile-stats">
      <div class="stat">
        <span class="stat-number">{posts.length || 0}</span>
        <span class="stat-label">Posts</span>
      </div>
      <div class="stat">
        <span class="stat-number">{follower_count || 0}</span>
        <span class="stat-label">Followers</span>
      </div>
      <div class="stat">
        <span class="stat-number">{following_count || 0}</span>
        <span class="stat-label">Following</span>
      </div>
    </div>

    <!-- Optional: Display User's Posts -->
    <div class="user-posts">
      <h2>Recent Posts</h2>
      {#each posts as post (post.id)}
        <Post
        logged_in_user_uuid={session_uuid}
        uuid={post.profile_id}
        rating={post.rating}
        desc={post.content}
        song_id={post.song_id}
        song_title={songData[post.song_id]?.title}
        song_artist={songData[post.song_id]?.artist}
        song_image={songData[post.song_id]?.image_url}
        post_id={post.id}
        />
      {/each}
      {#if posts.length === 0}
        <p class="no-posts">This user hasn't made any posts yet.</p>
      {/if}
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

  .profile-container {
    width: 70%;
    margin: 40px auto;
    padding: 20px;
    background-color: #1d1f25;
    color: #f3f1f1;
    border: 1px solid #26282c;
    border-radius: 8px;
    transition: width 0.5s ease-in-out, transform 0.5s ease-in-out;
    transform: translate(15%, 0); 
  }

  .profile-container.sidebarHidden {
    width: 80%; 
    transform: translate(0, 0); 
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

  .settings,
  .follow-button,
  .unfollow-button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;
  }

  .settings,
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
    .profile-container {
      margin: 20px 40px;
    }

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
