'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { styles } from '@/styles/common';
import Button, { EditIcon, DeleteIcon } from '@/components/Button';
import CommonTable from '@/components/CommonTable';
import EditBookModal from '@/components/EditBookModal';

interface Book {
  id: number;
  book_name: string;
  class: string;
  price: number;
  quantity: number;
  subject_name: string;
  publication_name: string;
}

export default function Home() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const columns = [
    { key: 'book_name', label: 'Book Name', sortable: true, searchable: true },
    { key: 'subject_name', label: 'Subject', sortable: true, searchable: true },
    { key: 'publication_name', label: 'Publication', sortable: true, searchable: true },
    { key: 'class', label: 'Class', sortable: true, searchable: true },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: true },
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

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this book entry?')) {
      return;
    }

    try {
      const response = await fetch(`/api/books`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete book');
      }

      setBooks(books.filter(book => book.id !== id));
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book');
    }
  };

  const handleUpdate = async (id: number, price: string, quantity: string) => {
    try {
      const response = await fetch(`/api/books`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...(price && { price: parseFloat(price) }),
          ...(quantity && { quantity: parseInt(quantity, 10) }),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update book');
      }

      const updatedBook = await response.json();
      setBooks(books.map(book => 
        book.id === id 
          ? {
              ...updatedBook,
              book_name: updatedBook.book_name,
              subject_name: updatedBook.subject_name,
              publication_name: updatedBook.publication_name,
            }
          : book
      ));
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  };

  const renderActions = (book: Book) => (
    <div className={styles.actions.wrapper}>
      <Button
        onClick={() => handleEdit(book)}
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
    <div className={styles.container}>
      <div className={styles.pageHeader.wrapper}>
        <h1 className={styles.pageHeader.title}>Books Inventory</h1>
        <Button onClick={() => router.push('/books')}>Add Book</Button>
      </div>
      
      <div className={styles.card}>
        <CommonTable
          columns={columns}
          data={books}
          actions={renderActions}
          itemsPerPage={10}
        />
      </div>

      <EditBookModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBook(null);
        }}
        onEdit={handleUpdate}
        book={editingBook}
      />
    </div>
  );
} 