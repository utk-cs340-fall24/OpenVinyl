<script lang="js">
  import { supabase } from '$lib/supabaseClient.js';
  import { onMount } from "svelte";

  onMount(async () => {
    const user = await supabase.auth.getUser();
    const { data, error }  = await supabase.from("profiles").select().eq("id", user.data.user.id);
    // console.log(user.data.user.id);
    if(user){
      document.getElementById("login-button").innerHTML = data[0].username;
    }
  });
</script>

<div class="wrapper">
  <nav>
    <div class="left-nav">
      <a href="/" class="title">OpenVinyl</a>
      <a href="/discover">Discover</a>
      <a href="/charts">Charts</a>
    </div>
    <div class="right-nav">
      <div class="login-wrapper">
        <a class="login-button" href="/auth/signin" id="login-button">Login</a>
      </div>
    </div>
  </nav>
</div>
 
 <style>
  .wrapper{
    position:fixed;
    width: 100%;
    top:0;
    z-index: 100;
  }
  nav{
    background-color: #353535;
    padding: 15px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    font-family: "Concert One", sans-serif;
  }
  .title{
    font-size:32px;
    margin:0;
  }
  .left-nav{
    width:30%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }
  .right-nav{
    width: 70%;
    text-align: right;
    display:table;
  }
  nav a {
    margin-top: 10px;
    padding: 0;
    height: fit-content;
    text-decoration: none;
    color: #ebe9e5;
  }
  nav a:hover{
    color: #6a6a6a;
  }
  .login-wrapper{
    display:flex;
    justify-content: right;
    padding-top:3px;
  }
  .login-button{
    font-size:24px;
    display:table-cell;
    vertical-align: middle;
    padding:0;
    margin:0;
  }
 </style>