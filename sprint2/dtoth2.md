# Sprint 2

- Name - Dylan Toth
- Github id - dylant1
- Group name - OpenVinyl

### What you planned to do

- Add spotify sdk player to sidebar
- Setup spotify higher-scope authentication + premium account privileges like sdk player
- Make page responsive on mobile devices
- Add discuss page
- Switch from like system to karma system

### What problems you encountered

- Global state management for user who links their account with spotify was very tricky
- Making the "sign in with google -> link with spotify" and "sign in with spotify" auth flows use the same global stores
- Embedding the sdk player was finnicky
- Dealing with rate limiting issues for recommendation endpoint
- Transitioning from solely upvotes to both up and downvotes was tricky

### Issues you worked on

- Feature: a forum page for specific songs or artists, where all of the posts for that song or artist reside [#172](https://github.com/utk-cs340-fall24/OpenVinyl/issues/172)
- Switch from like/dislike to karma [#163](https://github.com/utk-cs340-fall24/OpenVinyl/issues/163)
- Add comment functionality [#137](https://github.com/utk-cs340-fall24/OpenVinyl/issues/137)


### Files you worked on

- src/routes/(app)/+page.svelte
- src/lib/utils.js
- src/routes/(app)/discover/[[slug]]/+page.svelte
- src/routes/(app)/discuss/+page.js
- src/routes/(app)/discuss/+page.svelte
- src/routes/(app)/discuss/[slug]/+page.js




### What you accomplished
