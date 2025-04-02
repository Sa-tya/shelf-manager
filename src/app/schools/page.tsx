'use client';

import { useState, useEffect } from 'react';
import CommonTable from '@/components/CommonTable';
import Button, { EditIcon, DeleteIcon } from '@/components/Button';
import AddSchoolModal from '@/components/AddSchoolModal';
import { School, SchoolFormData } from '@/types/school';
import { styles } from '@/styles/common';
import { useRouter } from 'next/navigation';

export default function Schools() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const router = useRouter();

  const columns = [
    { key: 'school_id', label: 'School ID', sortable: true, searchable: true },
    { 
      key: 'name', 
      label: 'School Name', 
      sortable: true, 
      searchable: true,
      render: (school: School) => (
        <button
          onClick={() => router.push(`/schools/${school.school_id}/booklist`)}
          className="text-blue-600 hover:text-blue-800 hover:underline text-left"
        >
          {school.name}
        </button>
      )
    },
    { key: 'city', label: 'Address', sortable: true, searchable: true },
    { key: 'contact', label: 'Contact', sortable: true, searchable: true },
    { key: 'email', label: 'Email', sortable: true, searchable: true },
  ];

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools');
      if (!response.ok) throw new Error('Failed to fetch schools');
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const handleAddOrUpdateSchool = async (school: SchoolFormData) => {
    try {
      const response = await fetch('/api/schools', {
        method: school.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(school),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save school');
      }

      const savedSchool = await response.json();
      
      if (school.id) {
        setSchools(schools.map(s => s.id === school.id ? savedSchool : s));
      } else {
        setSchools([savedSchool, ...schools]);
      }
      
      setEditingSchool(null);
    } catch (error: any) {
      console.error('Error saving school:', error);
      throw error;
    }
  };

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this school?')) {
      return;
    }

    try {
      const response = await fetch(`/api/schools`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete school');
      }

      setSchools(schools.filter(school => school.id !== id));
    } catch (error) {
      console.error('Error deleting school:', error);
      alert('Failed to delete school');
    }
  };

  const renderActions = (school: School) => (
    <div className={styles.actions.wrapper}>
      <Button
        onClick={() => router.push(`/schools/${school.school_id}/booklist`)}
        variant="primary"
        size="sm"
        title="Booklist"
      >
        Booklist
      </Button>
      <Button
        onClick={() => handleEdit(school)}
        variant="secondary"
        size="sm"
        icon={<EditIcon />}
        title="Edit"
      />
      <Button
        onClick={() => handleDelete(school.id)}
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
        <h1 className={styles.pageHeader.title}>Schools</h1>
        <Button onClick={() => setIsModalOpen(true)}>Add School</Button>
      </div>
      
      <div className={styles.card}>
        <CommonTable
          columns={columns}
          data={schools}
          actions={renderActions}
          itemsPerPage={10}
        />
      </div>

      <AddSchoolModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSchool(null);
        }}
        onAdd={handleAddOrUpdateSchool}
        editData={editingSchool}
      />
    </div>
  );
} 