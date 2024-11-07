// src/stores/vinylStore.js
import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient.js'; // Ensure the path is correct

// Initialize the store with a default value
export const vinylBalance = writable(0);

// Function to fetch the current vinyl balance from Supabase
export async function fetchVinylBalance(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('vinyls')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching vinyl balance:', error);
        return;
    }
    console.log("setting balance to ", data.vinyls)
    vinylBalance.set(data.vinyls ?? 0);
}

// Function to add vinyls
export async function addVinyls(userId, amount) {
    if (!userId) {
        console.warn('Cannot add vinyls: User not authenticated.');
        return false;
    }

    const { error } = await supabase
        .rpc('increment_vinyls', { user_id: userId, amount: amount });

    if (error) {
        console.error('Error adding vinyls:', error);
        return false;
    }
console.log("incrementing")
    // Update the store
    vinylBalance.update(n => n + amount);
    return true;
}

// Function to spend vinyls
export async function spendVinyls(userId, amount) {
    // First, check if the user has enough vinyls
    let currentBalance;
    vinylBalance.subscribe(value => {
        currentBalance = value;
    })();

    if (currentBalance < amount) {
        console.warn('Insufficient vinyls.');
        return false;
    }

    // Update the balance in Supabase
    const { data, error } = await supabase
        .from('profiles')
        .update({ vinyls: supabase.raw('vinyls - ?', [amount]) })
        .eq('id', userId);

    if (error) {
        console.error('Error spending vinyls:', error);
        return false;
    }

    // Update the store
    vinylBalance.update(n => n - amount);
    return true;
}