# Sprint 1

- Weston Agreda
- wagreda
- OpenVinyl  

### What you planned to do

- Design the home page and figure out what elements need to be on it
- Create the initial HTML and CSS for the home page, posts, and post creation
- Create functionality for viewing, creating, and interacting with posts

### What you did not do

- Design mobile friendly CSS
- Finalize the CSS for posts
- Create a drop down menu for song selection on the post creation screen

### What problems you encountered

- Linking users to posts 
- Displaying the correct song title on the posts
- Pulling data from Supabase 
- Using more spotify API requests than needed

### Issues you worked on

- Dropdown to select song when searching for tracks functionality [#53](https://github.com/utk-cs340-fall24/OpenVinyl/issues/53)
- Post fetching on home page [#11](https://github.com/utk-cs340-fall24/OpenVinyl/issues/11)
- Initial home page HTML and CSS [#6](https://github.com/utk-cs340-fall24/OpenVinyl/issues/6)
  
### Files you worked on
- OpenVinyl/src/routes/(app)/+layout.svelte
- OpenVinyl/src/lib/nav.svelte
- OpenVinyl/src/lib/postCreation.svelte
- OpenVinyl/src/lib/post.svelte
- OpenVinyl/src/lib/addPostBtn.svelte

### What you accomplished

I created the functionality for post creation, which involved functions for pushing data to the database, getting song data from Spotify, and getting the user information upon post creation. I also made the home page HTML layout and initial CSS for posts and the nav bar. I created the post components and made it so that they would pull from our Supabase database of posts and display on the home page. I also helped to design the logo and design the initial UI for the main page.
