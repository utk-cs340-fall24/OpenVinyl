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
    console.log("email: ", email,"pass: ", pass);
    const { data, error } = await supabase.auth.signUp({
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
    <h1>Create Account</h1>
    <p>Enter your information below</p>
  
    <input type="email" name="" id="email" placeholder="email" bind:value={email}>
    <input type="password" name="" id="pass" placeholder="password" bind:value={pass}>
    <button class="inputbox" on:click={signUp}>Sign up with email</button>
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

  .container .login-window .back {
    text-align: left !important;
    display: block;
    text-decoration: none;
    color: #fff;
  }
  .container .login-window .back:visited {
    color: #fff;
  }


  .logo {
    width: 100px;
    padding-bottom: 20px;
    height: auto;
    cursor: pointer;
  }

  .container div {
    max-height: 80vh;
    overflow-y: auto;
    height: auto;
    max-width: 30vw;
    background-color: #1D1F25;
    box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.1);
    border-radius: 8px;
    padding: 2.5em;
    text-align: center;
  }

  .login-window h1 {
    text-align: left;
    color: #fff;
    margin: 0;
  }

  .login-window p {
    text-align: left;
    color: #fff;
    margin: 0 0 1em 0;
    opacity: 0.3;
  }

  .login-window button {
    width: 100%;
    margin-top: 8px;
    height: 2.5em;
    font-size: 18px;
    cursor: pointer;
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
</style>