<script lang="ts">
  import { currentUser, isAuthorised, signIn, signOutUser } from '$lib/stores/auth';
</script>

{#if $currentUser}
  <div class="flex items-center gap-3">
    {#if !$isAuthorised}
      <span class="text-xs text-amber-400 font-medium">Not authorised</span>
    {/if}
    <button
      on:click={signOutUser}
      class="text-sm text-[--color-muted] hover:text-[--color-text] transition-colors border border-[--color-border] rounded-full px-3 py-1.5"
    >
      Sign out
    </button>
  </div>
{:else}
  <button
    on:click={signIn}
    class="flex items-center gap-2 bg-[--color-surface-2] hover:bg-[--color-border] text-[--color-text] text-sm font-semibold rounded-full px-4 py-2 border border-[--color-border] transition-colors"
  >
    <svg class="w-4 h-4 text-[--color-accent]" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13 12H3"/>
    </svg>
    Sign In
  </button>
{/if}
