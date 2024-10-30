<script>
  export let uuid;
  export let logged_in_user_uuid;
  export let rating;
  export let post_id;
  export let song_id;
  export let desc;
  export let profile_pic_url = "https://placehold.co/30";
  export let song_artist;
  export let song_title;
  export let song_image;

  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import "@fortawesome/fontawesome-free/css/all.css";
  import "@fortawesome/fontawesome-free/js/all.js";

  let upvotesCount = 0;
  let downvotesCount = 0;
  let userVote = null; // 'upvote', 'downvote', or null

  let username = "";
  let processingVote = false;

  $: netVotes = upvotesCount - downvotesCount;

  onMount(async () => {
    try {
      await fetchUserData();
      await fetchVoteCounts();
      await checkUserVote();
    } catch (err) {
      console.error("Error during onMount:", err);
    }
  });

  async function fetchUserData() {
    const { data, error } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", uuid)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      username = data.username;
      profile_pic_url = data.avatar_url;
    }
  }

  async function fetchVoteCounts() {
    const { count: upvotesCountData, error: upvotesError } = await supabase
      .from("likes")
      .select("id", { count: "exact" })
      .eq("post_id", post_id)
      .eq("isLiked", true);

    if (upvotesError) throw upvotesError;
    upvotesCount = upvotesCountData || 0;

    const { count: downvotesCountData, error: downvotesError } = await supabase
      .from("likes")
      .select("id", { count: "exact" })
      .eq("post_id", post_id)
      .eq("isLiked", false);

    if (downvotesError) throw downvotesError;
    downvotesCount = downvotesCountData || 0;
  }

  async function checkUserVote() {
    if (!logged_in_user_uuid) return;

    const { data: existingVote, error } = await supabase
      .from("likes")
      .select("id, isLiked")
      .eq("post_id", post_id)
      .eq("profile_id", logged_in_user_uuid)
      .maybeSingle();

    if (error) {
      console.error("Error checking user vote:", error);
      return;
    }

    if (existingVote) {
      userVote = existingVote.isLiked ? "upvote" : "downvote";
    } else {
      userVote = null;
    }
  }

  async function toggleVote(voteType) {
  if (processingVote || !logged_in_user_uuid) return;

  processingVote = true;
  try {
    const { data: existingVote, error } = await supabase
      .from("likes")
      .select("*")
      .eq("post_id", post_id)
      .eq("profile_id", logged_in_user_uuid)
      .maybeSingle();

    if (error) throw error;

    if (existingVote) {
      if (
        (existingVote.isLiked && voteType === "upvote") ||
        (!existingVote.isLiked && voteType === "downvote")
      ) {
        // Remove the vote
        await removeVote(existingVote.id, existingVote.isLiked);
      } else {
        // Update the vote
        await updateVote(
          existingVote.id,
          voteType === "upvote",
          existingVote.isLiked
        );
      }
    } else {
      // Add new vote
      await addVote(voteType === "upvote");
    }
  } catch (err) {
    console.error("Error toggling vote:", err);
    alert("Failed to process your vote. Please try again.");
  } finally {
    processingVote = false;
  }
}


  async function addVote(isUpvote) {
    const { error } = await supabase
      .from("likes")
      .insert({
        post_id,
        profile_id: logged_in_user_uuid,
        isLiked: isUpvote,
      });

    if (error) throw error;

    if (isUpvote) {
      upvotesCount += 1;
      userVote = "upvote";
    } else {
      downvotesCount += 1;
      userVote = "downvote";
    }
  }

  async function updateVote(voteId, isUpvote, wasUpvote) {
    // console.log("Attempting to update vote:", { voteId, isUpvote, wasUpvote });

    const { data, error } = await supabase
      .from("likes")
      .update({ isLiked: isUpvote })
      .eq("id", voteId)
      .eq("profile_id", logged_in_user_uuid)
      .select();

    if (error) {
      console.error("Error updating vote:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error("Update failed: No rows affected.");
      return;
    }

    // console.log("Update successful:", data);

    // Adjust counts
    if (wasUpvote && !isUpvote) {
      upvotesCount -= 1;
      downvotesCount += 1;
    } else if (!wasUpvote && isUpvote) {
      upvotesCount += 1;
      downvotesCount -= 1;
    }

    userVote = isUpvote ? "upvote" : "downvote";
  }



  async function removeVote(voteId, wasUpvote) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("id", voteId);

    if (error) throw error;

    if (wasUpvote) {
      upvotesCount -= 1;
    } else {
      downvotesCount -= 1;
    }
    userVote = null;
  }

  // Convert 10 scale to 5 for display purposes only (maybe fix later)
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
      <span class="username">
        <a class="username-link" href="/profiles/{username}">{username}</a>
      </span>
    </div>

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="right-section" on:click={() => window.location.href = `/posts/${post_id}`} style="cursor: pointer;"></div>
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
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="song-info-wrapper" on:click={() => window.location.href = `/posts/${post_id}`} style="cursor: pointer;">
      <p class="song-name">{song_title ? song_title : "Song Name"}</p>
      <p class="artist-name">{song_artist ? song_artist : "Artist Name"}</p>
      <p class="review-preview">{desc}</p>
    </div>

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div>
      <div class="rating-wrapper" on:click={() => window.location.href = `/posts/${post_id}`} style="cursor: pointer;">
        <p>{@html renderStars()}</p>
      </div>
    

      <div class="vote-section">
        <button
          on:click={() => toggleVote('upvote')}
          disabled={!logged_in_user_uuid || processingVote}
          class="vote-button upvote-button"
          aria-label="Upvote"
          class:selected={userVote === 'upvote'}
        >
          <i class="fa-solid fa-arrow-up"></i>
        </button>
    
        <span class="net-vote-count">{netVotes}</span>
    
        <button
          on:click={() => toggleVote('downvote')}
          disabled={!logged_in_user_uuid || processingVote}
          class="vote-button downvote-button"
          aria-label="Downvote"
          class:selected={userVote === 'downvote'}
        >
          <i class="fa-solid fa-arrow-down"></i>
        </button>
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

  .vote-section {
    display: flex;
    align-items: center;
    margin-top: 10px;
    justify-content: center;
  }

  .vote-button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: #f3f1f1;
    font-size: 1.5rem;
    margin: 0 10px;
    transition: color 0.3s, transform 0.1s;
  }

  .vote-button:hover {
    color: #1db954;
  }

  .vote-button.selected {
    color: #1db954;
    transform: translateY(2px);
  }

  .net-vote-count {
    font-size: 1.2rem;
    margin: 0 10px;
    color: #f3f1f1;
    min-width: 20px;
    text-align: center;
  }

  .vote-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    background-color: #1d1f25;
    width: 70%;
    margin: 20px auto;
    padding: 5px;
    color: #f3f1f1;
    border: 1px solid #26282c;
    font-family: "Concert One", sans-serif;
    min-height: 150px;
    border-radius: 8px;
  }

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #26282c;
    padding: 5px;
    width: 100%;
    box-sizing: border-box;
    border-radius: 8px 8px 8px 8px;
  }

  .user-info {
    display: flex;
    align-items: center;
  }

  .profile-pic {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    margin-right: 10px;
    object-fit: cover;
  }

  .username {
    font-size: 0.8rem;
    color: #b9b9b9;
  }

  .username-link {
    text-decoration: none;
    color: #b9b9b9;
  }

  .right-section {
    display: flex;
    align-items: center;
    width: 80%;
    height:30px;
  }

  .discover-button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: #f3f1f1;
    font-size: 1.2rem;
    transition: color 0.3s;
  }

  .discover-button:hover {
    color: #6a6a6a;
  }

  .content-wrapper {
    display: flex;
    align-items: flex-start;
    margin-top: 20px;
    flex-wrap: wrap;
  }

  .album-cover-container {
    position: relative;
    /* width: 100%; */
    max-width: 100px; /* Optional: Limit maximum width */
    height: auto;
    margin-right: 15px;
    flex-shrink: 0;
  }

  .album-cover {
    width: 100%;
    height: auto;
    object-fit: cover;
    /* border-radius: 8px; */
  }

  .play-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 2rem;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    padding: 15px;
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
    margin-left: 15px;
    overflow: hidden;
  }

  .song-name {
    font-size: 1.5rem;
    margin: 0;
    color: #e4e4e4;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .artist-name {
    font-size: 1rem;
    color: #b9b9b9;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .review-preview {
    font-size: 1rem;
    color: #e4e4e4;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .rating-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 10px;
  }

  .like-section {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
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
    transition: color 0.3s;
  }

  .like-button:hover {
    color: #007bff;
  }

  .like-button .fa-heart {
    margin-right: 5px;
    font-size: 1rem;
    transition: color 0.3s;
  }

  .like-button .fa-heart.liked {
    color: #007bff;
  }

  .like-text {
    min-width: 45px;
    display: inline-block;
    font-size: 0.9rem;
    color: #f3f1f1;
    transition: color 0.3s;
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

  @media (max-width: 768px) {
    .wrapper {
      width: 90%;
    }

    .content-wrapper {
      flex-direction: column;
      align-items: center;
    }

    .album-cover-container {
      width: 100%;
      /* width: 50px; Fixed width on desktop */
      /* height: auto; */
      max-width: 100%;
      margin-right: 0;
      margin-bottom: 20px;
    }

    .album-cover {
      width: 100%;
      height: auto;
      border-radius: 8px;
    }

    .song-info-wrapper {
      margin-left: 0;
      text-align: center;
      margin-top: 10px;
    }

    .rating-wrapper {
      margin-top: 15px;
    }

    .song-info-wrapper {
      overflow: hidden;
      width: 100%;
    }

    .artist-name {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    .song-name {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    .like-section {
      justify-content: center;
      margin-top: 15px;
    }

    .like-button .fa-heart {
      margin-right: 5px;
      font-size: 1rem;
    }

    .like-text {
      font-size: 0.9rem;
    }
  }
</style>
