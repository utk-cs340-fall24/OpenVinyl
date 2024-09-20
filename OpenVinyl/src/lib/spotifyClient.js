import SpotifyWebApi from 'spotify-web-api-js';
import { writable } from 'svelte/store';

const accessToken = writable(null);
const spotify = new SpotifyWebApi();

function setAccessToken(token) {
    accessToken.set(token);
    spotify.setAccessToken(token);
}

export { spotify, setAccessToken, accessToken };
