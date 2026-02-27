<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Book, BookInput } from '$lib/types';
  import { books } from '$lib/stores/books';

  export let initial: Partial<Book> = {};
  export let loading = false;
  const dispatch = createEventDispatcher<{ submit: BookInput; cancel: void }>();

  function toDateInputValue(d: Date): string { return d.toISOString().split('T')[0]; }



  let title = initial.title ?? '';
  let author = initial.author ?? '';
  let isbn = initial.isbn ?? '';
  let seriesName = initial.seriesName ?? '';
  let seriesNumber = initial.seriesNumber?.toString() ?? '';
  let dateRead = toDateInputValue(initial.dateRead ?? new Date());
  let coverUrl = initial.coverUrl ?? '';
  let errors: Record<string, string> = {};
  let showSuggestions = false;


      // Reactive: recompute when author field changes
      $: existingSeries = author.trim()
  ? Array.from(new Set(
      $books
        .filter(b => b.author.trim().toLowerCase() === author.trim().toLowerCase() && b.seriesName)
        .map(b => b.seriesName as string)
    )).sort()
  : [];


  function validate(): boolean {
    errors = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!author.trim()) errors.author = 'Author is required';
    if (seriesNumber && isNaN(Number(seriesNumber))) errors.seriesNumber = 'Must be a number';
    return Object.keys(errors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    dispatch('submit', {
      title: title.trim(), author: author.trim(), isbn: isbn.trim(),
      seriesName: seriesName.trim() || undefined,
      seriesNumber: seriesNumber ? Number(seriesNumber) : undefined,
      dateRead: new Date(dateRead),
      coverUrl: coverUrl.trim() || undefined
    });
  }

  const inputClass = (err?: string) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm bg-[--color-surface-2] text-[--color-text] placeholder-[--color-muted] focus:outline-none focus:ring-2 focus:ring-[--color-accent] focus:border-transparent transition ${err ? 'border-red-500' : 'border-[var(--color-border)]'}`;
</script>

<form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-4" novalidate>
  <div>
    <label for="title" class="block text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1.5">Title *</label>
    <input id="title" type="text" bind:value={title} class={inputClass(errors.title)} />
    {#if errors.title}<p class="text-xs text-red-400 mt-1">{errors.title}</p>{/if}
  </div>
  <div>
    <label for="author" class="block text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1.5">Author *</label>
    <input id="author" type="text" bind:value={author} class={inputClass(errors.author)} />
    {#if errors.author}<p class="text-xs text-red-400 mt-1">{errors.author}</p>{/if}
  </div>
  <div>
    <label for="isbn" class="block text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1.5">ISBN</label>
    <input id="isbn" type="text" inputmode="numeric" bind:value={isbn} class={inputClass()} />
  </div>
  <div class="grid grid-cols-3 gap-3">
    <div class="col-span-2 relative">
      <label for="seriesName" class="block text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1.5">Series</label>
      <input
        id="seriesName"
        type="text"
        bind:value={seriesName}
        on:focus={() => showSuggestions = true}
        on:blur={() => setTimeout(() => showSuggestions = false, 150)}
        class={inputClass()}
      />
      {#if showSuggestions && existingSeries.length > 0}
        <ul class="absolute z-50 left-0 right-0 mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden shadow-xl">
          {#each existingSeries as s}
            <li>
              <button
                type="button"
                on:mousedown={() => seriesName = s}
                class="w-full text-left px-3 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                {s}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <div>
      <label for="seriesNumber" class="block text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1.5"># in series</label>
      <input id="seriesNumber" type="number" min="1" bind:value={seriesNumber} class={inputClass(errors.seriesNumber)} />
      {#if errors.seriesNumber}<p class="text-xs text-red-400 mt-1">{errors.seriesNumber}</p>{/if}
    </div>
  </div>
  <div>
    <label for="dateRead" class="block text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1.5">Date read</label>
    <input id="dateRead" type="date" bind:value={dateRead} class={inputClass()} />
  </div>
  <div class="flex gap-3 pt-2">
    <button type="submit" disabled={loading} class="btn-primary flex-1 rounded-lg disabled:opacity-50">
      {loading ? 'Saving…' : 'Save book'}
    </button>
    <button type="button" on:click={() => dispatch('cancel')} class="btn-secondary rounded-lg">Cancel</button>
  </div>
</form>
