/**
 * Normalises an author name to "Surname, Forename" format for display and sorting.
 * "Bernard Cornwell" → "Cornwell, Bernard"
 * Already-normalised names (containing a comma) are returned as-is.
 */
export function normaliseAuthor(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';

  // Already in "Surname, Forename" format
  if (trimmed.includes(',')) return trimmed;

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return trimmed;

  const surname = parts[parts.length - 1];
  const forenames = parts.slice(0, -1).join(' ');
  return `${surname}, ${forenames}`;
}

/**
 * Sort comparator for normalised author display names.
 * Sorts alphabetically by the normalised string (surname first).
 */
export function compareAuthors(a: string, b: string): number {
  return normaliseAuthor(a).localeCompare(normaliseAuthor(b), 'en', { sensitivity: 'base' });
}
