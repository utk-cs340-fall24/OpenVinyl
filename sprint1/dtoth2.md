# Sprint 1

name - Dylan Toth
github id - dylant1
group name - OpenVinyl

### What you planned to do
* Setup sql relationships between users and posts
* Create basic discover page
* Write search functions
* Connect with spotify api

### What you did not do
* Implement spotify authentication

### What problems you encountered
* Rate limiting issues with spotify api

### Issues you worked on
[#1](https://github.com/utk-cs340-fall24/OpenVinyl/issues/1)
[#4](https://github.com/utk-cs340-fall24/OpenVinyl/issues/4)
[#50](https://github.com/utk-cs340-fall24/OpenVinyl/issues/50)
[#73](https://github.com/utk-cs340-fall24/OpenVinyl/issues/73)
[#55](https://github.com/utk-cs340-fall24/OpenVinyl/issues/55)
[#71](https://github.com/utk-cs340-fall24/OpenVinyl/issues/71)

### Files you worked on
OpenVinyl/OpenVinyl/src/lib/spotifyClient.js
OpenVinyl/OpenVinyl/src/lib/supabaseClient.js
OpenVinyl/OpenVinyl/src/lib/utils.js
OpenVinyl/OpenVinyl/src/routes/(app)/discover/[[slug]]/+page.svelte
OpenVinyl/OpenVinyl/src/routes/(app)/+page.svelte
OpenVinyl/OpenVinyl/src/routes/(app)/+page.server.js

### What you accomplished
I successfully created the discover page with a way to explore more songs. This involved communicating with the spotify api and caching results to prevent rate limiting issues.