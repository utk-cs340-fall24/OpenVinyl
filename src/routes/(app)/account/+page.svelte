<script>
  import { supabase } from '$lib/supabaseClient.js';
  import { updateUsername, updateFirstName, updateLastName } from '$lib/utils.js';

  let fname = '';
  let lname = '';
  let username = '';

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        window.location.href = '/'; // redirect to account page
    }
  });

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

    const {data, error} = await updateUsername(user.data.user.id, username);
    if (error == "duplicate key value violates unique constraint \"profiles_username_key\"") {
      document.getElementById('username-alert').innerHTML = "<i class=\"fa-solid fa-xmark\"></i>Username taken. Please try again";
    }
    updateFirstName(user.data.user.id, fname);
    updateLastName(user.data.user.id, lname);
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
  }
</script>


<div class="wrapper">
  <div class="account-settings">
    <h1>Account Settings</h1>

    <p>Update your information below</p>
    
    <div class="input-group">
      <input type="text" name="" id="fname" placeholder="first name" bind:value={fname}>
      <button class="update" on:click={submitUserInfo}>Update</button>
      <p class="user-alert"></p>
    </div>
    <div class="input-group">
      <input type="text" name="" id="lname" placeholder="last name" bind:value={lname}>
      <button class="update" on:click={submitUserInfo}>Update</button>
      <p class="user-alert"></p>
    </div>
    <div class="input-group">
      <input type="text" name="" id="username" placeholder="username" bind:value={username}>
      <button class="update" on:click={submitUserInfo}>Update</button>
      <p class="user-alert" id="username-alert"></p>
    </div>
    <button class="signout" on:click={logout}>Sign out</button>
  </div>
</div>


<style>
  .wrapper{
    /* background-color: #f3f4f6; */
    height: 100vh;
    overflow: hidden;
    width: 100vw;
    /* display: flex;
    justify-content: center;
    align-items: center; */
  }

  .wrapper .account-settings {
    width: 100%;
    min-height: 100vh;
    color: #fff;
    background-color: #1d1f25;
    /* box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.1); */
    border: 1px solid #26282c;
    border-radius: 8px;
    padding: 2.5em;
    text-align: left;
  }

  .wrapper .account-settings .input-group {
    margin: 8px 0;
  }

  .wrapper .account-settings .input-group input {
    width: 300px;
    padding: 12px 20px;
    margin: 0 0 4px 0;
    display: inline-block;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }

  .wrapper .account-settings .user-alert {
    text-align: left;
    margin: 0;
  }

  .wrapper .account-settings button {
    width: 49%;
    height: 2.5em;
    font-size: 18px;
  }
</style>