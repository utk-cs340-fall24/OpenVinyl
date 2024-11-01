# Sprint n (1, 2, 3, or 4)

- Name - Will Sessoms
- Github - wessoms
- Group - OpenVinyl

### What you planned to do
I wanted to work on actually fleshing out the Charts page over the course of this sprint. I planned to add actual tracking for the total number of likes/dislike a user has to determine the podium order, a leaderboard to show stats for the top 50 or so users, and I wanted to give the option for the user to see the Top 50 songs from multiple countries (instead of just globally).

### What you did not do
- Wanted to style some of the scroll bars for the site

### What problems you encountered
- Implementing/styling/positioning a dropdown menu
- Having to manually add SQL functions to our database because some parameters are not supported through JS code

### Issues you worked on
- Charts page leaderboard [#165](https://github.com/utk-cs340-fall24/OpenVinyl/issues/165)
- Charts page mobile CSS [#190](https://github.com/utk-cs340-fall24/OpenVinyl/issues/190)
- Add Dropdown menu to sort Top Songs by country [#174](https://github.com/utk-cs340-fall24/OpenVinyl/issues/174)

### Files you worked on
- src/lib/podium.svelte
- src/routes/(app)/charts/+page.svelte
- src/lib/topSongs.svelte

### What you accomplished
Over this sprint I pretty much finished up the charts page by filling in a pdoium to show the top 3 users, adding a leaderboard to see the remaining 1-50 users + their stats, and added a dropdown menu for the "Top Songs" bar so that users can choose which country to see the trending songs from. I went ahead and did mobile styling for these as well, so the page should be almost entirely complete now.