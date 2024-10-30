<script>
  import { onMount } from 'svelte';
  import { spotify } from '$lib/spotifyClient';
  import { authenticateClientCredentials } from '$lib/utils';
  import { supabase } from '$lib/supabaseClient';
  import "@fortawesome/fontawesome-free/css/all.css";
  import "@fortawesome/fontawesome-free/js/all.js";

  export let data;
  let { reviews, song_id } = data;

  let songDetails = {
    title: 'Loading...',
    artist: '',
    image_url: 'https://placehold.co/300',
  };
  let loading = true;
  let error = null;

  let logged_in_user_uuid = null;
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      logged_in_user_uuid = session.user.id;
    }
  });

  let userVotes = {};
  let netVotes = {};  
  let processingVote = false;

  onMount(async () => {
    try {
      await authenticateClientCredentials();
      const data = await spotify.getTrack(song_id);

      if (data) {
        songDetails = {
          title: data.name,
          artist: data.artists.map((artist) => artist.name).join(', '),
          image_url: data.album.images[0]?.url || 'https://placehold.co/300',
        };
      } else {
        songDetails = {
          title: 'Unknown Title',
          artist: 'Unknown Artist',
          image_url: 'https://placehold.co/300',
        };
      }

      for (let review of reviews) {
        await fetchVoteCounts(review.id);
        if (logged_in_user_uuid) {
          await checkUserVote(review.id);
        }
      }
    } catch (err) {
      console.error('Error fetching song details:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  });

  async function fetchVoteCounts(post_id) {
    const { count: upvotesCountData } = await supabase
      .from('likes')
      .select('id', { count: 'exact' })
      .eq('post_id', post_id)
      .eq('isLiked', true);

    const { count: downvotesCountData } = await supabase
      .from('likes')
      .select('id', { count: 'exact' })
      .eq('post_id', post_id)
      .eq('isLiked', false);

    netVotes[post_id] = (upvotesCountData || 0) - (downvotesCountData || 0);
  }

  async function checkUserVote(post_id) {
    const { data: existingVote } = await supabase
      .from('likes')
      .select('isLiked')
      .eq('post_id', post_id)
      .eq('profile_id', logged_in_user_uuid)
      .maybeSingle();

    if (existingVote) {
      userVotes[post_id] = existingVote.isLiked ? 'upvote' : 'downvote';
    } else {
      userVotes[post_id] = null;
    }
  }

  async function toggleVote(voteType, post_id) {
    if (processingVote || !logged_in_user_uuid) return;

    processingVote = true;
    try {
      const { data: existingVote } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', post_id)
        .eq('profile_id', logged_in_user_uuid)
        .maybeSingle();

      if (existingVote) {
        if (
          (existingVote.isLiked && voteType === 'upvote') ||
          (!existingVote.isLiked && voteType === 'downvote')
        ) {
          await removeVote(existingVote.id, existingVote.isLiked, post_id);
        } else {
          await updateVote(
            existingVote.id,
            voteType === 'upvote',
            existingVote.isLiked,
            post_id
          );
        }
      } else {
        await addVote(voteType === 'upvote', post_id);
      }
    } catch (err) {
      console.error('Error toggling vote:', err);
      alert('Failed to process your vote. Please try again.');
    } finally {
      processingVote = false;
    }
  }

  async function addVote(isUpvote, post_id) {
    const { error } = await supabase
      .from('likes')
      .insert({
        post_id,
        profile_id: logged_in_user_uuid,
        isLiked: isUpvote,
      });

    if (error) throw error;

    netVotes[post_id] += isUpvote ? 1 : -1;
    userVotes[post_id] = isUpvote ? 'upvote' : 'downvote';
  }

  async function updateVote(voteId, isUpvote, wasUpvote, post_id) {
    const { error } = await supabase
      .from('likes')
      .update({ isLiked: isUpvote })
      .eq('id', voteId)
      .eq('profile_id', logged_in_user_uuid);

    if (error) throw error;

    if (wasUpvote && !isUpvote) {
      netVotes[post_id] -= 2;
    } else if (!wasUpvote && isUpvote) {
      netVotes[post_id] += 2;
    }

    userVotes[post_id] = isUpvote ? 'upvote' : 'downvote';
  }

  async function removeVote(voteId, wasUpvote, post_id) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', voteId);

    if (error) throw error;

    netVotes[post_id] += wasUpvote ? -1 : 1;
    userVotes[post_id] = null;
  }

  function renderStars(rating) {
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
    return stars.join('');
  }
</script>

<div class="wrapper">
  {#if loading}
    <p>Loading song details...</p>
  {:else if error}
    <p>Error: {error}</p>
  {:else}
    <div class="song-details">
      <img src={songDetails.image_url} alt="{songDetails.title} album cover" />
      <div class="song-info">
        <h1>{songDetails.title}</h1>
        <p>by {songDetails.artist}</p>
      </div>
    </div>

    <h2>Reviews</h2>

    {#if reviews.length > 0}
    {#each reviews as review}
      <div class="inner-wrapper">
        <div class="top-bar">
          <div class="user-info">
            <img class="profile-pic" src={review.profiles.avatar_url || 'https://placehold.co/30'} alt="profile" />
            <span class="username">
              <a class="username-link" href="/profiles/{review.profiles.username}">{review.profiles.username}</a>
            </span>
          </div>
        </div>

        <div class="content-wrapper">
          <div class="album-cover-container">
            <img
              class="album-cover"
              src={songDetails.image_url}
              alt="{songDetails.title} album cover"
            />
            <a href="/discover/{song_id}" class="play-button" aria-label="Play Song">
              <i class="fa-solid fa-play"></i>
            </a>
          </div>

          <div class="song-info-wrapper">
            <p class="song-name">{songDetails.title}</p>
            <p class="artist-name">by {songDetails.artist}</p>
            <p class="review-preview">{review.content}</p>
          </div>

          <div>
            <div class="rating-wrapper">
              <p>{@html renderStars(review.rating)}</p>
            </div>

            <div class="vote-section">
              <button
                on:click={() => toggleVote('upvote', review.id)}
                disabled={!logged_in_user_uuid || processingVote}
                class="vote-button upvote-button"
                aria-label="Upvote"
                class:selected={userVotes[review.id] === 'upvote'}
              >
                <i class="fa-solid fa-arrow-up"></i>
              </button>

              <span class="net-vote-count">{netVotes[review.id]}</span>

              <button
                on:click={() => toggleVote('downvote', review.id)}
                disabled={!logged_in_user_uuid || processingVote}
                class="vote-button downvote-button"
                aria-label="Downvote"
                class:selected={userVotes[review.id] === 'downvote'}
              >
                <i class="fa-solid fa-arrow-down"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    {/each}
  {:else}
    <p>No reviews yet. Be the first to review!</p>
  {/if}
  {/if}
</div>
<style>
  .wrapper{
    margin: 0;
  }
  /* Add your styles here */
  .song-details {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  .song-details img {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    margin-right: 20px;
  }

  .song-info h1 {
    margin: 0;
    font-size: 2rem;
  }

  .song-info p {
    margin: 5px 0;
    font-size: 1.2rem;
    color: #888;
  }

  .reviews-list {
    margin-top: 20px;
  }

  .review-item {
    background-color: #1d1f25;
    color: #f3f1f1;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 15px;
  }

  .user-info {
    display: flex;
    align-items: center;
  }

  .user-info img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
  }

  .review-content {
    margin-top: 10px;
  }

  .rating {
    margin-top: 10px;
    font-weight: bold;
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
    
    min-height: 150px;
    border-radius: 8px;
  }

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #26282c;
    padding: 10px;
    width: 100%;
    box-sizing: border-box;
    border-radius: 8px 8px 0 0;
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

  .content-wrapper {
    display: flex;
    align-items: flex-start;
    margin-top: 20px;
    flex-wrap: wrap;
  }

  .album-cover-container {
    position: relative;
    max-width: 100px;
    height: auto;
    margin-right: 15px;
    flex-shrink: 0;
  }

  .album-cover {
    width: 100%;
    height: auto;
    object-fit: cover;
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
  }

  .rating-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 10px;
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

  /* Responsive Styles */
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
      max-width: 100%;
      margin-right: 0;
      margin-bottom: 20px;
    }

    .song-info-wrapper {
      margin-left: 0;
      text-align: center;
      margin-top: 10px;
    }
  }
</style>