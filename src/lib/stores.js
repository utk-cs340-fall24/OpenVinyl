import { writable } from 'svelte/store';
//for drag and drop
export const selectedSong = writable(null);
export const user = writable(null);
export const spotifyAccessToken = writable(null);