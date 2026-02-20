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

<article class="flex gap-3 py-3 border-b border-[--color-border] last:border-0 group">
  <!-- Cover thumbnail -->
  <div class="shrink-0 w-10 h-14 rounded-lg overflow-hidden bg-[--color-surface-2] flex items-center justify-center">
    {#if book.coverUrl}
      <img src={book.coverUrl} alt="Cover of {book.title}" class="w-full h-full object-cover" loading="lazy" />
    {:else}
      <svg class="w-5 h-5 text-[--color-muted] opacity-50" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
      </svg>
    {/if}
  </div>

  <!-- Book info -->
  <div class="flex-1 min-w-0">
    <h3 class="font-semibold text-[--color-text] leading-tight text-sm">
      {#if showSeriesNumber && book.seriesNumber != null}
        <span class="text-xs font-normal text-[--color-accent] mr-1">#{book.seriesNumber}</span>
      {/if}
      {book.title}
    </h3>
    {#if book.isbn}
      <p class="text-xs text-[--color-muted] mt-0.5">ISBN: {book.isbn}</p>
    {/if}
    <p class="text-xs text-[--color-muted] mt-1">{formatDate(book.dateRead)}</p>
  </div>

  <!-- Actions -->
  {#if $isAuthorised}
    <div class="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
      <button
        on:click={() => dispatch('edit', book)}
        class="text-xs text-[--color-accent] hover:text-[--color-accent-hover] transition-colors px-2 py-1 rounded hover:bg-[--color-accent-hover]"
        aria-label="Edit {book.title}"
      >Edit</button>
      <button
        on:click={() => dispatch('delete', book)}
        class="text-xs text-[--color-muted] hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-[--color-accent-hover]"
        aria-label="Delete {book.title}"
      >Del</button>
    </div>
  {/if}
</article>
