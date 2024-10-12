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
    import Comment from '$lib/comment.svelte';

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
    let avatar_url = null;
    let isSubmitting = false;
    onMount(async () => {
        await authenticateClientCredentials();
        const trackData = await spotify.getTrack(post.song_id);
        song = {
            id: post.song_id,
            title: trackData.name,
            artist: trackData.artists[0].name,
            image_url: trackData.album.images[0].url
        }
        
      fetchLikesCount();
      console.log(post)
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", post.profile_id)
        .maybeSingle();
        
        if (data) {
            console.log(data.avatar_url)
            avatar_url = data.avatar_url;
        }
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
  
    async function addComment() {
      if (!newComment.trim()) return;
      isSubmitting = true;
  
      console.log("user: ", currentUser)
      if (!currentUser) {
        alert('You must be logged in to comment.');
        isSubmitting = false;
        return;
      }
      
      const { data: inserted, error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: post.id,
            profile_id: currentUser.id,
            comment: newComment
          }
        ])
        .select(`id, profile_id, comment, created_at`)
        .single();
  
      if (error) {
        console.error('Error adding comment:', error);
        alert('Failed to add comment. Please try again.');
      } else {
        // Fetch user info for the current user
        const { data: userInfo, error: userError } = await supabase
          .from('profiles')
          .select(`username, avatar_url`)
          .eq('id', currentUser.id)
          .single();
  
        if (userError) {
          console.error('Error fetching user info:', userError);
          alert('Failed to fetch user info for the comment.');
        } else {
          // Assign a new array to trigger reactivity
          console.log("comments before, ", comments)
          console.log(inserted)
          comments = [
            ...comments,
            {
              ...inserted,
              profiles: {
                username: userInfo.username,
                avatar_url: userInfo.avatar_url
              }
            }
          ];
          console.log("comments now", comments)
        }
        newComment = '';
      }
  
      isSubmitting = false;
    }
  </script>
  
<div class="post-detail-wrapper">
    <div class="post-header">
      <div class="user-info">
        <img class="profile-pic" src={avatar_url} alt="profile" />
        <span class="username">{post.profiles.username}</span> 
        <span>&nbsp;reviewed</span>
      </div>
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
  
    <div class="like-section">
      <button
        on:click={toggleLike}
        disabled={!currentUser}
        class="like-button"
      >
        <i class={`fa-heart ${liked ? 'fas liked' : 'far'}`}></i>
        <span class="like-text">{liked ? "Liked" : "Like"}</span>
      </button>
      <span class="like-count">{likesCount}</span>
    </div>
   
    <section class="comments-section">
      <h2>Comments ({comments.length})</h2>
  
      <form on:submit|preventDefault={addComment} class="comment-form">
        <textarea
          bind:value={newComment}
          placeholder="Write a comment..."
          rows="3"
          required
        ></textarea>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
  
      <!-- Display Comments -->
      <div class="comments-list">
        {#each comments as comment (comment.id)}
          <Comment {comment} />
        {/each}
        {#if comments.length === 0}
          <p class="no-comments">No comments yet. Be the first to comment!</p>
        {/if}
      </div>
    </section>
  </div>
  
  <style>
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
  
    .post-detail-wrapper {
      padding: 20px;
      background-color: #1d1f25;
      color: #f3f1f1;
      border: 1px solid #26282c;
      border-radius: 8px;
      font-family: 'Concert One', sans-serif;
    }
  
    .post-header {
      display: flex;
      /* justify-content: center; */
      /* align-items: center; */
      margin-bottom: 20px;
    }
  
    .user-info {
      display: flex;
      align-items: center;
    }
  
    .profile-pic {
      width: 50px; /* Increased size for better visibility */
      height: 50px;
      border-radius: 50%;
      margin-right: 15px;
      object-fit: cover;
    }
  
    .username {
      font-size: 1.2rem; /* Increased font size */
      color: #b9b9b9;
      font-weight: bold;
    }
  
    .post-content {
      display: flex;
      margin-top: 20px;
      align-items: center;
      gap: 20px; /* Added gap for better spacing */
    }
  
    .album-cover-container {
      display: flex;
      /* position: relative; */
      width: 200px;
      height: 200px;
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
      font-size: 2rem; /* Increased font size */
      margin: 0;
      color: #e4e4e4;
    }
  
    .song-artist {
      font-size: 1.2rem; /* Increased font size */
      color: #b9b9b9;
    }
  
    .post-rating {
      margin-top: 10px;
      color: #ffc107;
      font-size: 1.2rem;
    }
  
    .post-content-section {
      margin-top: 20px;
      font-size: 1.1rem;
      line-height: 1.6;
    }
  
    .like-section {
      display: flex;
      align-items: center;
      margin-top: 15px;
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
  
    .like-button i {
      margin-right: 8px;
      color: #f3f1f1;
      font-size: 1.2rem;
    }
  
    .like-button i.liked {
      color: #007bff;
    }
  
    .like-text {
      min-width: 45px;
      display: inline-block;
      font-size: 1rem;
      color: #f3f1f1;
    }
  
    .like-text.liked {
      color: #007bff;
    }
  
    .like-count {
      width: 24px;
      height: 24px;
      margin-left: 10px;
      text-align: center;
      background-color: #007bff;
      color: white;
      border-radius: 50%;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  
    /* Comments Section */
    .comments-section {
      margin-top: 40px;
    }
  
    .comments-section h2 {
      margin-bottom: 20px;
      color: #ffffff;
      font-size: 1.5rem;
    }
  
    .comment-form {
      display: flex;
      flex-direction: column;
      margin-bottom: 30px;
    }
  
    .comment-form textarea {
      resize: vertical;
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #444;
      background-color: #2a2d35;
      color: #f3f1f1;
      font-size: 1rem;
      margin-bottom: 10px;
    }
  
    .comment-form textarea::placeholder {
      color: #a9a9a9;
    }
  
    .comment-form button {
      align-self: flex-end;
      padding: 10px 20px;
      background-color: #007bff;
      border: none;
      border-radius: 6px;
      color: #ffffff;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.3s;
    }
  
    .comment-form button:hover {
      background-color: #0056b3;
    }
  
    .comment-form button:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
  
    .comments-list {
      display: flex;
      flex-direction: column;
    }
  
    .no-comments {
      color: #a9a9a9;
      font-style: italic;
    }
  
    @media (max-width: 768px) {
      .post-detail-wrapper {
        padding: 15px;
      }
  
      .post-header {
        flex-direction: column;
        align-items: flex-start;
      }
  
      .user-info {
        margin-bottom: 15px;
      }
  
      .post-content {
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
  
      .album-cover-container {
        width: 100%;
        height: auto;
        margin-right: 0;
        margin-bottom: 15px;
      }
  
      .song-info {
        text-align: center;
      }
  
      .song-title {
        font-size: 1.8rem;
      }
  
      .song-artist {
        font-size: 1.1rem;
      }
  
      .post-rating {
        font-size: 1rem;
      }
  
      .post-content-section {
        font-size: 1rem;
      }
  
      .like-section {
        justify-content: center;
      }
  
      .like-button i {
        font-size: 1rem;
        margin-right: 5px;
      }
  
      .like-text {
        font-size: 0.9rem;
      }
  
      .like-count {
        width: 20px;
        height: 20px;
        margin-left: 8px;
        font-size: 0.8rem;
      }
    }
  </style>