<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Book, BookInput } from '$lib/types';

  export let initial: Partial<Book> = {};
  export let loading = false;

  const dispatch = createEventDispatcher<{ submit: BookInput; cancel: void }>();

  function toDateInputValue(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  let title = initial.title ?? '';
  let author = initial.author ?? '';
  let isbn = initial.isbn ?? '';
  let seriesName = initial.seriesName ?? '';
  let seriesNumber = initial.seriesNumber?.toString() ?? '';
  let dateRead = toDateInputValue(initial.dateRead ?? new Date());
  let coverUrl = initial.coverUrl ?? '';

  let errors: Record<string, string> = {};

  function validate(): boolean {
    errors = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!author.trim()) errors.author = 'Author is required';
    if (seriesNumber && isNaN(Number(seriesNumber))) {
      errors.seriesNumber = 'Must be a number';
    }
    return Object.keys(errors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    const book: BookInput = {
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      seriesName: seriesName.trim() || undefined,
      seriesNumber: seriesNumber ? Number(seriesNumber) : undefined,
      dateRead: new Date(dateRead),
      coverUrl: coverUrl.trim() || undefined
    };

    dispatch('submit', book);
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-4" novalidate>
  <!-- Title -->
  <div>
    <label for="title" class="block text-sm font-medium text-[--color-ink] mb-1">Title *</label>
    <input
      id="title"
      type="text"
      bind:value={title}
      class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-spine]
        {errors.title ? 'border-red-400' : 'border-[--color-parchment-dark]'}"
    />
    {#if errors.title}<p class="text-xs text-red-600 mt-1">{errors.title}</p>{/if}
  </div>

  <!-- Author -->
  <div>
    <label for="author" class="block text-sm font-medium text-[--color-ink] mb-1">Author *</label>
    <input
      id="author"
      type="text"
      bind:value={author}
      class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-spine]
        {errors.author ? 'border-red-400' : 'border-[--color-parchment-dark]'}"
    />
    {#if errors.author}<p class="text-xs text-red-600 mt-1">{errors.author}</p>{/if}
  </div>

  <!-- ISBN -->
  <div>
    <label for="isbn" class="block text-sm font-medium text-[--color-ink] mb-1">ISBN</label>
    <input
      id="isbn"
      type="text"
      inputmode="numeric"
      bind:value={isbn}
      class="w-full rounded-lg border border-[--color-parchment-dark] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-spine]"
    />
  </div>

  <!-- Series -->
  <div class="grid grid-cols-3 gap-3">
    <div class="col-span-2">
      <label for="seriesName" class="block text-sm font-medium text-[--color-ink] mb-1">Series name</label>
      <input
        id="seriesName"
        type="text"
        bind:value={seriesName}
        class="w-full rounded-lg border border-[--color-parchment-dark] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-spine]"
      />
    </div>
    <div>
      <label for="seriesNumber" class="block text-sm font-medium text-[--color-ink] mb-1"># in series</label>
      <input
        id="seriesNumber"
        type="number"
        min="1"
        bind:value={seriesNumber}
        class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-spine]
          {errors.seriesNumber ? 'border-red-400' : 'border-[--color-parchment-dark]'}"
      />
      {#if errors.seriesNumber}<p class="text-xs text-red-600 mt-1">{errors.seriesNumber}</p>{/if}
    </div>
  </div>

  <!-- Date read -->
  <div>
    <label for="dateRead" class="block text-sm font-medium text-[--color-ink] mb-1">Date read</label>
    <input
      id="dateRead"
      type="date"
      bind:value={dateRead}
      class="w-full rounded-lg border border-[--color-parchment-dark] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-spine]"
    />
  </div>

  <!-- Actions -->
  <div class="flex gap-3 pt-2">
    <button
      type="submit"
      disabled={loading}
      class="flex-1 bg-[--color-spine] hover:bg-[--color-spine-light] disabled:opacity-60 text-white font-medium rounded-lg py-2.5 transition-colors"
    >
      {loading ? 'Saving…' : 'Save book'}
    </button>
    <button
      type="button"
      on:click={() => dispatch('cancel')}
      class="px-4 py-2.5 text-sm text-[--color-ink-muted] hover:text-[--color-spine] border border-[--color-parchment-dark] rounded-lg transition-colors"
    >
      Cancel
    </button>
  </div>
</form>
