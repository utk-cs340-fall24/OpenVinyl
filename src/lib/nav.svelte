<script lang="js">
  import { supabase } from '$lib/supabaseClient.js';
  import { onMount } from "svelte";
  import logo from '$lib/logo.svg';

  onMount(async () => {
    try {
      const user = await supabase.auth.getUser();
      if (user && user.data.user) {
        const { data, error } = await supabase.from("profiles").select("username").eq("id", user.data.user.id).single();
        if (data) {
          const loginButton = document.getElementById("login-button");
          loginButton.innerHTML = data.username;
          loginButton.href = "/account";
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  });
</script>
<div class="wrapper">
  <nav>
    <div class="left-nav">
      <a href="/"><img src={logo} alt="logo" class="logo"></a>
      <a href="/discover" class="nav-link">Discover</a>
      <a href="/charts" class="nav-link">Charts</a>
    </div>
    <div class="right-nav">
      <div class="login-wrapper">
        <a class="login-href" href="/auth/signin" id="login-button">Login</a>
      </div>
    </div>
  </nav>
</div>

<style>
  .wrapper {
    /* position: fixed; */
    width: 100%;
    top: 0;
    z-index: 100;
    background-color: #1d1f25;
  }

  nav {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    border-bottom: 1px solid #26282c;
    font-family: "Concert One", sans-serif;
    align-items: center;
  }

  .left-nav,
  .right-nav {
    display: flex;
    align-items: center;
  }

  .left-nav {
    gap: 1rem; /* Add space between the logo and the links */
  }

  .nav-link {
    color: #ebe9e5;
    font-size: 1.25rem;
    text-decoration: none;
    margin-left: 1rem;
  }

  .nav-link:hover {
    color: #6a6a6a;
  }

  .login-wrapper {
    display: flex;
    align-items: center;
  }

  .login-href {
    font-size: 1.5rem;
    color: #ebe9e5;
    text-decoration: none;
    padding-right: 20px;
  }

  .logo {
    width: 50px;
    height: auto;
  }

  /* Media Queries for responsiveness */
  @media (max-width: 768px) {
    .nav-link {
      font-size: 1rem; /* Decrease font size on smaller screens */
    }

    .login-href {
      font-size: 1.2rem;
    }

    .logo {
      width: 40px; /* Adjust logo size for smaller screens */
    }

    .left-nav {
      gap: 0.5rem;
    }
  }

  @media (max-width: 480px) {
    nav {
      flex-direction: column; /* Stack the navigation links on smaller screens */
      text-align: center;
    }

    .nav-link {
      margin: 0.5rem 0; /* Add space between the links */
    }

    .login-href {
      padding-right: 0; 
    }
  }
</style>
