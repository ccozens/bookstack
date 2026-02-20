const API_BASE = 'https://www.googleapis.com/books/v1';

export interface GoogleBookResult {
  title: string;
  author: string;
  isbn: string;
  coverUrl?: string;
}

/**
 * Look up a book by ISBN using the Google Books API.
 * Returns the best match or null if not found.
 */
export async function lookupByIsbn(isbn: string): Promise<GoogleBookResult | null> {
  const key = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
  const url = `${API_BASE}/volumes?q=isbn:${encodeURIComponent(isbn)}${key ? `&key=${key}` : ''}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Books API error: ${res.status}`);

  const data = await res.json();
  if (!data.items?.length) return null;

  const info = data.items[0].volumeInfo;
  const authors: string[] = info.authors ?? [];
  const identifiers: { type: string; identifier: string }[] = info.industryIdentifiers ?? [];

  // Prefer ISBN_13 from the response, fall back to what we searched with
  const isbnFromApi =
    identifiers.find((i) => i.type === 'ISBN_13')?.identifier ??
    identifiers.find((i) => i.type === 'ISBN_10')?.identifier ??
    isbn;

  // Cover: use medium thumbnail if available
  const coverUrl =
    info.imageLinks?.thumbnail?.replace('http://', 'https://') ??
    info.imageLinks?.smallThumbnail?.replace('http://', 'https://') ??
    undefined;

  return {
    title: info.title ?? '',
    author: authors[0] ?? '',
    isbn: isbnFromApi,
    coverUrl
  };
}

/**
 * Look up a book by free-text query (title / author name).
 * Returns the best match or null.
 */
export async function lookupByQuery(query: string): Promise<GoogleBookResult | null> {
  const key = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
  const url = `${API_BASE}/volumes?q=${encodeURIComponent(query)}&maxResults=1${key ? `&key=${key}` : ''}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Books API error: ${res.status}`);

  const data = await res.json();
  if (!data.items?.length) return null;

  const info = data.items[0].volumeInfo;
  const authors: string[] = info.authors ?? [];
  const identifiers: { type: string; identifier: string }[] = info.industryIdentifiers ?? [];

  const isbn =
    identifiers.find((i) => i.type === 'ISBN_13')?.identifier ??
    identifiers.find((i) => i.type === 'ISBN_10')?.identifier ??
    '';

  const coverUrl =
    info.imageLinks?.thumbnail?.replace('http://', 'https://') ??
    info.imageLinks?.smallThumbnail?.replace('http://', 'https://') ??
    undefined;

  return {
    title: info.title ?? '',
    author: authors[0] ?? '',
    isbn,
    coverUrl
  };
}
