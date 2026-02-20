<script lang="ts">
  import { currentUser, isAuthorised, signIn, signOutUser } from '$lib/stores/auth';
</script>

{#if $currentUser}
  <div class="flex items-center gap-3">
    {#if !$isAuthorised}
      <span class="text-xs text-amber-700 font-medium">Not authorised</span>
    {/if}
    <button
      on:click={signOutUser}
      class="text-sm text-[--color-ink-muted] hover:text-[--color-spine] transition-colors border border-[--color-parchment-dark] rounded px-3 py-1.5"
    >
      Sign out
    </button>
  </div>
{:else}
  <button
    on:click={signIn}
    class="flex items-center gap-2 bg-[--color-spine] hover:bg-[--color-spine-light] text-white text-sm font-medium rounded px-3 py-1.5 transition-colors"
  >
    <svg class="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M21.35 11.1H12v2.8h5.35C16.8 16.6 14.7 18 12 18a6 6 0 1 1 0-12c1.47 0 2.8.54 3.83 1.42l2.1-2.1A9.96 9.96 0 0 0 12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.52 0 10-4.48 10-10 0-.67-.07-1.33-.2-1.95-.14-.6-.28-1.1-.45-1.1z"/>
    </svg>
    Sign in with Google
  </button>
{/if}
