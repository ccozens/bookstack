import { writable, derived } from 'svelte/store';
import type { Book, AuthorGroup, SeriesGroup } from '$lib/types';
import { normaliseAuthor, compareAuthors } from '$lib/utils/authorSort';

export const books = writable<Book[]>([]);
export const booksLoading = writable(false);
export const booksError = writable<string | null>(null);

/**
 * Derived store: books grouped by author (surname-sorted),
 * with series ordered by number and standalones after series.
 */
export const groupedBooks = derived(books, ($books): AuthorGroup[] => {
  const authorMap = new Map<string, AuthorGroup>();

  for (const book of $books) {
    const raw = book.author;
    const display = normaliseAuthor(raw);

    if (!authorMap.has(display)) {
      authorMap.set(display, {
        displayName: display,
        rawName: raw,
        series: [],
        standalones: []
      });
    }

    const group = authorMap.get(display)!;

    if (book.seriesName) {
      let seriesGroup = group.series.find((s) => s.seriesName === book.seriesName);
      if (!seriesGroup) {
        seriesGroup = { seriesName: book.seriesName, books: [] };
        group.series.push(seriesGroup);
      }
      seriesGroup.books.push(book);
    } else {
      group.standalones.push(book);
    }
  }

  // Sort series books by series number within each series
  for (const group of authorMap.values()) {
    for (const s of group.series) {
      s.books.sort((a, b) => (a.seriesNumber ?? 0) - (b.seriesNumber ?? 0));
    }
    // Sort series groups alphabetically
    group.series.sort((a, b) => a.seriesName.localeCompare(b.seriesName, 'en'));
    // Sort standalones by title
    group.standalones.sort((a, b) => a.title.localeCompare(b.title, 'en'));
  }

  // Sort authors by normalised name (surname first)
  return Array.from(authorMap.values()).sort((a, b) =>
    compareAuthors(a.rawName, b.rawName)
  );
});
