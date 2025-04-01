'use client';

import { useState, useEffect } from 'react';
import { styles } from '@/styles/common';
import { School, SchoolFormData } from '@/types/school';

interface AddSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (school: SchoolFormData) => Promise<void>;
  editData?: School | null;
}

export default function AddSchoolModal({ isOpen, onClose, onAdd, editData }: AddSchoolModalProps) {
  const [formData, setFormData] = useState<SchoolFormData>({
    school_id: '',
    name: '',
    city: '',
    contact: '',
    email: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (editData) {
      setFormData({
        id: editData.id,
        school_id: editData.school_id,
        name: editData.name,
        city: editData.city,
        contact: editData.contact,
        email: editData.email
      });
    } else {
      setFormData({
        school_id: '',
        name: '',
        city: '',
        contact: '',
        email: ''
      });
    }
  }, [editData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.school_id || !formData.name || !formData.city || !formData.contact || !formData.email) {
      setError('All fields are required');
      return;
    }

    try {
      await onAdd(formData);
      setFormData({
        school_id: '',
        name: '',
        city: '',
        contact: '',
        email: ''
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save school');
    }
  };

  return (
    <div className={styles.modal.overlay}>
      <div className={styles.modal.container}>
        <div className={styles.modal.header}>
          <h2 className={styles.modal.title}>
            {editData ? 'Edit School' : 'Add New School'}
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
            <label className={styles.form.label} htmlFor="school_id">
              School ID
            </label>
            <input
              type="text"
              id="school_id"
              value={formData.school_id}
              onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
              className={styles.form.input}
              placeholder="Enter school ID"
            />
          </div>

          <div className={styles.form.group}>
            <label className={styles.form.label} htmlFor="name">
              School Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={styles.form.input}
              placeholder="Enter school name"
            />
          </div>

          <div className={styles.form.group}>
            <label className={styles.form.label} htmlFor="city">
              Address
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className={styles.form.input}
              placeholder="Enter school address"
            />
          </div>

          <div className={styles.form.group}>
            <label className={styles.form.label} htmlFor="contact">
              Contact Number
            </label>
            <input
              type="text"
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className={styles.form.input}
              placeholder="Enter contact number"
            />
          </div>

          <div className={styles.form.group}>
            <label className={styles.form.label} htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={styles.form.input}
              placeholder="Enter email address"
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
              {editData ? 'Save Changes' : 'Add School'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 