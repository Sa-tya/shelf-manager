'use client';

import { useState, useEffect } from 'react';
import CommonTable from '@/components/CommonTable';
import Button, { EditIcon, DeleteIcon } from '@/components/Button';
import { School, SchoolFormData } from '@/types/school';

export default function Schools() {
  const [schools, setSchools] = useState<School[]>([]);

  const columns = [
    { key: 'name', label: 'School Name', sortable: true, searchable: true },
    { key: 'location', label: 'Location', sortable: true, searchable: true },
    { key: 'contact', label: 'Contact', sortable: true, searchable: true },
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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this school?')) {
      return;
    }

    try {
      const response = await fetch(`/api/schools`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error('Failed to delete school');
      setSchools(schools.filter(school => school.id !== id));
    } catch (error) {
      console.error('Error deleting school:', error);
      alert('Failed to delete school');
    }
  };

  const renderActions = (school: School) => (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => {/* Handle edit */}}
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Schools</h1>
        <Button>Add School</Button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <CommonTable
          columns={columns}
          data={schools}
          actions={renderActions}
          itemsPerPage={10}
        />
      </div>
    </div>
  );
} 