<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let title: string;

  const dispatch = createEventDispatcher<{ close: void }>();

  function handleBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) dispatch('close');
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div
  class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
  on:click={handleBackdrop}
>
  <div class="bg-[--color-parchment] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90dvh] overflow-y-auto shadow-2xl">
    <div class="flex items-center justify-between px-5 py-4 border-b border-[--color-parchment-dark]">
      <h2 class="font-display font-semibold text-lg text-[--color-ink]">{title}</h2>
      <button
        on:click={() => dispatch('close')}
        class="text-[--color-ink-muted] hover:text-[--color-spine] transition-colors p-1"
        aria-label="Close"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
    <div class="px-5 py-4">
      <slot />
    </div>
  </div>
</div>
