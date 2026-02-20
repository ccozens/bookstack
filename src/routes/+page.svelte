<script lang="ts">
  import { onMount } from 'svelte';
  import { books, groupedBooks, booksLoading, booksError } from '$lib/stores/books';
  import { isAuthorised } from '$lib/stores/auth';
  import { getAllBooks, addBook, updateBook, deleteBook } from '$lib/services/firestore';
  import { lookupByIsbn } from '$lib/services/googleBooks';
  import AuthorGroup from '$lib/components/AuthorGroup.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import BookForm from '$lib/components/BookForm.svelte';
  import Scanner from '$lib/components/Scanner.svelte';
  import type { Book, BookInput } from '$lib/types';

  type Mode = null | 'scan' | 'form';
  let mode: Mode = null;
  let formInitial: Partial<Book> = {};
  let editingId: string | null = null;
  let formLoading = false;
  let lookupError = '';
  let searchQuery = '';

  $: filteredGroups = searchQuery.trim()
    ? $groupedBooks
        .map((g) => ({
          ...g,
          series: g.series
            .map((s) => ({ ...s, books: s.books.filter(matches) }))
            .filter((s) => s.books.length),
          standalones: g.standalones.filter(matches)
        }))
        .filter((g) => g.series.length || g.standalones.length)
    : $groupedBooks;

  function matches(book: Book): boolean {
    const q = searchQuery.toLowerCase();
    return book.title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q);
  }

  onMount(async () => {
    booksLoading.set(true);
    try {
      const fetched = await getAllBooks();
      books.set(fetched);
    } catch (e) {
      booksError.set('Failed to load books.');
    } finally {
      booksLoading.set(false);
    }
  });

  function openAddFlow() { formInitial = {}; editingId = null; lookupError = ''; mode = 'scan'; }
  function openEditForm(book: Book) { formInitial = { ...book }; editingId = book.id; lookupError = ''; mode = 'form'; }

  async function handleScanned(isbn: string) {
    mode = null; lookupError = ''; booksLoading.set(true);
    try {
      const result = await lookupByIsbn(isbn);
      formInitial = result
        ? { title: result.title, author: result.author, isbn: result.isbn, coverUrl: result.coverUrl, dateRead: new Date() }
        : { isbn, dateRead: new Date() };
    } catch {
      formInitial = { isbn, dateRead: new Date() };
      lookupError = 'Could not look up ISBN. Please fill in details manually.';
    } finally { booksLoading.set(false); }
    mode = 'form';
  }

  async function handleFormSubmit(bookInput: BookInput) {
    formLoading = true;
    try {
      if (editingId) {
        await updateBook(editingId, bookInput);
        books.update((bs) => bs.map((b) => (b.id === editingId ? { ...b, ...bookInput } : b)));
      } else {
        const id = await addBook(bookInput);
        books.update((bs) => [...bs, { id, ...bookInput }]);
      }
      mode = null;
    } catch { alert('Failed to save book. Please try again.'); }
    finally { formLoading = false; }
  }

  async function handleDelete(book: Book) {
    if (!confirm(`Delete "${book.title}"?`)) return;
    try {
      await deleteBook(book.id);
      books.update((bs) => bs.filter((b) => b.id !== book.id));
    } catch { alert('Failed to delete book.'); }
  }

  $: totalBooks = $books.length;
</script>

<!-- Hero heading -->
<div class="mb-6">
  <h1 class="text-3xl font-bold text-[--color-text] mb-1">Your Library</h1>
  <p class="text-[--color-muted] text-sm">{totalBooks} {totalBooks === 1 ? 'book' : 'books'} cataloged.</p>
</div>

<!-- Search bar -->
<div class="relative mb-6">
  <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-muted]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="m21 21-4.35-4.35"/>
  </svg>
  <input
    type="search"
    placeholder="Search titles, authors..."
    bind:value={searchQuery}
    class="w-full bg-[--color-surface] border border-[--color-border] rounded-full pl-11 pr-4 py-3 text-sm text-[--color-text] placeholder-[--color-muted] focus:outline-none focus:ring-2 focus:ring-[--color-accent] focus:border-transparent transition"
  />
</div>

<!-- Add button -->
{#if $isAuthorised}
  <div class="flex justify-end mb-6">
    <button
      on:click={openAddFlow}
      class="flex items-center gap-2 bg-[--color-accent] hover:bg-[--color-accent-hover] text-white font-semibold rounded-full px-5 py-2.5 shadow-lg transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
      </svg>
      Add book
    </button>
  </div>
{/if}

{#if $booksLoading}
  <div class="text-center py-16 text-[--color-muted]">
    <svg class="animate-spin w-8 h-8 mx-auto mb-3 text-[--color-accent]" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
    <p class="text-sm">Loading your library…</p>
  </div>

{:else if $booksError}
  <p class="text-center text-red-400 py-8">{$booksError}</p>

{:else if $groupedBooks.length === 0}
  <div class="border-2 border-dashed border-[--color-border] rounded-2xl py-20 px-8 text-center">
    <div class="w-16 h-16 rounded-full bg-[--color-surface-2] flex items-center justify-center mx-auto mb-4">
      <svg class="w-8 h-8 text-[--color-muted]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
      </svg>
    </div>
    <p class="font-semibold text-[--color-text] text-lg mb-1">Your library is empty</p>
    {#if $isAuthorised}
      <p class="text-sm text-[--color-muted]">Start adding books by scanning their barcodes!</p>
    {:else}
      <p class="text-sm text-[--color-muted]">Sign in to start adding books.</p>
    {/if}
  </div>

{:else}
  {#if lookupError}
    <p class="text-sm text-amber-400 bg-amber-950/40 border border-amber-800 rounded-lg px-4 py-2 mb-4">{lookupError}</p>
  {/if}
  {#if filteredGroups.length === 0}
    <p class="text-center text-[--color-muted] py-8">No books match your search.</p>
  {:else}
    {#each filteredGroups as group}
      <AuthorGroup {group}
        on:edit={(e) => openEditForm(e.detail)}
        on:delete={(e) => handleDelete(e.detail)}
      />
    {/each}
  {/if}
{/if}

{#if mode === 'scan'}
  <Modal title="Scan barcode" on:close={() => (mode = null)}>
    <Scanner 
      on:scanned={(e) => handleScanned(e.detail)} 
      on:cancel={() => (mode = null)} 
      on:skip={() => { formInitial = { dateRead: new Date() }; mode = 'form'; }} 
      />
  </Modal>
{/if}

{#if mode === 'form'}
  <Modal title={editingId ? 'Edit book' : 'Add book'} on:close={() => (mode = null)}>
    {#if lookupError}<p class="text-sm text-amber-400 mb-3">{lookupError}</p>{/if}
    <BookForm initial={formInitial} loading={formLoading}
      on:submit={(e) => handleFormSubmit(e.detail)}
      on:cancel={() => (mode = null)}
    />
  </Modal>
{/if}
