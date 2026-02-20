<script lang="ts">
  import type { AuthorGroup, Book } from '$lib/types';
  import BookCard from './BookCard.svelte';
  import { createEventDispatcher } from 'svelte';

  export let group: AuthorGroup;

  const dispatch = createEventDispatcher<{ edit: Book; delete: Book }>();

  let expanded = true;
</script>

<section class="mb-6">
  <button
    class="w-full flex items-baseline justify-between gap-2 py-2 border-b-2 border-[--color-spine] mb-2 text-left"
    on:click={() => (expanded = !expanded)}
    aria-expanded={expanded}
  >
    <h2 class="font-display font-bold text-xl text-[--color-ink] tracking-wide">
      {group.displayName}
    </h2>
    <span class="text-xs text-[--color-ink-muted] tabular-nums shrink-0">
      {group.series.reduce((n, s) => n + s.books.length, 0) + group.standalones.length} books
    </span>
  </button>

  {#if expanded}
    <!-- Series groups -->
    {#each group.series as series}
      <div class="mb-3 ml-1">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-[--color-spine] mb-1 font-body">
          {series.seriesName}
        </h3>
        {#each series.books as book}
          <BookCard
            {book}
            showSeriesNumber={true}
            on:edit={(e) => dispatch('edit', e.detail)}
            on:delete={(e) => dispatch('delete', e.detail)}
          />
        {/each}
      </div>
    {/each}

    <!-- Standalones -->
    {#each group.standalones as book}
      <BookCard
        {book}
        on:edit={(e) => dispatch('edit', e.detail)}
        on:delete={(e) => dispatch('delete', e.detail)}
      />
    {/each}
  {/if}
</section>
