'use client';

import { useState, useEffect } from 'react';
import CommonTable from '@/components/CommonTable';
import Button, { EditIcon, DeleteIcon } from '@/components/Button';
import { Book, BookFormData } from '@/types/book';

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);

  const columns = [
    { key: 'title', label: 'Title', sortable: true, searchable: true },
    { key: 'author', label: 'Author', sortable: true, searchable: true },
    { key: 'isbn', label: 'ISBN', sortable: true, searchable: true },
  ];

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      const response = await fetch(`/api/books`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error('Failed to delete book');
      setBooks(books.filter(book => book.id !== id));
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book');
    }
  };

  const renderActions = (book: Book) => (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => {/* Handle edit */}}
        variant="secondary"
        size="sm"
        icon={<EditIcon />}
        title="Edit"
      />
      <Button
        onClick={() => handleDelete(book.id)}
        variant="danger"
        size="sm"
        icon={<DeleteIcon />}
        title="Delete"
      />
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Books</h1>
        <Button>Add Book</Button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <CommonTable
          columns={columns}
          data={books}
          actions={renderActions}
          itemsPerPage={10}
        />
      </div>
    </div>
  );
} 