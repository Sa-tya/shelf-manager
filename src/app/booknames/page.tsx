'use client';

import { useState, useEffect } from 'react';
import CommonTable from '@/components/CommonTable';
import Button, { EditIcon, DeleteIcon } from '@/components/Button';
import { Book, BookFormData } from '@/types/book';
import { styles } from '@/styles/common';
import Select from 'react-select';

// Add these interfaces for the select options
interface SelectOption {
  value: string;
  label: string;
}

export default function Booknames() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [publications, setPublications] = useState([]);
  const [formData, setFormData] = useState({
    book_name_id: '',
    name: '',
    subject_id: '',
    company_id: ''
  });
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const columns = [
    { key: 'book_name_id', label: 'Book ID', sortable: true, searchable: true },
    { key: 'name', label: 'Name', sortable: true, searchable: true },
    { key: 'subject_name', label: 'Subject', sortable: true },
    { key: 'publication_name', label: 'Publication', sortable: true },
    { key: 'created_at', label: 'Created At', sortable: true }
  ];

  useEffect(() => {
    fetchBooks();
    fetchSubjects();
    fetchPublications();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/booknames');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch books');
      }
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchPublications = async () => {
    try {
      const response = await fetch('/api/publications');
      if (!response.ok) throw new Error('Failed to fetch publications');
      const data = await response.json();
      setPublications(data);
    } catch (error) {
      console.error('Error fetching publications:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      const response = await fetch('/api/booknames', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete book');
      }

      setBooks(books.filter(book => book.id !== id));
    } catch (error) {
      console.error('Error deleting book:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete book');
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      book_name_id: book.book_name_id,
      name: book.name,
      subject_id: book.subject_id.toString(),
      company_id: book.company_id.toString()
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        subject_id: parseInt(formData.subject_id),
        company_id: parseInt(formData.company_id)
      };

      if (editingBook) {
        submitData.id = editingBook.id;
      }

      const response = await fetch('/api/booknames', {
        method: editingBook ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${editingBook ? 'update' : 'add'} book`);
      }

      const savedBook = await response.json();
      
      if (editingBook) {
        setBooks(books.map(book => book.id === editingBook.id ? savedBook : book));
      } else {
        setBooks([savedBook, ...books]);
      }

      setIsModalOpen(false);
      setEditingBook(null);
      setFormData({
        book_name_id: '',
        name: '',
        subject_id: '',
        company_id: ''
      });
    } catch (error) {
      console.error('Error saving book:', error);
      alert(error instanceof Error ? error.message : 'Failed to save book');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  // Convert subjects and publications to select options
  const subjectOptions = subjects.map((subject: any) => ({
    value: subject.id.toString(),
    label: subject.name
  }));

  const publicationOptions = publications.map((pub: any) => ({
    value: pub.id.toString(),
    label: pub.name
  }));

  // Helper function to find the selected option
  const findOption = (options: SelectOption[], value: string) => {
    return options.find(option => option.value === value) || null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader.wrapper}>
        <h1 className={styles.pageHeader.title}>Books</h1>
        <Button onClick={() => setIsModalOpen(true)}>Add Book</Button>
      </div>
      
      <div className={styles.card}>
        <CommonTable
          columns={columns}
          data={books.map(book => ({
            ...book,
            created_at: formatDate(book.created_at || '')
          }))}
          actions={renderActions}
          itemsPerPage={10}
        />
      </div>

      {isModalOpen && (
        <div className={styles.modal.overlay}>
          <div className={styles.modal.container}>
            <div className={styles.modal.header}>
              <h2 className={styles.modal.title}>
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingBook(null);
                  setFormData({
                    book_name_id: '',
                    name: '',
                    subject_id: '',
                    company_id: ''
                  });
                }} 
                className={styles.modal.closeButton}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className={styles.form.group}>
                <label className={styles.form.label}>Book ID</label>
                <input
                  type="text"
                  value={formData.book_name_id}
                  onChange={(e) => setFormData({...formData, book_name_id: e.target.value})}
                  className={styles.form.input}
                  placeholder="Enter Book ID"
                  required
                />
              </div>

              <div className={styles.form.group}>
                <label className={styles.form.label}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={styles.form.input}
                  placeholder="Enter Book Name"
                  required
                />
              </div>

              <div className={styles.form.group}>
                <label className={styles.form.label}>Subject</label>
                <Select
                  value={findOption(subjectOptions, formData.subject_id)}
                  onChange={(option) => setFormData({
                    ...formData,
                    subject_id: option?.value || ''
                  })}
                  options={subjectOptions}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Search and select subject..."
                  isClearable
                  isSearchable
                  required
                />
              </div>

              <div className={styles.form.group}>
                <label className={styles.form.label}>Publication</label>
                <Select
                  value={findOption(publicationOptions, formData.company_id)}
                  onChange={(option) => setFormData({
                    ...formData,
                    company_id: option?.value || ''
                  })}
                  options={publicationOptions}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Search and select publication..."
                  isClearable
                  isSearchable
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBook ? 'Save Changes' : 'Add Book'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 