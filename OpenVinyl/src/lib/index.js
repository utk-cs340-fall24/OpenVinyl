// Create a single supabase client for interacting with your database
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient('https://mgyftmhpdafhuuvvgebv.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1neWZ0bWhwZGFmaHV1dnZnZWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY1MjY0NzAsImV4cCI6MjA0MjEwMjQ3MH0.n_pNbRHRpSb27FFwxf-ijtM0p1svXX0FOHcC_2smJEk');
console.log(supabase);
// var user;


//document.getElementById("google").addEventListener("click", signInWithGoogle);

// async function signInWithGit(){
//     const { data, error } = await supabase.auth.signInWithOAuth({
//         provider: 'github',
//         options: {
//             redirectTo: 'http://127.0.0.1:5500/frontend'
//         }
//     })
//     console.log("data: ", data);
//     console.log("error: ", error);
// }


// async function signInWithEmail() {
//     let email = document.getElementById('email').value;
//     let password = document.getElementById('pass').value;
//     console.log(email, password);
//     const { data, error } = await supabase.auth.signInWithPassword({
//         email: email,
//         password: password,
//         options: {
//             emailRedirectTo: 'http://127.0.0.1:5500/index.html'
//         }
//     })
//     console.log("data: ", data);
//     console.log("error: ", error);
// }

export function signUp(email, password) {
    
    console.log("email: ", email,"pass: ", password);
    const { data, error } = supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            emailRedirectTo: 'http://127.0.0.1:5500/index.html'
        }
    })
    console.log("data: ", data);
    console.log("error: ", error);
}

// async function signInWithGoogle(){
//     const { data, error } = await supabase.auth.signInWithOAuth({
//         provider: 'google',
//         options: {
//         redirectTo: 'http://127.0.0.1:5500/frontend'
//         }
//     })
// }


// async function check(){
//     const { data: { user } } = await supabase.auth.getUser();
//     setTimeout(() => {
//         console.log(user);
//         document.getElementById("pp").src = user.user_metadata.avatar_url;
//     }, 2000);
// }