<script lang="js">
  import { supabase } from '$lib/supabaseClient.js';
  import { onMount } from 'svelte';
  import logo from '$lib/logo.svg';
  import { page } from '$app/stores';
  import { getValidSpotifyAccessToken } from '$lib/utils';
  import { vinylBalance, fetchVinylBalance, addVinyls } from '$lib/vinylsStore.js';

  let user = null;
  let showSpotifyButton = true; // Default state to show the Spotify button
  let avatar_url = '';
  let vinyls = 0; // Variable to store the amount of vinyls
  let active = 0;

  function hamburgerMenu() {
    active = active === 0 ? 1 : 0;
  }

  onMount(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      user = sessionData?.session?.user;

      if (user) {
        await fetchVinylBalance(user.id);

        const { data } = await supabase
          .from('profiles')
          .select('username, spotify_access_token, avatar_url, vinyls')
          .eq('id', user.id)
          .single();

        if (data) {
          // Update user data
          vinylBalance.subscribe(value => {
                vinyls = value;
            });
            avatar_url = data.avatar_url;

          // Update login button if necessary
          const loginButton = document.getElementById('login-button');
          if (loginButton) {
            loginButton.innerHTML = data.username;
            loginButton.href = '/account';
          }

          const accessToken = await getValidSpotifyAccessToken(user.id);
          if (accessToken) {
            showSpotifyButton = false;
          } else if (user.app_metadata.provider === 'spotify') {
            window.location.href = '/spotify-login';
          }
        }
      } else {
        showSpotifyButton = false;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      showSpotifyButton = false;
    }
  });

  const authenticateSpotify = () => {
    window.location.href = '/spotify-login';
    showSpotifyButton = false;
  };
</script>

<div class="wrapper">
  <nav>
    <div class="left-nav">
      <a href="/"><img src={logo} alt="logo" class="logo" /></a>

      <div class="links desktop">
        <a
          href="/"
          class="nav-link"
          class:active={$page.url.pathname === '/'}
        >
          Home
        </a>
        <a
          href="/discover"
          class="nav-link"
          class:active={$page.url.pathname.startsWith('/discover')}
        >
          Discover
        </a>
        <a
          href="/charts"
          class="nav-link"
          class:active={$page.url.pathname.startsWith('/charts')}
        >
          Charts
        </a>
        <a
          href="/discuss"
          class="nav-link"
          class:active={$page.url.pathname.startsWith('/discuss')}
        >
          Discuss
        </a>
        <a
          href="/games"
          class="nav-link"
          class:active={$page.url.pathname.startsWith('/games')}
        >
          {#if user}
          <!-- Vinyls Amount Display -->
          <div class="vinyls-amount">
            Games ({vinyls} Vinyls)
          </div>
          {:else}
          Games
        {/if}
        </a>
      </div>
    </div>

    <div class="right-nav">
      {#if showSpotifyButton}
        <button on:click={authenticateSpotify} class="spotify-button">
          Connect with Spotify
        </button>
      {/if}

      <div class="login-wrapper">
        <a class="login-href" href="/auth/signin" id="login-button">Login</a>

        <!-- User avatar -->
        <img
          style="display: {user ? 'block' : 'none'}"
          src={avatar_url || 'https://placehold.co/150'}
          class="avatar"
          alt="User Avatar"
          on:click={() => (window.location.href = `/account`)}
        />

        <!-- Hamburger Menu -->
        <div
          class="hamburger {active === 1 ? 'is-active' : ''}"
          id="hamburger"
          on:click={hamburgerMenu}
        >
          <span class="line"></span>
          <span class="line"></span>
          <span class="line"></span>
        </div>
      </div>
    </div>
  </nav>

  <!-- Mobile Navigation Links -->
  <div class="links mobile {active === 1 ? 'is-active' : ''}">
    {#if showSpotifyButton}
      <button on:click={authenticateSpotify} class="spotify-button-mobile">
        Connect with Spotify
      </button>
    {/if}
    <a
      href="/"
      class="nav-link"
      class:active={$page.url.pathname === '/'}
    >
      Home
    </a>
    <a
      href="/discover"
      class="nav-link"
      class:active={$page.url.pathname.startsWith('/discover')}
    >
      Discover
    </a>
    <a
      href="/charts"
      class="nav-link"
      class:active={$page.url.pathname.startsWith('/charts')}
    >
      Charts
    </a>
    <a
      href="/discuss"
      class="nav-link"
      class:active={$page.url.pathname.startsWith('/discuss')}
    >
      Discuss
    </a>
    <a
      href="/games"
      class="nav-link"
      class:active={$page.url.pathname.startsWith('/games')}
    >
      Games
    </a>
    <a
      href="/account"
      class="nav-link account-link"
      class:active={$page.url.pathname.startsWith('/account')}
    >
      Account Settings
    </a>
  </div>
</div>

<style>
  /* Wrapper and Navigation Styles */
.wrapper {
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

/* Navigation Links */
.nav-link {
  color: #ebe9e5;
  font-size: 1.25rem;
  text-decoration: none;
  margin-left: 1rem;
}

.nav-link:hover {
  color: #6a6a6a;
}

/* Active Navigation Link with Gradient Text */
.nav-link.active {
  /* Gradient text color */
  background: linear-gradient(to right, #fe67c4, #5371fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  /* For Firefox */
  background-clip: text;
  color: transparent;
}

.logo {
  width: 50px;
  height: auto;
}

/* Spotify Button */
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

/* Vinyls Amount Display */
.vinyls-amount {
  font-size: 1.25rem;
  margin-right: 10px;
  display: flex;
  align-items: center;
  color: #ebe9e5; /* Normal link color */
  flex-direction: row;
}

/* Login Wrapper */
.login-wrapper {
  display: flex;
  align-items: center;
}

.login-href {
  font-size: 1.5rem;
  color: #ebe9e5;
  text-decoration: none;
  margin-right: 10px;
  display: flex;
  align-items: center;
}

/* User Avatar */
.avatar {
  height: 50px;
  width: auto;
  border-radius: 50%;
  cursor: pointer;
}

/* Hamburger Menu */
.hamburger {
  display: none;
  margin-right: 1rem;
}

.hamburger .line {
  width: 25px;
  height: 3px;
  background-color: #ecf0f1;
  margin: 5px 0;
  transition: all 0.3s ease-in-out;
}

.hamburger.is-active .line:nth-child(2) {
  opacity: 0;
}

.hamburger.is-active .line:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.hamburger.is-active .line:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

/* Ensure mobile links are hidden by default */
.links.mobile {
  display: none;
}

/* Ensure desktop links are visible by default */
.links.desktop {
  display: flex;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .nav-link {
    font-size: 1rem;
  }

  .login-href {
    font-size: 1.2rem;
  }

  .avatar {
    width: 40px;
    height: auto;
  }

  .logo {
    width: 40px;
  }

  .left-nav {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  /* Hide desktop links on mobile */
  .links.desktop {
    display: none;
  }

  /* Show mobile links when active */
  .links.mobile.is-active {
    display: flex;
    flex-direction: column;
    padding-left: 2rem;
    background-color: #1d1f25;
    position: absolute;
    width: 100%;
    top: 60px; /* Adjust based on your header height */
    left: 0;
    z-index: 99;
  }

  .spotify-button {
    display: none;
  }

  .spotify-button-mobile {
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
    margin: 20px 0;
  }

  .spotify-button-mobile:hover {
    background-color: #1aa34a;
    transform: scale(1.03);
  }

  nav {
    text-align: center;
  }

  .nav-link {
    margin: 0.5rem 0;
  }

  .login-href {
    display: none;
  }

  .avatar {
    margin-right: 10px;
  }

  .hamburger {
    display: block;
  }

  .hamburger .line {
    width: 30px;
    height: 4px;
    background-color: #ecf0f1;
    margin: 6px 0;
    transition: all 0.3s ease-in-out;
  }

  .hamburger.is-active .line:nth-child(2) {
    opacity: 0;
  }

  .hamburger.is-active .line:nth-child(1) {
    transform: translateY(10px) rotate(45deg);
  }

  .hamburger.is-active .line:nth-child(3) {
    transform: translateY(-10px) rotate(-45deg);
  }

  .left-nav {
    flex-direction: column;
  }

  /* Hide vinyls amount on small screens */
  .vinyls-amount {
    display: none;
  }
}
</style>