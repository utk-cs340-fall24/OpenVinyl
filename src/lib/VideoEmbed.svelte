<script>
    // No additional script needed
  </script>
  
  <div class="video-container">
    <iframe
      src="https://www.youtube.com/embed/7d_TkHApCVQ?autoplay=1&loop=1&playlist=7d_TkHApCVQ&mute=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0"
      frameborder="0"
      allow="autoplay; encrypted-media"
      allowfullscreen
      class="video-iframe"
    ></iframe>
    <div class="video-mask"></div>
  </div>
  
  <style>
    .video-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  
    .video-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  
    .video-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.0);
      pointer-events: none; 
      z-index: 1;
    }
  
    .video-mask::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 230px;
      height: 300px;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0); 
      box-shadow: 0 0 0 9999px #121212;
      border-radius: 8px;
    }
  
    @media (max-width: 768px) {
      .video-mask::after {
        width: 150px;
        height: 150px;
      }
    }
  </style>