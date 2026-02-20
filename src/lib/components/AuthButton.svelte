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
      class="btn-secondary text-sm"
    >
      Sign out
    </button>
  </div>
{:else}
  <button
    on:click={signIn}
    class="btn-primary text-sm flex items-center gap-2"
  >
    <svg class="w-4 h-4 text-[--color-accent]" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13 12H3"/>
    </svg>
    Sign In
  </button>
{/if}
