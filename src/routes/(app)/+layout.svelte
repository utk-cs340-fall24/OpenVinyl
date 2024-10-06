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
      console.log("Current session:", session);
      const providers = session.user.app_metadata.providers;

      if (providers && providers.includes('spotify')) {
        // Fetch user's profile from the database to check if they already have an access token
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('spotify_access_token, spotify_refresh_token, spotify_token_expires')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError.message);
          return;
        }

        console.log("User profile:", profile);

        let { spotify_access_token, spotify_refresh_token, spotify_token_expires } = profile;

        // Corrected Token Expiration Check
        const currentUtcTime = new Date().toISOString();
const tokenExpirationTime = profile?.spotify_token_expires;
const currTime = new Date(currentUtcTime);
const expTime = new Date(tokenExpirationTime);

const differenceInMillis = currTime - expTime;


      if (spotify_token_expires && differenceInMillis > 0) {
          console.log("Spotify access token has expired. Refreshing token...");
          
          // Refresh the Spotify token
          const refreshResponse = await fetch("/refresh-spotify-token", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

          const refreshData = await refreshResponse.json();

          if (refreshData.success) {
            spotify_access_token = refreshData.access_token;
            const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000); // Set new expiration

            // Update Supabase with the new access token and expiration
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                spotify_access_token: spotify_access_token,
                spotify_token_expires: newExpiresAt.toISOString(),
              })
              .eq('id', user.id);

            if (updateError) {
              console.error("Error updating access token:", updateError.message);
              return;
            } else {
              console.log('Spotify tokens successfully updated.');
              // Optionally, you can refresh the page or reinitialize the player here
              window.location.reload(); // Reload to reinitialize with new token
            }
          } else {
            console.error("Error refreshing access token:", refreshData.message);
            return;
          }
        } else if (!spotify_access_token) {
          // If no access token, generate and store one
          console.log('Spotify access token does not exist. Storing new token...');
          
          const providerToken = session.provider_token;
          const refreshToken = session.provider_refresh_token;
          const expiresIn = session.expires_in;

          if (providerToken && refreshToken && expiresIn) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                spotify_access_token: providerToken,
                spotify_refresh_token: refreshToken,
                spotify_token_expires: new Date(Date.now() + expiresIn * 1000).toISOString(),
              })
              .eq('id', user.id);

            if (updateError) {
              console.error('Error updating profile with Spotify tokens:', updateError.message);
            } else {
              console.log('Spotify tokens successfully stored.');
              window.location.href = '/'; // Redirect or reload after storing tokens
            }
          } else {
            console.log('Spotify tokens not available in the session.');
          }
        } else {
          console.log('Spotify access token is valid and exists.');
          // Optionally, you can initialize the Spotify player here if not already done
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
