'use client';

import { useState, useEffect } from 'react';
import { styles } from '@/styles/common';

interface EditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: number, price: string, quantity: string) => Promise<void>;
  book: {
    id: number;
    book_name: string;
    class: string;
    price: number;
    quantity: number;
  } | null;
}

export default function EditBookModal({ isOpen, onClose, onEdit, book }: EditBookModalProps) {
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (book) {
      setPrice(book.price.toString());
      setQuantity(book.quantity.toString());
    } else {
      setPrice('');
      setQuantity('');
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!price && !quantity) {
      setError('At least one field (price or quantity) is required');
      return;
    }

    try {
      await onEdit(book.id, price, quantity);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update book');
    }
  };

  return (
    <div className={styles.modal.overlay}>
      <div className={styles.modal.container}>
        <div className={styles.modal.header}>
          <h2 className={styles.modal.title}>
            Edit Book Entry
          </h2>
          <button onClick={onClose} className={styles.modal.closeButton}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            Book: {book.book_name}<br />
            Class: {book.class}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p className={styles.form.error}>{error}</p>}
          
          <div className={styles.form.group}>
            <label className={styles.form.label} htmlFor="price">
              Price
            </label>
            <input
              type="text"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ''))}
              className={styles.form.input}
              placeholder="Enter price"
            />
          </div>

          <div className={styles.form.group}>
            <label className={styles.form.label} htmlFor="quantity">
              Quantity
            </label>
            <input
              type="text"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value.replace(/[^\d]/g, ''))}
              className={styles.form.input}
              placeholder="Enter quantity"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.button.base} ${styles.button.variants.primary} ${styles.button.sizes.md}`}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 