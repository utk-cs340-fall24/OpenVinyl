<script lang="js">
  import { supabase } from '$lib/supabaseClient.js';
  import { onMount } from "svelte";
  import logo from '$lib/logo.svg';

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
      <a href="/"><img src={logo} alt="logo" width="75"></a>
      <a href="/discover">Discover</a>
      <a href="/charts">Charts</a>
    </div>
    <div class="right-nav">
      <div class="login-wrapper">
        <a class="login-href" href="/auth/signin" id="login-button">Login</a>
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
    padding: 5px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    font-family: "Concert One", sans-serif;
  }
  .left-nav{
    width:50%;
    display: table;
  }
  .right-nav{
    width: 70%;
    text-align: right;
    display:flex;
    justify-content: right;
  }
  nav a {
    margin-top: 10px;
    padding: 0;
    height: fit-content;
    text-decoration: none;
    color: #ebe9e5;
    display:table-cell;
    vertical-align: middle;
    width:fit-content;
    font-size:28px;
  }
  nav a:hover{
    color: #6a6a6a;
  }
  .login-wrapper{
    width:fit-content;
    height:100%;
    display: table;
  }
  .login-wrapper a{
    font-size:38px;
    display:table-cell;
    vertical-align: middle;
    padding-right:20px;
  }
  img{
    padding:5px;
    display:table-cell;
    vertical-align: middle;
  }
 </style>