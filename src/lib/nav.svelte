<script lang="js">
  import { supabase } from '$lib/supabaseClient.js';
  import { onMount } from "svelte";
  import logo from '$lib/logo.svg';
  import { page } from '$app/stores';
  import {getValidSpotifyAccessToken} from "$lib/utils";

  let user = null;
  let showSpotifyButton = true; // Default state to show the Spotify button

  onMount(async () => {
    try {
      const session = await supabase.auth.getSession();
      user = session?.data?.session?.user;

      if (user) {
        const { data, error } = await supabase.from("profiles").select("username, spotify_access_token").eq("id", user.id).single();
        if (data) {
          // Update login button with username
          const loginButton = document.getElementById("login-button");
          loginButton.innerHTML = data.username;
          loginButton.href = "/account";
          console.log("data: ", data)
          const accessToken = await getValidSpotifyAccessToken(user.id);
          if (accessToken) {
            showSpotifyButton = false;
            return;
          }
        }
      } else {
        // User is not logged in, hide the Spotify button
        showSpotifyButton = false;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      showSpotifyButton = false;
    }
  });

  const authenticateSpotify = () => {
    window.location.href = '/spotify-login';
  };
</script>

<div class="wrapper">
  <nav>
    <div class="left-nav">
      <a href="/"><img src={logo} alt="logo" class="logo"></a>
      <a 
        href="/" 
        class="nav-link" 
        class:active={$page.url.pathname === "/"}
      >
        Home
      </a>
      <a 
        href="/discover" 
        class="nav-link" 
        class:active={$page.url.pathname.startsWith("/discover")}
      >
        Discover
      </a>
      <a 
        href="/charts" 
        class="nav-link" 
        class:active={$page.url.pathname.startsWith("/charts")}
      >
        Charts
      </a>
      <a 
        href="/network" 
        class="nav-link" 
        class:active={$page.url.pathname.startsWith("/network")}
      >
        Network
      </a>
    </div>
    <div class="right-nav">
      {#if showSpotifyButton}
      <button on:click={authenticateSpotify} class="spotify-button">
        Connect with Spotify
      </button>
      {/if}
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
  .spotify-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1db954; 
  color: white;
  border: none;
  padding: 6px 12px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 20px; 
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-right: 15px;
}

.spotify-button:hover {
  background-color: #1aa34a;
  transform: scale(1.03); 
}

.spotify-button:active {
  background-color: #188a3e;
  transform: scale(1); 
}

.spotify-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(29, 185, 84, 0.4);
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
  .nav-link.active {
    color: #1db954; 
  }
  /* causes bugs */
  /* .nav-link.active::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 2px;
    background-color: #1db954; 
    bottom: -5px; 
    left: 0;
  } */

  .logo {
    width: 50px;
    height: auto;
  }

  @media (max-width: 768px) {
    .nav-link {
      font-size: 1rem;
    }

    .login-href {
      font-size: 1.2rem;
    }

    .logo {
      width: 40px; 
    }

    .left-nav {
      gap: 0.5rem;
    }
  }

  @media (max-width: 480px) {
    nav {
      flex-direction: column;
      text-align: center;
    }

    .nav-link {
      margin: 0.5rem 0; 
    }

    .login-href {
      padding-right: 0; 
    }
  }
</style>
