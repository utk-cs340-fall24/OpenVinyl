<!-- src/routes/spotify-callback/+page.svelte -->
<script>
    import { supabase } from '$lib/supabaseClient';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
  
    let loading = true;
    let errorMessage = '';
  
    async function handleSpotifyCallback() {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
  
      if (!code) {
        console.error('No authorization code present');
        errorMessage = 'No authorization code found. Please try signing in again.';
        loading = false;
        return;
      }
  
      try {
        // Make a request to your Spotify callback API
        const response = await fetch(`/spotify-callback?code=${code}`);
        const data = await response.json();
  
        if (data.success) {
          const { access_token, refresh_token, expires_in } = data;
  
          // Get the current user session to retrieve the user ID
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
          if (sessionError || !session) {
            console.error('Error fetching session or no session found:', sessionError);
            errorMessage = 'Authentication session not found. Please sign in again.';
            loading = false;
            return;
          }
  
          const user = session.user;
  
          // Store the tokens in Supabase or local storage as needed
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              spotify_access_token: access_token,
              spotify_refresh_token: refresh_token,
              spotify_token_expires: new Date(Date.now() + expires_in * 1000)
            })
            .eq('id', user.id);
  
          if (updateError) {
            console.error('Error updating Supabase profile:', updateError);
            errorMessage = 'Failed to update your profile with Spotify credentials.';
            loading = false;
          } else {
            console.log('Tokens successfully updated in Supabase');
            // Redirect to a different page after success
            goto('/'); // Replace '/' with the desired route
          }
        } else {
          console.error('Error during Spotify authentication:', data.message);
          errorMessage = data.message || 'Spotify authentication failed.';
          loading = false;
        }
      } catch (error) {
        console.error('Unexpected error during Spotify callback handling:', error);
        errorMessage = 'An unexpected error occurred. Please try again.';
        loading = false;
      }
    }
  
    // Call the function on component mount
    onMount(() => {
      handleSpotifyCallback();
    });
  </script>
  
  <div class="container">
    {#if loading}
      <div class="spinner-container">
        <div class="spinner"></div>
        <p class="message">Connecting to Spotify...</p>
      </div>
    {:else if errorMessage}
      <div class="error-container">
        <p class="error-message">{errorMessage}</p>
        <a href="/auth/signin" class="retry-button">Try Again</a>
      </div>
    {/if}
  </div>
  
  <style>
    /* Container to center content */
    .container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh; /* Full viewport height */
      background-color: #1d1f25; /* Dark background */
      color: #f3f1f1; /* Light text color */
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
  
    /* Spinner Container */
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  
    /* CSS Spinner */
    .spinner {
      border: 8px solid rgba(255, 255, 255, 0.1);
      border-top: 8px solid #1db954; /* Spotify Green */
      border-radius: 50%;
      width: 60px;
      height: 60px;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
  
    /* Spinner Animation */
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  
    /* Loading Message */
    .message {
      font-size: 1.2rem;
      text-align: center;
    }
  
    /* Error Container */
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  
    /* Error Message */
    .error-message {
      color: #ff4d4f; /* Red color for errors */
      font-size: 1.2rem;
      margin-bottom: 20px;
      text-align: center;
    }
  
    /* Retry Button */
    .retry-button {
      padding: 10px 20px;
      background-color: #1db954; /* Spotify Green */
      color: #fff;
      text-decoration: none;
      border-radius: 25px;
      font-size: 1rem;
      transition: background-color 0.3s ease;
    }
  
    .retry-button:hover {
      background-color: #17a44c; /* Darker Green on Hover */
    }
  
    /* Responsive Design */
    @media (max-width: 480px) {
      .spinner {
        width: 40px;
        height: 40px;
        border-width: 6px;
      }
  
      .message,
      .error-message {
        font-size: 1rem;
      }
  
      .retry-button {
        padding: 8px 16px;
        font-size: 0.9rem;
      }
    }
  </style>
  