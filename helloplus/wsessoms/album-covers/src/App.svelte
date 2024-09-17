<script>

	let images = [
		"https://i.scdn.co/image/ab67616d0000b2738c8ba2255c9813ced88ac90c",
		"https://i.scdn.co/image/ab67616d0000b2737532f8f3e58551b996e3b843",
		"https://i.scdn.co/image/ab67616d0000b2732366e6480396347943c45cef",
		"https://i.scdn.co/image/ab67616d0000b2731465ed739867d850aeb6aa71",
		"https://i.scdn.co/image/ab67616d0000b273420ea174ee8015c3f6dc683b",
		"https://i.scdn.co/image/ab67616d0000b2730a4a4412593bd5bfc5e9844b",
		"https://i.scdn.co/image/ab67616d0000b27345a30e97e37a879227f27679",
		"https://i.scdn.co/image/ab67616d0000b2736047db4c19dc348070cb1a64"
	]

	let currentImage = images[0];

	function getRandomImage() {
    	const randomIndex = Math.floor(Math.random() * images.length); // Pick a random image index
		currentImage = images[randomIndex];
  	}
</script>

<main class ="container">
	<img src={currentImage} alt="Random Cover Art"/>
	<button on:click={getRandomImage}>Random julie cover art</button>
</main>

<style>

	.container {
    	display: flex;
    	flex-direction: column;
    	align-items: center;
		margin: 10px;
  	}

	button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    color: white;
	font-weight: bold;
    border: none;
    border-radius: 5px;
	margin: 20px;
	background: linear-gradient(to top, #360000, #9b0000);
  }

	button:hover {
		background: linear-gradient(to top, #6e0000, #d30000);
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>