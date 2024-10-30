
<div class="games-page">
    <h1 class="title">Games</h1>
    <div class="games-container">
      <div class="game-card">
        <a href="/plinko">
          <img src="/plinko.png" alt="Plinko Game" class="game-image" />
          <div class="game-title">Plinko</div>
        </a>
      </div>
      <!-- Add more game cards here when you have more games -->
    </div>
  </div>
  
  <style>
    /* Main Page Styling */
    .games-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      background: #121212;
      min-height: 100vh;
      color: #ffffff;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
  
    /* Title Styling */
    .title {
      font-size: 3em;
      margin-bottom: 50px;
      text-shadow: 0 0 15px rgba(0, 0, 0, 0.7);
    }
  
    /* Games Container */
    .games-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 40px;
    }
  
    /* Game Card Styling */
    .game-card {
      background-color: #222;
      border-radius: 15px;
      overflow: hidden;
      width: 300px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      transition: transform 0.3s, box-shadow 0.3s;
    }
  
    .game-card:hover {
      transform: translateY(-15px);
      box-shadow: 0 20px 35px rgba(0, 0, 0, 0.7);
    }
  
    /* Game Image Styling */
    .game-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
  
    /* Game Title Styling */
    .game-title {
      padding: 20px;
      text-align: center;
      font-size: 1.8em;
      font-weight: bold;
      background-color: #ff6347;
      color: #fff;
      transition: background-color 0.3s;
    }
  
    .game-card:hover .game-title {
      background-color: #e5533d;
    }
  
    /* Link Styling */
    a {
      text-decoration: none;
      color: inherit;
    }
  
    /* Responsive Design */
    @media (max-width: 768px) {
      .game-card {
        width: 80%;
      }
    }
  
    @media (max-width: 480px) {
      .title {
        font-size: 2.5em;
      }
  
      .game-title {
        font-size: 1.5em;
      }
    }
  </style>