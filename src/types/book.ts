export interface Book {
  id: number;
  book_name_id: number;
  class: string;
  price: number;
  quantity: number;
  created_at?: string;
  updated_at?: string;
}

export interface BookEntry {
  class: string;
  price: number;
  quantity: number;
}

export interface BookFormData {
  book_name_id: number;
  entries: BookEntry[];
} 