<script>
  import { supabase } from '$lib/supabaseClient.js';
  import { updateUsername, updateFirstName, updateLastName } from '$lib/utils.js';

  let fname = '';
  let lname = '';
  let username = '';

  async function submitUserInfo() {
    const user = await supabase.auth.getUser();

    if (fname === "") {
      console.log("First Name can't be null");
      return;
    } else if (lname === "") {
      console.log("Last Name can't be null");
      return;
    } else if (username === "") {
      console.log("Username can't be null");
      return;
    }

    updateUsername(user.data.user.id, username);
    updateFirstName(user.data.user.id, fname);
    updateLastName(user.data.user.id, lname);
  }
</script>

<div class="container">
  <div class="login-window">
    <h1>Create Account</h1>
    <p>Enter your information below</p>
  
    <input type="text" name="" id="fname" placeholder="first name" bind:value={fname}>
    <input type="text" name="" id="lname" placeholder="last name" bind:value={lname}>
    <input type="text" name="" id="username" placeholder="username" bind:value={username}>
    <button class="inputbox" on:click={submitUserInfo}>Submit</button>
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

  .login-window button {
    width: 100%;
    height: 2.5em;
    font-size: 18px;
  }
</style>