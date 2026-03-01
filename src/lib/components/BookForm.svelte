<script lang="ts">
  import type { Book, BookInput } from '$lib/types';
  import { books } from '$lib/stores/books';

  interface Props {
    initial?: Partial<Book>;
    loading?: boolean;
    onsubmit: (book: BookInput) => void;
    oncancel: () => void;
  }

  let { initial = {}, loading = false, onsubmit, oncancel }: Props = $props();

  function toDateInputValue(d: Date): string { return d.toISOString().split('T')[0]; }

  let title = $state(initial.title ?? '');
  let author = $state(initial.author ?? '');
  let isbn = $state(initial.isbn ?? '');
  let seriesName = $state(initial.seriesName ?? '');
  let seriesNumber = $state(initial.seriesNumber?.toString() ?? '');
  let dateRead = $state(toDateInputValue(initial.dateRead ?? new Date()));
  let coverUrl = $state(initial.coverUrl ?? '');
  let errors = $state<Record<string, string>>({});
  let showSuggestions = $state(false);

  let existingSeries = $derived(
    author.trim()
      ? Array.from(new Set(
          $books
            .filter(b => b.author.trim().toLowerCase() === author.trim().toLowerCase() && b.seriesName)
            .map(b => b.seriesName as string)
        )).sort()
      : []
  );

  $effect(() => {
    if (seriesName.trim() && !initial.seriesNumber) {
      const seriesBooks = $books.filter(
        b => b.seriesName?.trim().toLowerCase() === seriesName.trim().toLowerCase()
          && b.author.trim().toLowerCase() === author.trim().toLowerCase()
      );
      if (seriesBooks.length > 0) {
        const maxNum = Math.max(...seriesBooks.map(b => b.seriesNumber ?? 0));
        seriesNumber = (maxNum + 1).toString();
      }
    }
  });

  function validate(): boolean {
    errors = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!author.trim()) errors.author = 'Author is required';
    if (seriesNumber && isNaN(Number(seriesNumber))) errors.seriesNumber = 'Must be a number';
    return Object.keys(errors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onsubmit({
      title: title.trim(), author: author.trim(), isbn: isbn.trim(),
      seriesName: seriesName.trim() || undefined,
      seriesNumber: seriesNumber ? Number(seriesNumber) : undefined,
      dateRead: new Date(dateRead),
      coverUrl: coverUrl.trim() || undefined
    });
  }

  const inputClass = (err?: string) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm bg-[var(--color-surface-2)] text-[var(--color-text)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition ${err ? 'border-red-500' : 'border-[var(--color-border)]'}`;
</script>

<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="flex flex-col gap-4" novalidate>
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
        onfocus={() => showSuggestions = true}
        onblur={() => setTimeout(() => showSuggestions = false, 150)}
        class={inputClass()}
      />
      {#if showSuggestions && existingSeries.length > 0}
        <ul class="absolute z-50 left-0 right-0 mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden shadow-xl">
          {#each existingSeries as s}
            <li>
              <button
                type="button"
                onmousedown={() => seriesName = s}
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
    <button type="button" onclick={oncancel} class="btn-secondary rounded-lg">Cancel</button>
  </div>
</form>