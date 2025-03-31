'use client';

import { useState, useEffect } from 'react';
import { styles } from '@/styles/common';
import { Publication, PublicationFormData } from '@/types/publication';

interface AddPublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (publication: PublicationFormData) => Promise<void>;
  editData?: Publication | null;
}

export default function AddPublicationModal({ isOpen, onClose, onAdd, editData }: AddPublicationModalProps) {
  const [pubid, setPubid] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editData) {
      setPubid(editData.pubid);
      setName(editData.name);
      setCity(editData.city);
    } else {
      setPubid('');
      setName('');
      setCity('');
    }
  }, [editData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pubid || !name || !city) {
      setError('All fields are required');
      return;
    }

    try {
      await onAdd({ id: editData?.id, pubid, name, city });
      setPubid('');
      setName('');
      setCity('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save publication');
    }
  };

  return (
    <div className={styles.modal.overlay}>
      <div className={styles.modal.container}>
        <div className={styles.modal.header}>
          <h2 className={styles.modal.title}>
            {editData ? 'Edit Publication' : 'Add New Publication'}
          </h2>
          <button onClick={onClose} className={styles.modal.closeButton}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p className={styles.form.error}>{error}</p>}
          
          <div className={styles.form.group}>
            <label className={styles.form.label} htmlFor="pubid">
              Publication ID
            </label>
            <input
              type="text"
              id="pubid"
              value={pubid}
              onChange={(e) => setPubid(e.target.value)}
              className={styles.form.input}
              placeholder="Enter publication ID"
            />
          </div>

          <div className={styles.form.group}>
            <label className={styles.form.label} htmlFor="name">
              Publication Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.form.input}
              placeholder="Enter publication name"
            />
          </div>

          <div className={styles.form.group}>
            <label className={styles.form.label} htmlFor="city">
              City
            </label>
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={styles.form.input}
              placeholder="Enter city"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.button.base} ${styles.button.variants.primary}`}
            >
              {editData ? 'Save Changes' : 'Add Publication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 