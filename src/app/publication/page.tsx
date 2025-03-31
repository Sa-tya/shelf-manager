'use client';

import { useState, useEffect } from 'react';
import CommonTable from '@/components/CommonTable';
import Button, { EditIcon, DeleteIcon } from '@/components/Button';
import AddPublicationModal from '@/components/AddPublicationModal';
import { styles } from '@/styles/common';

interface Publication {
  id: number;
  code: string;
  name: string;
  city: string;
}

export default function Publications() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);

  const columns = [
    { key: 'pubid', label: 'Publication ID', sortable: true, searchable: true },
    { key: 'name', label: 'Name', sortable: true, searchable: true },
    { key: 'city', label: 'City', sortable: true, searchable: true },
  ];

  useEffect(() => {
    fetchPublications();
  }, []);

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

  const handleAddOrUpdatePublication = async (publication: { id?: number; code: string; name: string; city: string }) => {
    try {
      const response = await fetch('/api/publications', {
        method: publication.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(publication),
      });

      if (!response.ok) {
        throw new Error('Failed to save publication');
      }

      const savedPublication = await response.json();
      
      if (publication.id) {
        setPublications(publications.map(p => p.id === publication.id ? savedPublication : p));
      } else {
        setPublications([savedPublication, ...publications]);
      }
      
      setEditingPublication(null);
    } catch (error) {
      console.error('Error saving publication:', error);
      throw error;
    }
  };

  const handleEdit = (publication: Publication) => {
    setEditingPublication(publication);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this publication?')) {
      return;
    }

    try {
      const response = await fetch(`/api/publications`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete publication');
      }

      setPublications(publications.filter(pub => pub.id !== id));
    } catch (error) {
      console.error('Error deleting publication:', error);
      alert('Failed to delete publication');
    }
  };

  const renderActions = (publication: Publication) => (
    <div className={styles.actions.wrapper}>
      <Button
        onClick={() => handleEdit(publication)}
        variant="secondary"
        size="sm"
        icon={<EditIcon />}
        title="Edit"
      />
      <Button
        onClick={() => handleDelete(publication.id)}
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
        <h1 className={styles.pageHeader.title}>Publications</h1>
        <Button onClick={() => setIsModalOpen(true)}>Add Publication</Button>
      </div>
      
      <div className={styles.card}>
        <CommonTable
          columns={columns}
          data={publications}
          actions={renderActions}
          itemsPerPage={10}
        />
      </div>

      <AddPublicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPublication(null);
        }}
        onAdd={handleAddOrUpdatePublication}
        editData={editingPublication}
      />
    </div>
  );
} 