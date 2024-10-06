<script>
  import Nav from '$lib/nav.svelte';
  import Footer from '$lib/footer.svelte';
  import { onMount } from 'svelte';
  import { supabase } from "$lib/supabaseClient.js";

  onMount(async () => {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error fetching session:", error);
      return;
    }

    if (session) {
      const user = session.user;
      console.log("User:", user);

      // Check if the logged-in provider is Spotify
      console.log("session: ", session)
      if (session.user.app_metadata.provider === 'spotify') {
        // Fetch user's profile from the database to check if they already have an access token
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('spotify_access_token')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError.message);
          return;
        }
        console.log(profile)
        if (!profile.spotify_access_token) {
          // If no access token, generate and store one
          const providerToken = session.provider_token;
          const refreshToken = session.provider_refresh_token;
          const expiresIn = session.expires_in;
          console.log("three: ", providerToken, refreshToken, expiresIn)
          console.log("profile is: ", profile)
          if (providerToken && refreshToken && expiresIn) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                spotify_access_token: providerToken,
                spotify_refresh_token: refreshToken,
                spotify_token_expires: new Date(Date.now() + expiresIn * 1000),
              })
              .eq('id', user.id);

            if (updateError) {
              console.error('Error updating profile with Spotify tokens:', updateError.message);
            } else {
              console.log('Spotify tokens successfully stored.');
              window.location.href = '/';
            }
          } else {
            console.log('Spotify tokens not available in the session.');
          }
        } else {
          console.log('Spotify access token already exists.');
        }
      }
    } else {
      console.log('No active session.');
    }
  });
</script>

<div class="wrapper">
  <Nav />
  <slot></slot>
  <Footer />
</div>

<style>
  .wrapper {
    background-color: #16181c;
  }
</style>
