<script lang="ts">
  import type { Book } from '$lib/types';
  import { isAuthorised } from '$lib/stores/auth';
  import { createEventDispatcher } from 'svelte';

  export let book: Book;
  export let showSeriesNumber = false;

  const dispatch = createEventDispatcher<{ edit: Book; delete: Book }>();

  function formatDate(d: Date): string {
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
</script>

<article class="flex gap-3 py-3 border-b border-[--color-parchment-dark] last:border-0 group">
  <!-- Cover thumbnail -->
  <div class="shrink-0 w-12 h-16 rounded overflow-hidden bg-[--color-parchment-dark] flex items-center justify-center">
    {#if book.coverUrl}
      <img src={book.coverUrl} alt="Cover of {book.title}" class="w-full h-full object-cover" loading="lazy" />
    {:else}
      <svg class="w-6 h-6 text-[--color-ink-muted] opacity-30" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
      </svg>
    {/if}
  </div>

  <!-- Book info -->
  <div class="flex-1 min-w-0">
    <h3 class="font-display font-semibold text-[--color-ink] leading-tight">
      {#if showSeriesNumber && book.seriesNumber != null}
        <span class="text-xs font-body font-normal text-[--color-ink-muted] mr-1">#{book.seriesNumber}</span>
      {/if}
      {book.title}
    </h3>
    {#if book.isbn}
      <p class="text-xs text-[--color-ink-muted] mt-0.5">ISBN: {book.isbn}</p>
    {/if}
    <p class="text-xs text-[--color-ink-muted] mt-1">{formatDate(book.dateRead)}</p>
  </div>

  <!-- Actions (authorised only) -->
  {#if $isAuthorised}
    <div class="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
      <button
        on:click={() => dispatch('edit', book)}
        class="text-xs text-[--color-spine] hover:text-[--color-spine-light] transition-colors p-1"
        aria-label="Edit {book.title}"
      >
        Edit
      </button>
      <button
        on:click={() => dispatch('delete', book)}
        class="text-xs text-[--color-ink-muted] hover:text-red-600 transition-colors p-1"
        aria-label="Delete {book.title}"
      >
        Del
      </button>
    </div>
  {/if}
</article>
