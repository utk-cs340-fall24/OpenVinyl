<script>
  import { supabase } from '$lib/supabaseClient.js';
  import logo from '$lib/logo.svg';
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
    <a href="/" class="back"><i class="fa-solid fa-arrow-left"></i> Back</a>
    <a href="/"><img src={logo} alt="logo" class="logo"></a>
    <h1>Welcome Back!</h1>
    <p>Enter your information below</p>
  
    <input type="email" name="" id="email" placeholder="email" bind:value={email}>
    <input type="password" name="" id="pass" placeholder="password" bind:value={pass}>
    <div class="emailbuttons">
      <button class="inputbox" on:click={signIn}>Sign In</button>
    </div>
    <hr class="hr-text" data-content="Or continue with">
    <div class="oauthbuttons">
      <button class="google oauth-button" on:click={signInWithGoogle}>
        <i class="fa-brands fa-google"></i> Google
      </button>
      <button class="spotify oauth-button" on:click={signInWithSpotify}>
        <i class="fa-brands fa-spotify"></i> Spotify
      </button>
      <a href="\auth\signup">
        <button class="email oauth-button">
          <i class="fa-solid fa-envelope"></i> Email
        </button>
      </a>
    </div>
  </div>
</div>

<style>
  * {
    box-sizing: border-box;
    font-family: Arial, Helvetica, sans-serif;
  }

  button {
    white-space: nowrap;
  }

  .container {
    background-color: #121212;
    height: 100vh;
    overflow: hidden;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .container .login-window {
    max-height: 80vh;
    height: auto;
    overflow-y: auto;
    max-width: 30vw;
    background-color: #1D1F25;
    box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.1);
    border-radius: 8px;
    padding: 2.5em;
    text-align: center;
  }

  .container .login-window .back {
    text-align: left !important;
    display: block;
    text-decoration: none;
    color: #fff;
  }
  .container .login-window .back:visited {
    color: #fff;
  }

  .login-window h1 {
    text-align: left;
    color: #fff;
    margin: 0;
  }

  .login-window p {
    color: #dddddd;
    text-align: left;
    margin: 0 0 1em 0;
    opacity: 0.6;
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

  .login-window .emailbuttons .inputbox {
    width: 100%;
    margin-top: 8px;
    height: 2.5em;
    font-size: 18px;
    align-items: center;
    background: rgb(83,112,254);
    background: linear-gradient(90deg, rgba(83,112,254,1) 16%, rgba(254,102,197,1) 66%); 
    border: 0;
    border-radius: 8px;
    box-shadow: rgba(151, 65, 252, 0.2) 0 15px 30px -5px;
    box-sizing: border-box;
    color: #FFFFFF;
    display: flex;
    font-size: 20px;
    justify-content: center;
    line-height: 1em;
    max-width: 100%;
    min-width: 140px;
    padding: 3px;
    text-decoration: none;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    white-space: nowrap;
    cursor: pointer;
  }

  .login-window .emailbuttons .inputbox:active, .login-window .emailbuttons .inputbox:hover {
    outline: 0;
  }

  .fa-google {
    color: White;
  }

  .login-window .oauthbuttons button {
    width: 32%;
    height: 3em;
  }

  .google {
    background-color: #4285F4; 
    color: white;
    border: none;
    padding: 6px 12px;
    font-weight: 600;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .spotify {
    background-color: #1db954; 
    color: white;
    border: none;
    padding: 6px 12px;
    font-weight: 600;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .email {
    background-color: #4b4f56;
    border: none;
    color: #b9b9b9;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
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

  .logo {
    width: 100px;
    padding-bottom: 20px;
    height: auto;
    cursor: pointer;
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
    padding: 0 .5em;
    line-height: 1.5em;
    color: #ffffff;
    background-color: #1D1F25;
  }

  @media (max-width: 1200px) {
    .container .login-window {
      max-width: 40vw;
    }
  }

  @media (max-width: 850px) {
    .container .login-window {
      max-width: 50vw;
    }

    .oauthbuttons {
      display: flex;
      flex-direction: column;
    }

    .oauth-button {
      width: 100% !important;
      margin: 0 0 10px 0;
    }
  }

  @media (max-width: 480px) {
    .container {
      display: block;
    }
    .container .login-window {
      max-width: 100vw;
      height: 100vh;
      max-height: none;
    }
  }
</style>

