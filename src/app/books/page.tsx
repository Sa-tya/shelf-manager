'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { styles } from '@/styles/common';
import Button from '@/components/Button';

// Dynamically import React Select with no SSR
const Select = dynamic(() => import('react-select'), {
  ssr: false
});

interface BookName {
  id: number;
  name: string;
  subject_name: string;
  publication_name: string;
}

interface ClassEntry {
  class: string;
  price: string;
  quantity: string;
}

interface SelectOption {
  value: number;
  label: string;
}

const CLASSES = [
  'Pre', 'Nur', 'LKG', 'UKG',
  '1', '2', '3', '4', '5', '6', '7', '8'
];

export default function Books() {
  const [mounted, setMounted] = useState(false);
  const [bookNames, setBookNames] = useState<BookName[]>([]);
  const [selectedBook, setSelectedBook] = useState<SelectOption | null>(null);
  const [entries, setEntries] = useState<ClassEntry[]>(
    CLASSES.map(cls => ({ class: cls, price: '', quantity: '' }))
  );

  useEffect(() => {
    setMounted(true);
    fetchBookNames();
  }, []);

  const fetchBookNames = async () => {
    try {
      const response = await fetch('/api/booknames');
      if (!response.ok) throw new Error('Failed to fetch book names');
      const data = await response.json();
      setBookNames(data);
    } catch (error) {
      console.error('Error fetching book names:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) {
      alert('Please select a book');
      return;
    }

    const hasEntries = entries.some(entry => entry.price || entry.quantity);
    if (!hasEntries) {
      alert('Please enter at least one price or quantity');
      return;
    }

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book_name_id: selectedBook.value,
          entries: entries.filter(entry => entry.price || entry.quantity),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save book entries');
      }

      // Reset form
      setSelectedBook(null);
      setEntries(CLASSES.map(cls => ({ class: cls, price: '', quantity: '' })));
      alert('Book entries saved successfully');
    } catch (error) {
      console.error('Error saving book entries:', error);
      alert(error instanceof Error ? error.message : 'Failed to save book entries');
    }
  };

  const handleEntryChange = (index: number, field: 'price' | 'quantity', value: string) => {
    const newEntries = [...entries];
    // Only allow numbers and decimal point
    const sanitizedValue = value.replace(/[^\d.]/g, '');
    newEntries[index][field] = sanitizedValue;
    setEntries(newEntries);
  };

  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader.wrapper}>
        <h1 className={styles.pageHeader.title}>Add New Book</h1>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className={styles.form.label}>Book Name</label>
            <Select
              key="book-select"
              value={selectedBook}
              onChange={(option) => setSelectedBook(option as SelectOption | null)}
              options={bookNames.map(book => ({
                value: book.id,
                label: `${book.name} (${book.subject_name} - ${book.publication_name})`
              }))}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Search and select book..."
              isClearable
              isSearchable
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry, index) => (
                  <tr key={entry.class}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.class}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={entry.price}
                        onChange={(e) => handleEntryChange(index, 'price', e.target.value)}
                        className={styles.form.input}
                        placeholder="Enter price"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={entry.quantity}
                        onChange={(e) => handleEntryChange(index, 'quantity', e.target.value)}
                        className={styles.form.input}
                        placeholder="Enter quantity"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit">Save Book Entries</Button>
          </div>
        </form>
      </div>
    </div>
  );
} 