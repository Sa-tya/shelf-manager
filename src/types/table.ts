export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  searchable?: boolean;
}

export interface TableProps {
  columns: Column[];
  data: any[];
  actions?: (item: any) => React.ReactNode;
  itemsPerPage?: number;
} 