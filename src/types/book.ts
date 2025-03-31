export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
}

export interface BookFormData {
  id?: number;
  title: string;
  author: string;
  isbn: string;
} 