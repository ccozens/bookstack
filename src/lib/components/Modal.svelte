<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    onclose: () => void;
    children: Snippet;
  }

  let { title, onclose, children }: Props = $props();

  function handleBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) onclose();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
  role="presentation"
  class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
  onclick={handleBackdrop}
>
  <div class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90dvh] overflow-y-auto shadow-2xl">
    <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
      <h2 class="font-semibold text-lg text-[var(--color-text)]">{title}</h2>
      <button
        onclick={onclose}
        class="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors p-1 rounded-lg hover:bg-[var(--color-surface-2)]"
        aria-label="Close"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
    <div class="px-5 py-4">
      {@render children()}
    </div>
  </div>
</div>