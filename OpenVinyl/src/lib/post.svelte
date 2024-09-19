<div class="wrapper">
  <div class="user-wrapper">
    <h2>(pfp)  username</h2>
  </div>
  <div class="rating-wrapper">
    <p>rating 1-10 ....</p>
    <p>this is a post content</p>
  </div>
  <div class="img-wrapper">
    img
  </div>
</div>

<style>
  .wrapper{
    display:grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    background-color: #b7b7b7;
    width:55vw;
    margin-left:auto;
    margin-right:auto;
    border-radius: 15px;
    margin-top:25px;
    margin-bottom:25px;
  }

  .img-wrapper{
    grid-column: 1;
    grid-row: 2;
    margin: 20px;
    width: 100px;
    height: 100px;
    background-color:#999999;
  }

  .user-wrapper{
    grid-column: 1;
    grid-row: 1;
    width:fit-content;
  }

  .rating-wrapper{
    grid-column: 2;
    grid-row:2;
  }

</style>