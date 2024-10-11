<script>
  export let uuid;
  export let logged_in_user_uuid;
  export let rating;
  export let post_id;
  export let song_id;
  export let likes_cnt;
  export let desc;
  export let profile_pic_url = "https://placehold.co/30";
  export let song_artist;
  export let song_title;
  export let song_image;
  import { spotify } from "$lib/spotifyClient";
  import { onMount } from "svelte";
  import { authenticateClientCredentials } from "$lib/utils";
  import { supabase } from "$lib/supabaseClient";
  import "@fortawesome/fontawesome-free/css/all.css";
  import "@fortawesome/fontawesome-free/js/all.js";

  let trackData = null;
  let liked = false;
  let processingLike = false;
  let username = "";

  onMount(async () => {
    try {
      await fetchUserData();
      await checkIfLiked();
      console.log(post_id)
    } catch (err) {
      console.error("Error during onMount:", err);
    }
  });

  async function fetchUserData() {
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", uuid)
      .maybeSingle();

    if (error) throw error;
    if (data) username = data.username;
  }

  async function checkIfLiked() {
    if (!logged_in_user_uuid) return;

    const { data: existingLike, error } = await supabase
      .from("likes")
      .select("*")
      .eq("post_id", post_id)
      .eq("profile_id", logged_in_user_uuid)
      .maybeSingle();

    if (error) throw error;
    liked = !!existingLike;
  }

  async function toggleLike() {
    if (processingLike || !logged_in_user_uuid) return;

    processingLike = true;
    try {
      const { data: existingLike } = await supabase
        .from("likes")
        .select("*")
        .eq("post_id", post_id)
        .eq("profile_id", logged_in_user_uuid)
        .maybeSingle();

      if (existingLike) {
        await removeLike();
      } else {
        await addLike();
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      processingLike = false;
    }
  }

  async function addLike() {
    const { error } = await supabase
      .from("likes")
      .insert({ post_id, profile_id: logged_in_user_uuid });

    if (error) throw error;

    liked = true;
    likes_cnt += 1;
  }

  async function removeLike() {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", post_id)
      .eq("profile_id", logged_in_user_uuid);

    if (error) throw error;

    liked = false;
    likes_cnt -= 1;
  }
  //convert 10 scale to 5 for display purposes only (maybe fix later)
  function renderStars() {
    const stars = [];
    const ratingOutOfFive = rating / 2;

    for (let i = 1; i <= 5; i++) {
      if (ratingOutOfFive >= i) {
        stars.push('<i class="fa-solid fa-star"></i>');
      } else if (ratingOutOfFive >= i - 0.5) {
        stars.push('<i class="fa-regular fa-star-half-stroke"></i>');
      } else {
        stars.push('<i class="fa-regular fa-star"></i>');
      }
    }
    return stars.join("");
  }
</script>

<div class="wrapper">
  <div class="top-bar">
    <div class="user-info">
      <img class="profile-pic" src={profile_pic_url} alt="profile" />
      <!-- <span class="username">{username}</span> -->
      <span class="username"><a class="username-link" href="/profiles/{username}">{username}</a></span>
    </div>

    <div class="right-section">
      <a href="/posts/{post_id}" class="discover-button">
        <i class="fa-solid fa-external-link-alt"></i>
      </a>
    </div>
  </div>

  <div class="content-wrapper">
    <div class="album-cover-container">
      <img
        class="album-cover"
        src={song_image ? song_image : "https://placehold.co/300"}
        alt="album cover"
      />
      <a href="/discover/{song_id}" class="play-button" aria-label="Play Song">
        <i class="fa-solid fa-play"></i>
      </a>
    </div>

    <div class="song-info-wrapper">
      <p class="song-name">{song_title ? song_title : "Song Name"}</p>
      <p class="artist-name">{song_artist ? song_artist : "Artist Name"}</p>
    </div>
    <div>
      <div class="rating-wrapper">
        <p>{@html renderStars()}</p>
      </div>
      <div class="like-section">
        <button
          on:click={toggleLike}
          disabled={!logged_in_user_uuid}
          class="like-button"
        >
          <span class="like-text" class:liked>{liked ? "Liked" : "Like"}</span>
        </button>
        <span class="like-count">{likes_cnt}</span>
      </div>
    </div>
  </div>
</div>

<style>
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  .wrapper {
    display: flex;
    flex-direction: column;
    background-color: #1d1f25;
    width: 70%;
    margin: 20px auto;
    padding: 10px;
    color: #f3f1f1;
    border: 1px solid #26282c;
    font-family: "Concert One", sans-serif;
    min-height: 150px;
  }

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #26282c;
    padding: 5px 10px;
    width: 100%;
    box-sizing: border-box;
  }

  .user-info {
    display: flex;
    align-items: center;
  }

  .profile-pic {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    margin-right: 8px;
  }

  .username {
    font-size: 0.8rem;
    color: #b9b9b9;
  }
  .username-link {
    text-decoration: none;
    color: #b9b9b9;
  }

  .like-section {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .like-button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: #f3f1f1;
    display: flex;
    align-items: center;
    padding: 0;
    font-size: 1.2rem;
  }

  .like-button i {
    margin-right: 5px;
    color: #f3f1f1;
    font-size: 1rem;
  }

  .like-button i.liked {
    color: #007bff;
  }

  .like-text {
    min-width: 45px;
    display: inline-block;
    font-size: 0.9rem;
    color: #f3f1f1;
  }

  .like-text.liked {
    color: #007bff;
  }

  .like-count {
    width: 24px;
    height: 24px;
    margin-left: 5px;
    text-align: center;
    background-color: #007bff;
    color: white;
    border-radius: 50%;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .like-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .discover-button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: #f3f1f1;
    font-size: 1rem;
  }

  .discover-button:hover {
    color: #6a6a6a;
  }

  .content-wrapper {
    display: flex;
    align-items: center;
    margin-top: 10px;
  }

 
  .album-cover-container {
    position: relative;
    width: 100px;
    height: 100px;
    margin-right: 15px;
    flex-shrink: 0;
  }

  .album-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* border-radius: 8px; */
  }
  .play-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 1.5rem;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    padding: 10px;
    opacity: 0;
    transition: opacity 0.3s, background-color 0.3s;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .album-cover-container:hover .play-button {
    opacity: 1;
  }
  .play-button:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }

  .song-info-wrapper {
    flex: 1;
  }

  .song-name {
    font-size: 1.2rem;
    color: #e4e4e4;
    margin: 0;
  }

  .artist-name {
    font-size: 0.9rem;
    color: #b9b9b9;
  }

  .rating-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  @media (max-width: 768px) {
    .wrapper {
      width: 90%;
    }

    .content-wrapper {
      flex-direction: column;
    }

    .album-cover {
      width: 100%;
      height: auto;
      margin: 0 0 10px 0;
    }
  }
</style>
