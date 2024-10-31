# Sprint 3

- Name - Weston Agreda
- Github id - Weston49
- Group name - OpenVinyl

### What you planned to do

- Make the music player more integrated into the site
- Bug fixes from sprint 2
- alter the styling on pages where the sidebar is now present

### What problems you encountered

- Having a persistent element across all pages can break things
- restyling pages can break mobile view

### Issues you worked on

-  [#230](https://github.com/utk-cs340-fall24/OpenVinyl/issues/230)
-  [#231](https://github.com/utk-cs340-fall24/OpenVinyl/issues/231)
-  [#129](https://github.com/utk-cs340-fall24/OpenVinyl/issues/230)

### Files you worked on

- src/routes/(app)/+page.svelte
- src/routes/(app)/+layout.svelte
- src/lib/sidebar.svelte

### What you accomplished

I worked mostly this sprint on bringing the music player from the home page to the overlay layer so that it is a persistent part of the app. The way it works now it should be loaded no matter what page of our site you are on, that way it can keep playing your music as you browse the site and interact with everything. This invovled a lot of css and logic changes in several places.
