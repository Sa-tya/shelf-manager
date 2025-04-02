export interface BookListItem {
  id: number;
  name: string;
  class: string;
  price: number;
}

export interface BookListGroup {
  class: string;
  books: BookListItem[];
}

export interface BookListFormData {
  name: string;
  class: string;
  price: number;
} 