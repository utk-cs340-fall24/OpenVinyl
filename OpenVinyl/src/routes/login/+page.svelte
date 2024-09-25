<script>
  import { supabase } from '$lib/supabaseClient.js';

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

  async function signIn() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pass,
    })
    console.log("data: ", data);
    console.log("error: ", error);

    console.log(supabase.auth.getUser());
  }
</script>

<div class="container">
  <div class="login-window">
    <h1>Welcome Back!</h1>
    <p>Enter your information below</p>
  
    <input type="email" name="" id="email" placeholder="email" bind:value={email}>
    <input type="password" name="" id="pass" placeholder="password" bind:value={pass}>
    <button class="inputbox" on:click={signIn}>Sign-in with email</button>
    <button class="inputbox" on:click={signUp}>Sign-up with email</button>
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

  .container div {
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
</style>

