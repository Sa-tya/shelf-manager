export interface Book {
  id: number;
  book_name_id: string;
  company_id: number;
  name: string;
  subject_id: number;
  created_at?: string;
  subject_name?: string;
  publication_name?: string;
}

export interface BookFormData {
  book_name_id: string;
  company_id: string | number;
  name: string;
  subject_id: string | number;
} 