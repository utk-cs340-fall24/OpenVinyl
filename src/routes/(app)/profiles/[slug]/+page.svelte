<script>
    import { onMount } from "svelte";
    import { supabase } from "$lib/supabaseClient";
    import { followUser, unfollowUser } from "$lib/utils"; // Import the follow/unfollow functions
    import { page } from '$app/stores'; // Import page store to get URL slug
  
    let profile = null;
    let isFriend = false;
    let slug = $page.params.slug; // Get the slug (e.g., username) from the URL
    
    onMount(async () => {
      // Fetch the user's profile based on the slug
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
  
      // Check if the user is already a friend
      const userSession = await supabase.auth.getSession();
      const userId = userSession?.data?.session?.user?.id;
  
      if (userId && profile) {
        const { data: followData } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', userId)
          .eq('following_id', profile.id);
        
        if (followData && followData.length > 0) {
          isFriend = true;
        }
      }
    });
  
    // Function to follow the user
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
  
    // Function to unfollow the user
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
      <h1>{profile.username}'s Profile</h1>
      <p>Email: {profile.email}</p>
      <p>Bio: {profile.bio || 'No bio available'}</p>
      
      {#if isFriend}
        <button on:click={unfollow}>Unfollow</button>
      {:else}
        <button on:click={follow}>Follow</button>
      {/if}
    </div>
  {:else}
    <p>Loading profile...</p>
  {/if}
  
  <style>
    .profile-container {
      padding: 20px;
      background-color: #2c2f34;
      color: white;
      border-radius: 8px;
      max-width: 600px;
      margin: 0 auto;
    }
  
    button {
      background-color: #007bff;
      border: none;
      padding: 10px 15px;
      color: white;
      border-radius: 5px;
      cursor: pointer;
    }
  
    button:disabled {
      background-color: grey;
    }
  </style>
  