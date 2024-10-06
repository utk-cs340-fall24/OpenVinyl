<script>
    import { onMount } from 'svelte';
    import { followUser, unfollowUser } from '$lib/utils';
    import { supabase } from '$lib/supabaseClient';
  
    export let userId; 
  
    let isFollowing = false;
    let loading = false;
  
    const checkFollowing = async () => {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', supabase.auth.user().id)
        .eq('following_id', userId)
        .single();
  
      if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
        console.error('Error checking follow status:', error.message);
      }
  
      isFollowing = data ? true : false;
    };
  
    onMount(() => {
      checkFollowing();
    });
  
    const toggleFollow = async () => {
      loading = true;
      if (isFollowing) {
        const { success, error } = await unfollowUser(userId);
        if (success) {
          isFollowing = false;
        } else {
          console.error('Failed to unfollow:', error.message);
        }
      } else {
        const { success, error } = await followUser(userId);
        if (success) {
          isFollowing = true;
        } else {
          console.error('Failed to follow:', error.message);
        }
      }
      loading = false;
    };
  </script>
  
  <button on:click={toggleFollow} disabled={loading}>
    {#if loading}
      Loading...
    {:else}
      {#if isFollowing}
        Unfollow
      {:else}
        Follow
      {/if}
    {/if}
  </button>
  
  <style>
    button {
      padding: 8px 16px;
      background-color: var(--button-bg, #007bff);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  
    button:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
  
    button:hover:not(:disabled) {
      background-color: var(--button-hover-bg, #0056b3);
    }
  </style>
  