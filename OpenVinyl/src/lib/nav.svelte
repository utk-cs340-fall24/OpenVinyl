<div class="wrapper">
  <nav>
    <div class="left-nav">
      <a href="/" class="title">OpenVinyl</a>
      <a href="/discover">Discover</a>
      <a href="/charts">Charts</a>
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
    background-color: #1e1d1d;
    padding:15px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    font-family: "Concert One", sans-serif;
  }
  .title{
    font-size:32px;
    margin:0;
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
    margin-top: 10px;
    padding: 0;
    height: fit-content;
    text-decoration: none;
    color: #ebe9e5;
  }
  nav a:hover{
    color: #6a6a6a;
  }
  nav p{
    padding: 0;
    margin-top: 10px;
    margin-bottom: 0;
  }

 </style>