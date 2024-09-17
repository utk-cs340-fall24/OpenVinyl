<style>
  div{
    height: fit-content;
    padding: 0;
    margin-top: 41vh;
    margin-left: auto;
    margin-right: auto;
    width:fit-content;
  }
  h1{
    font-family: 'JetBrains Mono';
    text-align: center;
    font-size: 64px;
  }
    
  @keyframes typing {
    from { width: 0px }
    to { width: 100% }
  }

  @keyframes waiting{
    from {opacity: 0}
    to {opacity: 100}
  }

  @keyframes bounceOpen {
    from { width : 0px }
    to { width : 590px }
  }

  .typewriter h1 {
    color: #fff;
    overflow: hidden; /* Ensures the content is not revealed until the animation */
    white-space: nowrap; /* Keeps the content on a single line */
    margin: 0 auto; /* Gives that scrolling effect as the typing happens */
    letter-spacing: .19em; /* Adjust as needed */
    animation: typing 1.25s steps(12, end) forwards;
    animation-delay: 1.75s;
  }

  .outer-wrapper{
    border-radius: 15px;
    background-color: #4f4f4f;
    filter: drop-shadow(5px 5px 10px #000000);
    padding: 10px;
    height: fit-content;
    margin:0;
    width: 0px;
    animation: bounceOpen 1s cubic-bezier( 0.175, 0.885, 0.32, 1.275 ) forwards;
    animation-delay: 0.75s;
  }

  .inner-wrapper{
    margin: 0;
    opacity: 0;
    animation: waiting 0.01s ease-in forwards;
    animation-delay: 1.75s;
  }

  .fade-in{
    margin-left: auto;
    margin-right: auto;
    margin-top: 50px;
  }
  
  .fade-in button{
    opacity: 0;
    animation: waiting 1.65s forwards;
    animation-delay: 4.75s;
  }

  button{
    background-color: #00000000;
    border: none;
    color: white;
  }
</style>

<div class="typewriter animated">
  <div class="outer-wrapper">
    <div class="inner-wrapper">
      <h1>Hello World!</h1>
    </div>
  </div>
  <div class="fade-in">
    <button onClick="window.location.reload();">
      <span class="material-symbols-outlined">
        refresh
      </span>
    </button>
  </div>
</div>
