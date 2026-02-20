import { writable, derived } from 'svelte/store';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth } from '$lib/firebase';
import { browser } from '$app/environment';

const WHITELISTED_EMAIL = import.meta.env.VITE_WHITELISTED_EMAIL as string;

export const currentUser = writable<User | null>(null);
export const authLoading = writable(true);

export const isAuthorised = derived(currentUser, ($user) => {
  if (!$user) return false;
  return $user.email === WHITELISTED_EMAIL;
});

if (browser) {
  onAuthStateChanged(auth, (user) => {
    currentUser.set(user);
    authLoading.set(false);
  });
}

export async function signIn(): Promise<void> {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}
