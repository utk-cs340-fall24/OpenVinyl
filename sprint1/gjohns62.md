# Sprint 1

Name - Grant Johnson
Github id - grantarg
Group name - OpenVinyl

### What you planned to do

- Connect with Supabase Auth
- Login Page HTML/CSS
- Account Customization (Setting and Changing username, first name, last name)

### What problems you encountered

- Connecting with Google Auth turned out to be more difficult (i.e. Would redirect or error out altogether)
- Email auth confirmations would not send due to Supabase SMTP changes
- Supabase OTP rate limiting
- Supabase SQL table rules

### Issues you worked on

- Account Customization [#9](https://github.com/utk-cs340-fall24/OpenVinyl/issues/9)
- Login page HTML/CSS [#8](https://github.com/utk-cs340-fall24/OpenVinyl/issues/8)
- Supabase Auth Integration [#7](https://github.com/utk-cs340-fall24/OpenVinyl/issues/7)
- Add logout [#96](https://github.com/utk-cs340-fall24/OpenVinyl/issues/96)
- Add username when sign up [#51](https://github.com/utk-cs340-fall24/OpenVinyl/issues/51)

### Files you worked on

- src/routes/auth/signin/+page.svelte
- src/routes/auth/signup/+page.svelte
- src/routes/auth/signup/account/+page.svelte
- src/routes/(app)/account/+page.svelte
- src/lib/utils.js
- src/lib/supabase.js (superseded by supabaseClient.js)

### What you accomplished

I worked on the Login page, and integrating that with Supabase auth. That means that a user can login either using email or google auth, and then create their account. Those values will be updated in our table in our database too. I also created an account settings page which will let you log out of your account as well as update your username, first name, or last name. I also spent alot of time creating a google cloud platform organization in attempt to getting Google Auth to work, but we ended up using another method to get it to work.
