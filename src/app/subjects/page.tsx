'use client';

import { useState, useEffect } from 'react';
import AddSubjectModal from '@/components/AddSubjectModal';
import CommonTable from '@/components/CommonTable';
import Button, { EditIcon, DeleteIcon } from '@/components/Button';
import { Subject, SubjectFormData } from '@/types/subject';
import { styles } from '@/styles/common';

export default function Subjects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const columns = [
    { key: 'subid', label: 'Subject ID', sortable: true, searchable: true },
    { key: 'name', label: 'Name', sortable: true, searchable: true },
  ];

  useEffect(() => {
    fetchSubjects();
  }, []);

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

  const handleAddOrUpdateSubject = async (subject: { id?: number; subid: string; name: string }) => {
    try {
      const response = await fetch('/api/subjects', {
        method: subject.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subject),
      });

      if (!response.ok) {
        throw new Error('Failed to save subject');
      }

      const savedSubject = await response.json();
      
      if (subject.id) {
        setSubjects(subjects.map(s => s.id === subject.id ? savedSubject : s));
      } else {
        setSubjects([savedSubject, ...subjects]);
      }
      
      setEditingSubject(null);
    } catch (error) {
      console.error('Error saving subject:', error);
      throw error;
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    try {
      const response = await fetch(`/api/subjects`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete subject');
      }

      setSubjects(subjects.filter(subject => subject.id !== id));
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Failed to delete subject');
    }
  };

  const renderActions = (subject: Subject) => (
    <div className={styles.actions.wrapper}>
      <Button
        onClick={() => handleEdit(subject)}
        variant="secondary"
        size="sm"
        icon={<EditIcon />}
        title="Edit"
      />
      <Button
        onClick={() => handleDelete(subject.id)}
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
        <h1 className={styles.pageHeader.title}>Subjects</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          Add Subject
        </Button>
      </div>
      
      <div className={styles.card}>
        <CommonTable
          columns={columns}
          data={subjects}
          actions={renderActions}
          itemsPerPage={10}
        />
      </div>

      <AddSubjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubject(null);
        }}
        onAdd={handleAddOrUpdateSubject}
        editData={editingSubject}
      />
    </div>
  );
} 