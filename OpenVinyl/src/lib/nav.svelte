<div class="wrapper">
  <nav>
    <div class="left-nav">
      <a href="/">home</a>
      <a href="/about">about</a>
      <a href="/discover">discover</a>
      <a href="/charts">charts</a>
    </div>
    <div class="right-nav">
      <p>username</p>
    </div>
  </nav>
</div>
 
 <style>
  .wrapper{
    position:fixed;
    width: 100%;
    top:0;
    z-index: 100;
  }
  nav{
    background-color: #454545;
    padding:15px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .left-nav{
    width:50%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }
  .right-nav{
    width: 50%;
    text-align: right;
  }
  nav a {
    margin: 0;
    padding: 0;
    text-decoration: none;
    color: #a6a6a6;
  }
  nav a:hover{
      color: #6a6a6a;
  }
  nav p{
    padding: 0;
    margin: 0;
  }
 </style>