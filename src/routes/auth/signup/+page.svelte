<script>
  import { supabase } from '$lib/supabaseClient.js';
  import logo from '$lib/logo.svg';

  let email;
  let pass;

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        window.location.href = '/'; // redirect to account page
    }
  });

  async function signUp() {
    if (pass.length < 6) {
      console.log("Password must be longer than 6 characters");
      document.getElementById("pass-alert").innerHTML = "<i class=\"fa-solid fa-circle-xmark\"></i> Password must be longer than 6 characters";
    }
    console.log("email: ", email,"pass: ", pass);
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: pass,
    })
  }
</script>

<div class="container">
  <div class="login-window">
    <a href="/auth/signin" class="back"><i class="fa-solid fa-arrow-left"></i> Back</a>
    <a href="/"><img src={logo} alt="logo" class="logo"></a>
    <h1>Create Account</h1>
    <p>Enter your information below</p>
  
    <input type="email" name="" id="email" placeholder="email" bind:value={email}>
    <input type="password" name="" id="pass" placeholder="password" bind:value={pass}>
    <p class="user-alert" id="pass-alert"></p>
    <button class="inputbox" on:click={signUp}>
      <i class="fa-solid fa-envelope"></i> Sign up
    </button>
  </div>
</div>

<style>
  * {
    box-sizing: border-box;
    font-family: Arial, Helvetica, sans-serif;
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

  .container div {
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

  .container .login-window .user-alert {
    text-align: left;
    font-size: 12px;
    color: #FF4742;
    margin: 0;
    opacity: 1;
  }

  .logo {
    width: 100px;
    padding-bottom: 20px;
    height: auto;
    cursor: pointer;
  }

  .login-window h1 {
    color: #fff;
    text-align: left;
    margin: 0;
  }

  .login-window p {
    color: #fff;
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

  .inputbox {
    width: 100%;
    height: 2.5em;
    margin: 8px 0 0 0;
    font-size: 18px;
    background: rgb(83,112,254);
    background: linear-gradient(90deg, rgba(83,112,254,1) 16%, rgba(254,102,197,1) 66%); 
    align-items: center;
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

  @media (max-width: 1200px) {
    .container .login-window {
      max-width: 40vw;
    }
  }

  @media (max-width: 850px) {
    .container .login-window {
      max-width: 50vw;
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