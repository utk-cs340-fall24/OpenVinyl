<script>
  import Nav from "$lib/nav.svelte";
  import Footer from "$lib/footer.svelte";
  import { supabase } from "$lib/supabaseClient";
  import { user } from "$lib/stores";
  // import { ensureUserProfileExists } from '$lib/utils';
  import { onMount } from "svelte";
  import Sidebar from "$lib/sidebar.svelte";

  onMount(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("current session: ", session)
      if (error) {
        console.error("Error fetching session:", error);
        user.set({ role: 'guest' });
        return;
      }
      
      // await ensureUserProfileExists(session.user.id);

      if (session) {
        // Set user role to 'authenticated' when the session exists
        user.set({ ...session.user, role: 'authenticated' });
      } else {
        // If no session exists, set user as guest
        user.set({ role: 'guest' });
      }
    } catch (e) {
      console.error("Unexpected error during onMount in layout:", e);
      user.set({ role: 'guest' });
    }
  });
  function hideBanner() {
    document.getElementById("banner").style.display = "None";
  }
</script>
<div class="wrapper">
  <div id="banner" class = "banner" ><div>Note: This app is in beta so spotify auth will not work for non-developers
<button class= "warning-button" on:click={hideBanner}>Hide Message</button></div>

  </div>
  <Nav />
  <slot></slot>
  <Footer />
</div>

<style>
  .wrapper {
    background-color: #16181c;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .banner {
    /* height: 40px; */
    display: flex;
    padding-top: 5px;
    padding-bottom: 5px;
    align-content: center;
    text-align: center;
    /* width: 100%; */
    flex-direction: column;
    vertical-align: center;
    background-color: #eed202;
    font-family: "Concert One", sans-serif;
    color: white;
  }
  .warning-button {
    background-color: black;
    color: white;
    border-radius: 5px; 
    font-family: "Concert One", sans-serif;

  }
  .warning-button:hover {
    cursor: pointer;
  }
</style>
