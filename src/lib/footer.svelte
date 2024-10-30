<div class="footer-wrapper">
  <footer>
    <div class="footer-content">
      <p class="footer-text">&copy; {new Date().getFullYear()} Open Vinyl. All rights reserved.</p>
    </div>
  </footer>
</div>

<style>
  .footer-wrapper {
    width: 100%;
    background-color: #1d1f25;
    border-top: 1px solid #26282c;
  }

  footer {
    display: flex;
    justify-content: center;
    padding: 10px;
    
    align-items: center;
  }

  .footer-content {
    text-align: center;
  }

  .footer-text {
    color: #b9b9b9; 
    font-size: 0.8rem;
    margin: 0;
  }

  @media (max-width: 768px) {
    .footer-text {
      font-size: 0.7rem;
    }
  }
</style>
