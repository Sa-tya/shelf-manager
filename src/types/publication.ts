export interface Publication {
  id: number;
  pubid: string;
  name: string;
  city: string;
  created_at?: string;
  updated_at?: string;
}

export interface PublicationFormData {
  id?: number;
  pubid: string;
  name: string;
  city: string;
} 