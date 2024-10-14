<script>
  import { supabase } from '$lib/supabaseClient.js';
  import '@fortawesome/fontawesome-free/css/all.css';
  import '@fortawesome/fontawesome-free/js/all';
  import {signInWithGoogle, signInWithSpotify} from "$lib/utils.js";
  let email;
  let pass;

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        window.location.href = '/'; // redirect to account page
    }
  });

  async function signIn() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pass,
    })
    console.log("data: ", data);
    console.log("error: ", error);

  }
</script>

<div class="container">
  <div class="login-window">
    <h1>Welcome Back!</h1>
    <p>Enter your information below</p>
  
    <input type="email" name="" id="email" placeholder="email" bind:value={email}>
    <input type="password" name="" id="pass" placeholder="password" bind:value={pass}>
    <div class="emailbuttons">
      <button class="inputbox" on:click={signIn}>Sign In</button>
    </div>
    <hr class="hr-text" data-content="Or continue with">
    <div class="oauthbuttons">
      <button class="google" on:click={signInWithGoogle}>
        <i class="fa-brands fa-google"></i> Google
      </button>
      <button class="spotify" on:click={signInWithSpotify}>
        <i class="fa-brands fa-spotify"></i> Spotify
      </button>
      <a href="\auth\signup">
        <button class="inputbox"><i class="fa-solid fa-envelope"></i> Email</button>
      </a>
    </div>
  </div>
</div>

<style>
  * {
    box-sizing: border-box;
    font-family: Arial, Helvetica, sans-serif;
  }

  .container {
    background-color: #f3f4f6;
    height: 100vh;
    overflow: hidden;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .container .login-window {
    height: 50vh;
    max-width: 30vw;
    background-color: #fff;
    box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.1);
    border-radius: 8px;
    padding: 2.5em;
    text-align: center;
  }

  .login-window h1 {
    text-align: left;
    margin: 0;
  }

  .login-window p {
    text-align: left;
    margin: 0 0 1em 0;
    opacity: 0.3;
  }

  .login-window input {
    width: 100%;
    padding: 12px 20px;
    margin: 8px 0;
    display: inline-block;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }

  .login-window .emailbuttons button {
    width: 100%;
    height: 2.5em;
    font-size: 18px;
  }

  button:hover {
    cursor: pointer;
  }

  .fa-google {
    color: White;
  }

  .login-window .oauthbuttons button {
    width: 32%;
    height: 3em;
  }

  .hr-text {
    line-height: 1em;
    position: relative;
    outline: 0;
    border: 0;
    color: black;
    text-align: center;
    height: 1.5em;
    opacity: .5;
  }
  
  .hr-text::before {
    content: '';
    background: linear-gradient(to right, transparent, #818078, transparent);
    position: absolute;
    left: 0;
    top: 50%;
    width: 100%;
    height: 1px;
  }
  
  .hr-text::after {
    content: attr(data-content);
    position: relative;
    display: inline-block;
    color: black;
    padding: 0 .5em;
    line-height: 1.5em;
    color: #818078;
    background-color: #fcfcfa;
  }
</style>

