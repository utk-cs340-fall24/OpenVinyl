<script lang="js">
  import { supabase } from '$lib/supabaseClient.js';
  import { updateUsername, updateFirstName, updateLastName, updateAvatar, unlinkSpotify } from '$lib/utils.js';
  import { onMount } from 'svelte';

  let fname = '';
  let fnametracker = 0;
  let lname = '';
  let lnametracker = 0;
  let username = '';
  let avatar_url = '';
  let usernametracker = 0;
  let spotifytracker = 0;

  onMount(async () => {
    try {
      const session = await supabase.auth.getSession();
      const user = session?.data?.session?.user;

      let filename = user.id + '.png'

      if (user) {
        const { data, error } = await supabase.from("profiles").select("username, first_name, last_name, avatar_url, spotify_access_token").eq("id", user.id).single();
        if (data) {
          document.getElementById("username").placeholder = data.username;
          document.getElementById("fname").placeholder = data.first_name;
          document.getElementById("lname").placeholder = data.last_name;
          avatar_url = data.avatar_url;
          if (data.spotify_access_token != null) {
            document.getElementById("updatespotify").innerHTML = "<i class=\"fa-solid fa-link-slash\"></i> Unlink";
            spotifytracker = 1;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching username profile:", error);
    }
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        window.location.href = '/'; // redirect to account page
    }
  });

  async function editFirstName() {
    if (fnametracker == 0) {
      fnametracker = 1;

      document.getElementById("fname-wrapper").classList.toggle("not-active");
      document.getElementById("fname").style.pointerEvents = "auto";
      document.getElementById("updatefname").innerHTML = "Submit";
    } else if (fnametracker == 1) {
      const user = await supabase.auth.getUser();

      try {
        const {data, error} = await updateFirstName(user.data.user.id, fname);

        fnametracker = 0;

        document.getElementById("fname-wrapper").classList.toggle("not-active");
        document.getElementById("fname").style.pointerEvents = "none";
        document.getElementById("updatefname").innerHTML = "Edit";
      } catch (error) {
        console.error("Error updating first name:", error);
        document.getElementById('fname-alert').innerHTML = "<i class=\"fa-solid fa-xmark\"></i>Error updating first name. Please try again";
      }
    }
  }

  async function manageSpotify() {
    if (!spotifytracker) {
      window.location.href = '/spotify-login';
      spotifytracker = 1;
    } else {
      const user = await supabase.auth.getUser();
      unlinkSpotify(user.data.user.id);

      document.getElementById("updatespotify").innerHTML = "<i class=\"fa-solid fa-link\"></i> Link";
      spotifytracker = 0;
      location.reload();
    }

    return;
  }

  async function editLastName() {
    if (lnametracker == 0) {
      lnametracker = 1;

      document.getElementById("lname-wrapper").classList.toggle("not-active");
      document.getElementById("lname").style.pointerEvents = "auto";
      document.getElementById("updatelname").innerHTML = "Submit";
    } else if (lnametracker == 1) {
      const user = await supabase.auth.getUser();

      try {
        const {data, error} = await updateLastName(user.data.user.id, lname);

        lnametracker = 0;

        document.getElementById("lname-wrapper").classList.toggle("not-active");
        document.getElementById("lname").style.pointerEvents = "none";
        document.getElementById("updatelname").innerHTML = "Edit";
      } catch (error) {
        console.error("Error updating last name:", error);
        document.getElementById('lname-alert').innerHTML = "<i class=\"fa-solid fa-xmark\"></i>Error updating last name. Please try again";
      }
    }
  }

  async function editUsername() {
    if (usernametracker == 0) {
      usernametracker = 1;

      document.getElementById("uname-wrapper").classList.toggle("not-active");
      document.getElementById("username").style.pointerEvents = "auto";
      document.getElementById("updateuname").innerHTML = "Submit";
    } else if (usernametracker == 1) {
      const user = await supabase.auth.getUser();

      try {
        const {data, error} = await updateUsername(user.data.user.id, username);

        usernametracker = 0;

        document.getElementById("uname-wrapper").classList.toggle("not-active");
        document.getElementById("username").style.pointerEvents = "none";
        document.getElementById("updateuname").innerHTML = "Edit";
      } catch (error) {
        console.error("Error updating user name:", error);
        document.getElementById('username-alert').innerHTML = "<i class=\"fa-solid fa-xmark\"></i>Error updating user name. Please try again";
      }
    }
  }

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


    updateFirstName(user.data.user.id, fname);
    updateLastName(user.data.user.id, lname);
  }

  async function fileUpload() {
    console.log(document.getElementById("fupload").files[0])
    const user = await supabase.auth.getUser();
    let filename = user.data.user.id + '.png'

    const { data, error } = await supabase
      .storage
      .from('avatars')
      .upload(filename, document.getElementById("fupload").files[0], {
        cacheControl: '3600',
        upsert: false
    })

    const { data: avatarData, error: avatarError } = supabase.storage.from('avatars').getPublicUrl(filename);

    if (avatarData) {
      updateAvatar(user.data.user.id, avatarData.publicUrl);
    }
    console.log(avatarData, avatarError)

    console.log(error)
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
  }
</script>


<div class="wrapper">
  <div class="account-settings">
    <a href="/" class="back"><i class="fa-solid fa-arrow-left"></i> Back</a>

    <h1>Account Settings</h1>

    <p>Update your information below</p>

    <img src={avatar_url || 'https://placehold.co/150'} alt={`user's avatar`} id="">
    
    <div class="input-group">
      <div class="input-wrapper" id="fname-wrapper"><input type="text" name="" id="fname" placeholder="first name" bind:value={fname}></div>
      <button class="update" id="updatefname" on:click={editFirstName}>Edit</button>
      <p class="user-alert" id="fname-alert"></p>
    </div>
    <div class="input-group">
      <div class="input-wrapper" id="lname-wrapper"><input type="text" name="" id="lname" placeholder="last name" bind:value={lname}></div>
      <button class="update" id="updatelname" on:click={editLastName}>Edit</button>
      <p class="user-alert" id="lname-alert"></p>
    </div>
    <div class="input-group">
      <div class="input-wrapper" id="uname-wrapper"><input type="text" name="" id="username" placeholder="username" bind:value={username}></div>
      <button class="update" id="updateuname" on:click={editUsername}>Edit</button>
      <p class="user-alert" id="username-alert"></p>
    </div>

    <input type="file" name="" id="fupload" on:change={fileUpload}>

    <h2>Account Integrations</h2>
    <div class="int-wrapper">
      <p class="spotify-label">Spotify</p>
      <button class="link" id="updatespotify" on:click={manageSpotify}><i class="fa-solid fa-link"></i> Link</button>
    </div>
    
    <!-- <p>Color Theme</p> -->
    <button class="signout" on:click={logout}>Sign out</button>
  </div>
</div>


<style>
  .wrapper{
    background-color: #1d1f25;
    height: auto;
    overflow: auto;
  }

  .wrapper .account-settings {
    min-height: 100vh;
    margin-left: 20vw;
    color: #fff;
    /* background-color: #1d1f25; */
    /* box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.1); */
    border-left: 1px solid #26282c;
    /* border-radius: 8px; */
    padding: 2.5em;
    text-align: left;
  }

  .wrapper .account-settings .back {
    text-decoration: none;
    color: #fff;
  }

  .wrapper .account-settings .back:visited {
    color: #fff;
  }

  .wrapper .account-settings .input-group {
    margin: 8px 0;
  }

  .wrapper .account-settings .input-group input {
    width: 300px;
    height:  2.5em;
    font-size: 14px;
    padding: 12px 20px;
    margin: 0 0 4px 0;
    display: inline-block;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    pointer-events: none;
  }

  .wrapper .account-settings .input-group .input-wrapper {
    cursor: not-allowed;
    display: inline-block;
  }

  .wrapper .account-settings .input-group .input-wrapper.not-active {
    cursor: text;
  }

  .wrapper .account-settings .int-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 200px;
    height: 40px;
    vertical-align: middle;
    border: 2px solid #26282c;
    padding: 1rem;
    border-radius: 5px;
    margin-bottom: 20px;
  }

  .int-wrapper .link {
    margin: auto 0 auto 0;
  }

  .int-wrapper p {
    margin: auto 0 auto 0;
  }

  .wrapper .account-settings .user-alert {
    text-align: left;
    margin: 0;
  }

  .wrapper .account-settings button {
    width: 100px;
    height: 2.5em;
    font-size: 14px;
    background-color: #1d1f25;
    color: #fff;
    border: 2px solid #c5c5c5;
    border-radius: 4px;
    cursor: pointer;
  }

  .wrapper .account-settings .signout {
    display: block;
  }

  #fupload {
    display: block;
    margin-bottom: 10px;
  }

  .wrapper .account-settings button:hover {
    color: #1c1c1c;
    background-color: #c5c5c5;
    border: 2px solid #c5c5c5;
  }
</style>