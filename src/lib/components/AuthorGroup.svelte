<script lang="ts">
  import type { AuthorGroup, Book } from '$lib/types';
  import BookCard from './BookCard.svelte';
  import { createEventDispatcher } from 'svelte';

  export let group: AuthorGroup;
  const dispatch = createEventDispatcher<{ edit: Book; delete: Book }>();
  let expanded = true;
</script>

<section class="mb-5">
  <button
    class="w-full flex items-baseline justify-between gap-2 py-2 border-b border-[--color-border] mb-1 text-left group"
    on:click={() => (expanded = !expanded)}
    aria-expanded={expanded}
  >
    <h2 class="font-bold text-base text-[--color-text] group-hover:text-[--color-accent] transition-colors">
      {group.displayName}
    </h2>
    <span class="text-xs text-[--color-muted] tabular-nums shrink-0">
      {group.series.reduce((n, s) => n + s.books.length, 0) + group.standalones.length} books
    </span>
  </button>

  {#if expanded}
    {#each group.series as series}
      <div class="mb-3 ml-1">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-[--color-accent] mb-1 opacity-80">
          {series.seriesName}
        </h3>
        {#each series.books as book}
          <BookCard {book} showSeriesNumber={true}
            on:edit={(e) => dispatch('edit', e.detail)}
            on:delete={(e) => dispatch('delete', e.detail)}
          />
        {/each}
      </div>
    {/each}
    {#each group.standalones as book}
      <BookCard {book}
        on:edit={(e) => dispatch('edit', e.detail)}
        on:delete={(e) => dispatch('delete', e.detail)}
      />
    {/each}
  {/if}
</section>
