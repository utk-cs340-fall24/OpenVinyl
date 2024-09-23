<!-- <script src="https://accounts.google.com/gsi/client" async></script> -->

<script>
  import { supabase } from '$lib/supabase.js';

  let email;
  let pass;

  async function signUp() {
    console.log("email: ", email,"pass: ", pass);
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: pass,
        options: {
            emailRedirectTo: 'http://localhost:5173'
        }
    })
    console.log("data: ", data);
    console.log("error: ", error);
  }
</script>

<h1>Login</h1>

<span>Sign in</span>
<input type="email" name="" id="email" placeholder="email" bind:value={email}>
<input type="password" name="" id="pass" placeholder="password" bind:value={pass}>
<button id="esignin">Sign-in with email</button>
<button id="esignup" on:click={signUp}>Sign-up with email</button>
<!-- <div class="pass-separator">
    <hr>
    <span>or continue with</span>
    <hr>
</div>
<div class="oauth">
    <button id="github"><i class="fa-brands fa-github"></i> Github</button>
    <button id="google">Sign-in with Google</button>
</div> -->

<!-- <div id="g_id_onload"
    data-client_id="330345854773-715jilr6il1dsmj6brh76q060cn9t3an.apps.googleusercontent.com"
    data-context="signin"
    data-ux_mode="popup"
    data-callback="handleSignInWithGoogle"
    data-auto_select="true"
    data-itp_support="true">
</div>

<div class="g_id_signin"
    data-type="standard"
    data-shape="rectangular"
    data-theme="outline"
    data-text="signin_with"
    data-size="large"
    data-logo_alignment="left">
</div> -->



