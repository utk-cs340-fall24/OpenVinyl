<script>
    export let comment = {
      id: '',
      profile_id: '',
      comment: '',
      created_at: '',
      profiles: {
        username: '',
        avatar_url: ''
      }
    };
    
    function formatDate(dateStr) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString(undefined, options);
    }
  </script>
  
  <div class="comment">
    <img class="avatar" src={comment.profiles.avatar_url} alt={`${comment.profiles.username}'s avatar`} />
    <div class="comment-content">
      <div class="comment-header">
        <span class="username">{comment.profiles.username}</span>
        <span class="timestamp">{formatDate(comment.created_at)}</span>
      </div>
      <p class="comment-text">{comment.comment}</p>
    </div>
  </div>
  
  <style>
    .comment {
      display: flex;
      align-items: flex-start;
      padding: 15px;
      background-color: #2a2d35;
      border-radius: 8px;
      margin-bottom: 15px;
      transition: background-color 0.3s;
    }
  
    .comment:hover {
      background-color: #353a44;
    }
  
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 15px;
      flex-shrink: 0;
    }
  
    .comment-content {
      flex: 1;
    }
  
    .comment-header {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
    }
  
    .username {
      font-weight: bold;
      color: #f3f1f1;
      margin-right: 10px;
      text-decoration: none;
    }
  
    .timestamp {
      font-size: 0.8rem;
      color: #a9a9a9;
    }
  
    .comment-text {
      margin: 0;
      color: #e4e4e4;
      line-height: 1.4;
    }
  </style>
  