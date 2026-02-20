import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  type DocumentData
} from 'firebase/firestore';
import { db } from '$lib/firebase';
import type { Book, BookInput } from '$lib/types';

const COLLECTION = 'books';

function docToBook(id: string, data: DocumentData): Book {
  return {
    id,
    title: data.title ?? '',
    author: data.author ?? '',
    isbn: data.isbn ?? '',
    seriesName: data.seriesName ?? undefined,
    seriesNumber: data.seriesNumber ?? undefined,
    dateRead: (data.dateRead as Timestamp).toDate(),
    coverUrl: data.coverUrl ?? undefined
  };
}

export async function getAllBooks(): Promise<Book[]> {
  const q = query(collection(db, COLLECTION), orderBy('dateRead', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => docToBook(d.id, d.data()));
}

export async function addBook(book: BookInput): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...book,
    seriesName: book.seriesName ?? null,
    seriesNumber: book.seriesNumber ?? null,
    coverUrl: book.coverUrl ?? null,
    dateRead: Timestamp.fromDate(book.dateRead)
  });
  return docRef.id;
}

export async function updateBook(id: string, book: Partial<BookInput>): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  const data: Record<string, unknown> = { ...book };
  if (book.dateRead) {
    data.dateRead = Timestamp.fromDate(book.dateRead);
  }
  await updateDoc(ref, data);
}

export async function deleteBook(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
