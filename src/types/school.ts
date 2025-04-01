export interface School {
  id: number;
  school_id: string;
  name: string;
  city: string;
  contact: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface SchoolFormData {
  id?: number;
  school_id: string;
  name: string;
  city: string;
  contact: string;
  email: string;
} 