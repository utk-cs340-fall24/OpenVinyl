# Sprint 2

Name - Grant Johnson
Github id - grantarg
Group name - OpenVinyl

### What you planned to do

- Updated Account Settings Styling (Dark mode, easier to understand flow)
- Login Page dark mode
- Ability to manage account connections (Spotify, etc)
- Back button on login and account pages
- Light mode for the entire site

### What problems you encountered

- Adding file upload was tougher than expected
- Smaller bugs from Sprint 1 that needed to be patched
- SvelteKit components loading in differently than +pages files

### Issues you worked on

- Make login page prettier (and not flashbang you) [#181](https://github.com/utk-cs340-fall24/OpenVinyl/issues/181)
- Add profile picture upload in the account settings page [#177](https://github.com/utk-cs340-fall24/OpenVinyl/issues/177)
- Profile picture top right [#168](https://github.com/utk-cs340-fall24/OpenVinyl/issues/168)
- Improve account settings page [#142](https://github.com/utk-cs340-fall24/OpenVinyl/issues/142)
- Allow sign out of spotify (just clear the refresh and access tokens if they exist) [#136](https://github.com/utk-cs340-fall24/OpenVinyl/issues/136)
- Back button in account and login page [#132](https://github.com/utk-cs340-fall24/OpenVinyl/issues/132)
- Make "Connect with Spotify" button auto-refresh [#191](https://github.com/utk-cs340-fall24/OpenVinyl/issues/191)

### Files you worked on

- src/routes/auth/signin/+page.svelte
- src/routes/auth/signup/+page.svelte
- src/routes/(app)/account/+page.svelte
- src/lib/utils.js

### What you accomplished

I improved the account settings page with a better flow and improved styling that is easier on the eyes. The user can update now update one field at a time (username, first name, or last name), instead of all at once. I have also added the profile picture upload, where the user can preview their current profile picture, and then upload a new picture too. An account integration section was added, which allows the user to manage their account connection with Spotify. The login flow is improved, with updated styling that matches the rest of the site. Last of all, I updated the Navbar with a hamburger menu that shows on smaller screens and added the profile photo to show who is logged in.