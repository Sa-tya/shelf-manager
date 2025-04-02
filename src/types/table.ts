export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  searchable?: boolean;
  render?: (item: any) => React.ReactNode;
}

export interface TableProps {
  columns: Column[];
  data: any[];
  actions?: (item: any) => React.ReactNode;
  itemsPerPage?: number;
} 