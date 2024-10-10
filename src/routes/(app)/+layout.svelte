<script>
  import Nav from "$lib/nav.svelte";
  import Footer from "$lib/footer.svelte";
  import { supabase } from "$lib/supabaseClient";
  import { user } from "$lib/stores";
  // import { ensureUserProfileExists } from '$lib/utils';
  import { onMount } from "svelte";

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
</script>
<div class="wrapper">
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
</style>
