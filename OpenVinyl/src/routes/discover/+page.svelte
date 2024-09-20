
<script>
  let boxes = [
    { id: 1, imageUrl: getRandomImage(), songId: "2up3OPMp9Tb4dAKM2erWXQ" },
    { id: 2, imageUrl: getRandomImage(), songId: "2up3OPMp9Tb4dAKM2erWXQ" },
    { id: 3, imageUrl: getRandomImage(), songId: "2up3OPMp9Tb4dAKM2erWXQ" },
    { id: 4, imageUrl: getRandomImage(), songId: "2up3OPMp9Tb4dAKM2erWXQ" },
    { id: 5, imageUrl: getRandomImage(), songId: "2up3OPMp9Tb4dAKM2erWXQ" },
    { id: 6, imageUrl: getRandomImage(), songId: "2up3OPMp9Tb4dAKM2erWXQ" },
    { id: 7, imageUrl: getRandomImage(), songId: "2up3OPMp9Tb4dAKM2erWXQ" },
    { id: 8, imageUrl: getRandomImage(), songId: "2up3OPMp9Tb4dAKM2erWXQ" },
    { id: 9, imageUrl: getRandomImage(), songId: "2up3OPMp9Tb4dAKM2erWXQ" }
  ];


  function onKeyDown(e) {
    console.log("keypress");

    switch(e.keyCode) {

      case 38: 
        moveGrid("up");
        break;
      case 40:
        moveGrid("down");
        break;
      case 37: 
        moveGrid("right");
        break;
      case 39: 
        moveGrid("left");
        break;
    }
  }

  function moveGrid(direction) {
    let newBoxes = [...boxes]; 
    switch (direction) {
      case "up":
        newBoxes = newBoxes.slice(0, 6); 
        newBoxes.unshift(
          generateNewBox(), generateNewBox(), generateNewBox()
        ); 
        break;
      case "down":
        newBoxes = newBoxes.slice(3); 
        newBoxes.push(
          generateNewBox(), generateNewBox(), generateNewBox()
        ); 
        break;
      case "left":
        for (let i = 0; i < 9; i += 3) {
          newBoxes.splice(i, 1); 
          newBoxes.splice(i + 2, 0, generateNewBox());
        }
        break;
      case "right":
        for (let i = 0; i < 9; i += 3) {
          newBoxes.splice(i + 2, 1); 
          newBoxes.splice(i, 0, generateNewBox()); 
        }
        break;
    }
    boxes = newBoxes;
  }
  function getRandomImage() {
    let i = Math.random();
    return "https://loremflickr.com/200/200?random=" + i;
    
  }
  // Generate new box (could be based on recommendations or random)
  function generateNewBox() {
    return {
      id: Math.random(), // Use a random id for demo
      imageUrl: getRandomImage(), // Placeholder for now
      songId: "randomSongId" // Random songId for now
    };
  }
</script>

<div class="game-board">
  {#each boxes as box (box.id)}
    <div class="box">
      <img src={box.imageUrl} alt="Image {box.id}" />
    </div>
  {/each}
</div>

<style>
  .game-board {
    display: grid;
    grid-template-rows: 200px 200px 200px;
    grid-template-columns: 200px 200px 200px;
    gap: 10px;
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
    padding-top: 100px;
    padding-bottom: 100px;
    transition: transform 0.5s ease-in-out;
  }

  .box {
    background: #444;
    border: 1px solid #555;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #aaa;
    opacity: 1;
    transition: transform 0.5s ease-in-out, opacity 0.5s ease-in-out;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
  }
</style>

<svelte:window on:keydown|preventDefault={onKeyDown} />
