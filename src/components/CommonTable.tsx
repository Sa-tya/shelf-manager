'use client';

import { useState, useMemo } from 'react';
import { Column, TableProps } from '@/types/table';
import { styles } from '@/styles/common';

export default function CommonTable({ columns, data, actions, itemsPerPage = 10 }: TableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchText, setSearchText] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('');

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchText || !searchColumn) return data;

    return data.filter(item => {
      const value = item[searchColumn]?.toString().toLowerCase();
      return value?.includes(searchText.toLowerCase());
    });
  }, [data, searchText, searchColumn]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const searchableColumns = columns.filter(col => col.searchable);

  return (
    <div>
      {/* Search Controls */}
      <div className={styles.table.search.wrapper}>
        <select
          value={searchColumn}
          onChange={(e) => {
            setSearchColumn(e.target.value);
            setSearchText('');
          }}
          className={styles.table.search.select}
        >
          <option value="">Select column to search</option>
          {searchableColumns.map(col => (
            <option key={col.key} value={col.key}>{col.label}</option>
          ))}
        </select>
        {searchColumn && (
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search..."
            className={styles.table.search.input}
          />
        )}
      </div>

      {/* Table */}
      <div className={styles.table.wrapper}>
        <table className={styles.table.container}>
          <thead className={styles.table.header.row}>
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className={styles.table.header.cell}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortConfig?.key === column.key && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className={styles.table.header.cell}>Actions</th>}
            </tr>
          </thead>
          <tbody className={styles.table.body.row}>
            {paginatedData.map((item, index) => (
              <tr key={index}>
                {columns.map(column => (
                  <td key={column.key} className={styles.table.body.cell}>
                    {item[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className={styles.table.body.cell}>
                    {actions(item)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.table.pagination.wrapper}>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={styles.table.pagination.button}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={styles.table.pagination.button}
          >
            Next
          </button>
        </div>
        <div className={styles.table.pagination.text}>
          Page {currentPage} of {totalPages}
        </div>
      </div>
    </div>
  );
} 