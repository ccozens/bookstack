export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  seriesName?: string;
  seriesNumber?: number;
  dateRead: Date;
  coverUrl?: string;
}

export type BookInput = Omit<Book, 'id'>;

export interface SeriesGroup {
  seriesName: string;
  books: Book[];
}

export interface AuthorGroup {
  displayName: string; // "Cornwell, Bernard"
  rawName: string;     // "Bernard Cornwell"
  series: SeriesGroup[];
  standalones: Book[];
}
