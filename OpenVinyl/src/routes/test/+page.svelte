<script>
    import { supabase } from '$lib/supabaseClient';
  
    const signInWithGoogle = async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) {
        console.error('Error during sign in:', error.message);
      }
    };
  </script>
  
  <button on:click={signInWithGoogle}>Sign in with Google</button>
  