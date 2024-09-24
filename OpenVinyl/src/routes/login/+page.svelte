<script>
  import { supabase } from '$lib/supabaseClient.js';

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

  async function signIn() {
    const { data, error } = await supabase.auth.signInWithPassword({
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

<div class="container">
  <div>
    <h1>Login</h1>
  
    <input type="email" name="" id="email" placeholder="email" bind:value={email}>
    <input type="password" name="" id="pass" placeholder="password" bind:value={pass}>
    <button id="esignin" on:click={signIn}>Sign-in with email</button>
    <button id="esignup" on:click={signUp}>Sign-up with email</button>
  </div>
</div>

<style>
  * {
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

  div {
    height: 50vh;
    width: 30vw;
    background-color: #fff;
    box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.1);
    border-radius: 8px;
    text-align: center;
  }
</style>

