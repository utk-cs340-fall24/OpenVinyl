<!-- src/routes/posts/[post_id]/+page.svelte -->

<script>
    import { onMount, onDestroy } from 'svelte';
    import { supabase } from '$lib/supabaseClient';
    import { user } from "$lib/stores";
    import { page } from "$app/stores";
    import {authenticateClientCredentials} from "$lib/utils.js";
    import "@fortawesome/fontawesome-free/css/all.css";
    import "@fortawesome/fontawesome-free/js/all.js";
    import {spotify} from "$lib/spotifyClient.js";
    export let data;
    let { post, comments } = data;
    //song - id, img_url, title, artist
    let currentUser = null;
    const unsubscribe = user.subscribe(value => {
      currentUser = value;
      if (currentUser) {
        checkIfLiked();
      }
    });
  
    onDestroy(() => {
      unsubscribe();
    });
  let song = null;
    // Like State
    let liked = false;
    let likesCount = 0;
    let processingLike = false;
  
    onMount(async () => {
        await authenticateClientCredentials();
        const trackData = await spotify.getTrack(post.song_id);
        song = {
            id: post.song_id,
            title: trackData.name,
            artist: trackData.artists[0].name,
            image_url: trackData.album.images[0].url
        }
        console.log(song)
        console.log(data)
      fetchLikesCount();
  
      if (currentUser) {
        checkIfLiked();
      }
    });
  
    async function fetchLikesCount() {
      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
  
      if (error) {
        console.error('Error fetching likes count:', error);
        return;
      }
  
      likesCount = count;
    }
  
    async function checkIfLiked() {
      if (!currentUser) return;
  
      const { data: existingLike, error } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', post.id)
        .eq('profile_id', currentUser.id)
        .single();
  
      if (error && error.code !== 'PGRST116') { 
        console.error('Error checking if liked:', error);
        return;
      }
  
      liked = !!existingLike;
    }
  
    async function toggleLike(event) {
      event.stopPropagation();
      if (processingLike || !currentUser) return;
  
      processingLike = true;
  
      try {
        if (liked) {
          const { error } = await supabase
            .from('likes')
            .delete()
            .eq('post_id', post.id)
            .eq('profile_id', currentUser.id);
  
          if (error) throw error;
  
          liked = false;
          likesCount -= 1;
        } else {
          // Add like
          const { error } = await supabase
            .from('likes')
            .insert({ post_id: post.id, profile_id: currentUser.id });
  
          if (error) throw error;
  
          liked = true;
          likesCount += 1;
        }
      } catch (err) {
        console.error('Error toggling like:', err);
      } finally {
        processingLike = false;
      }
    }
  
    // Function to render stars based on rating
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
  
    // Comment Handling (Optional)
    let newComment = '';
  
    async function submitComment() {
      if (!newComment.trim()) return;
  
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          profile_id: currentUser.id,
          comment: newComment.trim()
        });
  
      if (error) {
        console.error('Error adding comment:', error);
        return;
      }
      
      // Refresh comments
      const { data: updatedComments, error: fetchError } = await supabase
        .from('comments')
        .select(`
          id,
          profile_id,
          comment,
          created_at,
          profiles(username)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
  
      if (fetchError) {
        console.error('Error fetching comments:', fetchError);
        return;
      }
  
      comments = updatedComments;
      newComment = '';
    }
  </script>
  
  <div class="post-detail-wrapper">
    <div class="post-header">
      <div class="user-info">
        <img class="profile-pic" src={'https://placehold.co/30'} alt="profile" />
        <span class="username">{post.profiles.username}</span>
      </div>
      <!-- <div class="post-actions"> -->
        <!-- <button
          on:click={toggleLike}
          disabled={!currentUser}
          class={`like-button ${liked ? 'liked' : ''}`}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <i class={`fa${liked ? 's' : 'r'} fa-heart`}></i>
          <span>{liked ? 'Liked' : 'Like'}</span>
        </button> -->
        <!-- <span class="like-count">{likesCount}</span> -->
      <!-- </div> -->
    </div>
  
    <div class="post-content">
      {#if song}
        <div class="album-cover-container">
          <img class="album-cover" src={song.image_url || 'https://placehold.co/300'} alt="album cover" />
          <a href={`/discover/${song.id}`} class="play-button" aria-label="Play Song">
            <i class="fa-solid fa-play"></i>
          </a>
        </div>
        <div class="song-info">
          <h2 class="song-title">{song.title || 'Song Title'}</h2>
          <p class="song-artist">{song.artist || 'Artist Name'}</p>
        </div>
      {:else}
        <div class="no-song">
          <p>No song associated with this post.</p>
        </div>
      {/if}
    </div>
  
    <div class="post-rating">
      <p>{@html renderStars(post.rating)}</p>
    </div>
  
    <div class="post-content-section">
      <p>{post.content || 'No content provided.'}</p>
    </div>
  
    <div>
        
        <div class="like-section">
          <button
            on:click={toggleLike}
            disabled={!currentUser}
            class="like-button"
          >
            <span class="like-text" class:liked>{liked ? "Liked" : "Like"}</span>
          </button>
          <span class="like-count">{likesCount}</span>
        </div>
      </div>
    <div class="comments-section">
      <h3>Comments</h3>
      {#if comments.length > 0}
        {#each comments as comment}
          <div class="comment">
            <!-- <img class="comment-profile-pic" src={'https://placehold.co/30'} alt="profile" /> -->
            <div class="comment-content">
              <span class="comment-username">{comment.profiles.username}</span>
              <p class="comment-text">{comment.comment}</p>
            </div>
          </div>
        {/each}
      {:else}
        <p>No comments yet. Be the first to comment!</p>
      {/if}
  
      {#if currentUser}
        <div class="add-comment">
          <form on:submit|preventDefault={submitComment}>
            <textarea bind:value={newComment} placeholder="Add a comment..." required></textarea>
            <button type="submit">Submit</button>
          </form>
        </div>
      {:else}
        <p>Please <a href="/login">log in</a> to add a comment.</p>
      {/if}
    </div>
  </div>
  
  <style>
    /* Base Styles */
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
  
    .post-detail-wrapper {
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background-color: #1d1f25;
      color: #f3f1f1;
      border: 1px solid #26282c;
      border-radius: 8px;
      font-family: 'Concert One', sans-serif;
    }
  
    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  
    .user-info {
      display: flex;
      align-items: center;
    }
  
    .profile-pic {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 10px;
      object-fit: cover;
    }
  
    .username {
      font-size: 1rem;
      color: #b9b9b9;
    }
  
    .post-actions .like-button {
      background: none;
      border: none;
      color: #f3f1f1;
      cursor: pointer;
      display: flex;
      align-items: center;
      font-size: 1rem;
      transition: color 0.3s;
    }
  
    .post-actions .like-button:hover {
      color: #007bff;
    }
  
    .post-actions .like-button.liked {
      color: #007bff;
    }
  
    .like-count {
      margin-left: 8px;
      font-size: 0.9rem;
      color: #b9b9b9;
    }
  
    .post-content {
      display: flex;
      margin-top: 20px;
      align-items: center;
    }
  
    .album-cover-container {
      position: relative;
      width: 200px;
      height: 200px;
      margin-right: 20px;
      flex-shrink: 0;
    }
  
    .album-cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
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
  
    .song-info {
      flex: 1;
    }
  
    .song-title {
      font-size: 1.5rem;
      margin: 0;
    }
  
    .song-artist {
      font-size: 1rem;
      color: #b9b9b9;
    }
  
    .post-rating {
      margin-top: 10px;
      color: #ffc107;
    }
  
    .post-content-section {
      margin-top: 20px;
      font-size: 1rem;
      line-height: 1.5;
    }
  
    .likes-section {
      display: flex;
      align-items: center;
      margin-top: 10px;
    }
  
    .likes-section .like-button {
      background: none;
      border: none;
      color: #f3f1f1;
      cursor: pointer;
      display: flex;
      align-items: center;
      font-size: 1rem;
      transition: color 0.3s;
    }
  
    .likes-section .like-button:hover {
      color: #007bff;
    }
  
    .likes-section .like-button.liked {
      color: #007bff;
    }
  
    .comments-section {
      margin-top: 30px;
    }
  
    .comments-section h3 {
      margin-bottom: 15px;
    }
  
    .comment {
      display: flex;
      align-items: flex-start;
      margin-bottom: 15px;
    }
  
    .comment-profile-pic {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      margin-right: 10px;
      object-fit: cover;
    }
  
    .comment-content {
      background-color: #26282c;
      padding: 10px;
      border-radius: 5px;
      width: 100%;
    }
  
    .comment-username {
      font-weight: bold;
      color: #f3f1f1;
    }
  
    .comment-text {
      margin: 5px 0 0 0;
      color: #ccc;
    }
  
    /* Add Comment Form Styles */
    .add-comment {
      margin-top: 20px;
    }
  
    .add-comment form {
      display: flex;
      flex-direction: column;
    }
  
    .add-comment textarea {
      resize: vertical;
      min-height: 60px;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid #ccc;
      margin-bottom: 10px;
      font-family: inherit;
    }
  
    .add-comment button {
      align-self: flex-end;
      padding: 8px 16px;
      background-color: #007bff;
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
    }
  
    .add-comment button:hover {
      background-color: #0056b3;
    }

  .like-section {
    display: flex;
    align-items: center;
    justify-content: start;
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

  
    /* Responsive Styles */
    @media (max-width: 768px) {
      .post-content {
        flex-direction: column;
        align-items: center;
      }
  
      .album-cover-container {
        width: 100%;
        height: auto;
        margin-right: 0;
        margin-bottom: 20px;
      }
  
      .play-button {
        font-size: 1.5rem;
        padding: 10px;
      }
  
      .song-info {
        text-align: center;
      }
  
      .likes-section {
        justify-content: center;
      }
    }
  </style>
  