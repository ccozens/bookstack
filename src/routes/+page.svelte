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

  // Modes: null = library view, 'scan' = scanner, 'form' = add/edit form
  type Mode = null | 'scan' | 'form';
  let mode: Mode = null;
  let formInitial: Partial<Book> = {};
  let editingId: string | null = null;
  let formLoading = false;
  let lookupError = '';

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

  function openAddFlow() {
    formInitial = {};
    editingId = null;
    lookupError = '';
    mode = 'scan';
  }

  function openEditForm(book: Book) {
    formInitial = { ...book };
    editingId = book.id;
    lookupError = '';
    mode = 'form';
  }

  async function handleScanned(isbn: string) {
    mode = null;
    lookupError = '';
    booksLoading.set(true);
    try {
      const result = await lookupByIsbn(isbn);
      formInitial = result
        ? { title: result.title, author: result.author, isbn: result.isbn, coverUrl: result.coverUrl, dateRead: new Date() }
        : { isbn, dateRead: new Date() };
    } catch {
      formInitial = { isbn, dateRead: new Date() };
      lookupError = 'Could not look up ISBN. Please fill in details manually.';
    } finally {
      booksLoading.set(false);
    }
    mode = 'form';
  }

  async function handleFormSubmit(bookInput: BookInput) {
    formLoading = true;
    try {
      if (editingId) {
        await updateBook(editingId, bookInput);
        books.update((bs) =>
          bs.map((b) => (b.id === editingId ? { ...b, ...bookInput } : b))
        );
      } else {
        const id = await addBook(bookInput);
        books.update((bs) => [...bs, { id, ...bookInput }]);
      }
      mode = null;
    } catch (e) {
      alert('Failed to save book. Please try again.');
    } finally {
      formLoading = false;
    }
  }

  async function handleDelete(book: Book) {
    if (!confirm(`Delete "${book.title}"?`)) return;
    try {
      await deleteBook(book.id);
      books.update((bs) => bs.filter((b) => b.id !== book.id));
    } catch {
      alert('Failed to delete book.');
    }
  }
</script>

<!-- Add button (authorised users only) -->
{#if $isAuthorised}
  <div class="flex justify-end mb-6">
    <button
      on:click={openAddFlow}
      class="flex items-center gap-2 bg-[--color-spine] hover:bg-[--color-spine-light] text-white font-medium rounded-full px-5 py-2.5 shadow-md transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
      </svg>
      Add book
    </button>
  </div>
{/if}

<!-- Loading state -->
{#if $booksLoading}
  <div class="text-center py-16 text-[--color-ink-muted]">
    <svg class="animate-spin w-8 h-8 mx-auto mb-3 text-[--color-spine]" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
    </svg>
    <p class="text-sm">Loading your library…</p>
  </div>

<!-- Error state -->
{:else if $booksError}
  <p class="text-center text-red-600 py-8">{$booksError}</p>

<!-- Empty state -->
{:else if $groupedBooks.length === 0}
  <div class="text-center py-16 text-[--color-ink-muted]">
    <svg class="w-16 h-16 mx-auto mb-4 opacity-20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
    </svg>
    <p class="font-display text-xl mb-1">Your library is empty</p>
    {#if $isAuthorised}
      <p class="text-sm">Tap <strong>Add book</strong> to get started.</p>
    {:else}
      <p class="text-sm">Sign in to start adding books.</p>
    {/if}
  </div>

<!-- Library view -->
{:else}
  {#if lookupError}
    <p class="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4">{lookupError}</p>
  {/if}
  {#each $groupedBooks as group}
    <AuthorGroup
      {group}
      on:edit={(e) => openEditForm(e.detail)}
      on:delete={(e) => handleDelete(e.detail)}
    />
  {/each}
{/if}

<!-- Scanner modal -->
{#if mode === 'scan'}
  <Modal title="Scan barcode" on:close={() => (mode = null)}>
    <Scanner
      on:scanned={(e) => handleScanned(e.detail)}
      on:cancel={() => (mode = null)}
    />
  </Modal>
{/if}

<!-- Book form modal -->
{#if mode === 'form'}
  <Modal title={editingId ? 'Edit book' : 'Add book'} on:close={() => (mode = null)}>
    {#if lookupError}
      <p class="text-sm text-amber-700 mb-3">{lookupError}</p>
    {/if}
    <BookForm
      initial={formInitial}
      loading={formLoading}
      on:submit={(e) => handleFormSubmit(e.detail)}
      on:cancel={() => (mode = null)}
    />
  </Modal>
{/if}
