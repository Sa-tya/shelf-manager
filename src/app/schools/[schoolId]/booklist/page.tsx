'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { BookListGroup, BookListItem, BookListFormData } from '@/types/booklist';
import Button from '@/components/Button';
import { styles } from '@/styles/common';
import { ActionMeta, SingleValue, MultiValue } from 'react-select';

// Dynamically import React Select with no SSR
const Select = dynamic(() => import('react-select'), { ssr: false });

interface SelectOption {
  value: string | number;
  label: string;
}

interface ClassOption {
  value: string;
  label: string;
}

const CLASSES: ClassOption[] = [
  { value: 'Pre', label: 'Pre-School' },
  { value: 'Nur', label: 'Nursery' },
  { value: 'LKG', label: 'LKG' },
  { value: 'UKG', label: 'UKG' },
  { value: '1', label: 'Class 1' },
  { value: '2', label: 'Class 2' },
  { value: '3', label: 'Class 3' },
  { value: '4', label: 'Class 4' },
  { value: '5', label: 'Class 5' },
  { value: '6', label: 'Class 6' },
  { value: '7', label: 'Class 7' },
  { value: '8', label: 'Class 8' },
];

interface Subject {
  id: number;
  name: string;
}

interface Publication {
  id: number;
  name: string;
}

interface Book {
  id: number;
  name: string;
  subject_id: number;
  company_id: number;
}

interface SimulatedBook {
  id: number;
  name: string;
  subject_id: number;
  company_id: number;
  class: string;
}

interface SimulatedClass {
  class: string;
  books: SimulatedBook[];
}

export default function BookList() {
  const params = useParams();
  const schoolId = params.schoolId as string;
  const [bookGroups, setBookGroups] = useState<BookListGroup[]>([]);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New state for form
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [simulatedClasses, setSimulatedClasses] = useState<SimulatedClass[]>([]);
  const [showSimulation, setShowSimulation] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);

  useEffect(() => {
    fetchBookList();
    fetchSubjects();
    fetchPublications();
  }, [schoolId]);

  useEffect(() => {
    fetchBooks();
  }, [selectedSubject, selectedPublication]);

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

  const fetchBooks = async () => {
    try {
      // Start with base URL
      let url = '/api/booknames';
      
      // Build query string based on filters
      const filters = [];
      if (selectedSubject) {
        filters.push(`subject_id=${selectedSubject}`);
      }
      if (selectedPublication) {
        filters.push(`company_id=${selectedPublication}`);
      }
      
      // Add filters to URL if any exist
      if (filters.length > 0) {
        url += `?${filters.join('&')}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch books');
      }
      const data = await response.json();

      // Filter books based on selected criteria
      let filteredBooks = [...data];
      if (selectedSubject) {
        filteredBooks = filteredBooks.filter(book => book.subject_id === selectedSubject);
      }
      if (selectedPublication) {
        filteredBooks = filteredBooks.filter(book => book.company_id === selectedPublication);
      }

      setBooks(filteredBooks);
      // Clear selected book when filters change
      setSelectedBook(null);
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
      setSelectedBook(null);
    }
  };

  const fetchBookList = async () => {
    try {
      const response = await fetch(`/api/schools/${schoolId}/booklist`);
      if (!response.ok) throw new Error('Failed to fetch booklist');
      const data = await response.json();
      
      // Group books by class
      const groups: BookListGroup[] = CLASSES.map(cls => ({
        class: cls.value,
        books: data.filter((book: BookListItem) => book.class === cls.value)
      }));
      
      setBookGroups(groups);
    } catch (error) {
      console.error('Error fetching booklist:', error);
    }
  };

  const addSelectedSubject = (subjectId: number | null) => {
    if (subjectId) {
      setSelectedSubjects(prev => [...prev, subjectId]);
    }
  };

  const getRemainingSubjects = () => {
    return subjects.filter(subject => !selectedSubjects.includes(subject.id));
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || selectedClasses.length === 0) {
      alert('Please fill all required fields');
      return;
    }

    const selectedBookData = books.find(b => b.id === selectedBook);
    if (!selectedBookData) return;

    addSelectedSubject(selectedBookData.subject_id);

    // Create simulation data
    const newSimulatedClasses = selectedClasses.map(className => {
      // Find existing simulation for this class
      const existingClass = simulatedClasses.find(sc => sc.class === className);
      
      return {
        class: className,
        books: [
          ...(existingClass?.books || []),
          {
            ...selectedBookData,
            class: className
          }
        ]
      };
    });

    // Merge with existing simulations, preserving non-selected classes
    const updatedSimulations = [...simulatedClasses];
    newSimulatedClasses.forEach(newClass => {
      const index = updatedSimulations.findIndex(sc => sc.class === newClass.class);
      if (index >= 0) {
        updatedSimulations[index] = newClass;
      } else {
        updatedSimulations.push(newClass);
      }
    });

    setSimulatedClasses(updatedSimulations);
    setShowSimulation(true);
    
    // Reset selections for next book
    setSelectedBook(null);
    setSelectedSubject(null);
    setSelectedPublication(null);
  };

  const removeSimulatedBook = (className: string, bookId: number) => {
    // Get the book's subject ID before removing it
    const bookToRemove = simulatedClasses
      .find(sc => sc.class === className)
      ?.books.find(b => b.id === bookId);

    if (bookToRemove) {
      // Remove the subject from selected subjects
      setSelectedSubjects(prev => prev.filter(id => id !== bookToRemove.subject_id));
    }

    setSimulatedClasses(prev => 
      prev.map(classGroup => 
        classGroup.class === className
          ? {
              ...classGroup,
              books: classGroup.books.filter(book => book.id !== bookId)
            }
          : classGroup
      ).filter(classGroup => classGroup.books.length > 0)
    );
  };

  const handleSaveSimulation = async () => {
    try {
      // Create all books from simulation
      const promises = simulatedClasses.flatMap(classGroup => 
        classGroup.books.map(book => 
          fetch(`/api/schools/${schoolId}/booklist`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: book.name,
              class: book.class,
            }),
          })
        )
      );

      await Promise.all(promises);
      await fetchBookList();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving books:', error);
      alert('Failed to save books');
    }
  };

  const resetForm = () => {
    setSelectedSubject(null);
    setSelectedPublication(null);
    setSelectedBook(null);
    setSelectedClasses([]);
    setSimulatedClasses([]);
    setShowSimulation(false);
    setSelectedSubjects([]);
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      const response = await fetch(`/api/schools/${schoolId}/booklist/${bookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete book');

      setBookGroups(prevGroups =>
        prevGroups.map(group => ({
          ...group,
          books: group.books.filter(book => book.id !== bookId)
        }))
      );
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book');
    }
  };

  const handleSubjectChange = (
    newValue: unknown,
    actionMeta: ActionMeta<unknown>
  ) => {
    const option = newValue as SelectOption | null;
    setSelectedSubject(option?.value as number | null);
    setSelectedBook(null);
  };

  const handlePublicationChange = (
    newValue: unknown,
    actionMeta: ActionMeta<unknown>
  ) => {
    const option = newValue as SelectOption | null;
    setSelectedPublication(option?.value as number | null);
    setSelectedBook(null);
  };

  const handleBookChange = (
    newValue: unknown,
    actionMeta: ActionMeta<unknown>
  ) => {
    const option = newValue as SelectOption | null;
    setSelectedBook(option?.value as number | null);
  };

  const handleClassesChange = (
    newValue: unknown,
    actionMeta: ActionMeta<unknown>
  ) => {
    const options = newValue as ClassOption[];
    setSelectedClasses(options.map(opt => opt.value));
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader.wrapper}>
        <h1 className="text-white">Book List of {schoolId}</h1>
        <Button onClick={() => setIsModalOpen(true)}>Create Book-List</Button>
      </div>

      <div className="grid gap-4">
        {bookGroups.map(group => (
          <div key={group.class} className="border rounded-lg overflow-hidden">
            <button
              className={`w-full p-4 text-left bg-gray-50 hover:bg-gray-100 flex justify-between items-center ${
                expandedClass === group.class ? 'border-b' : ''
              }`}
              onClick={() => setExpandedClass(
                expandedClass === group.class ? null : group.class
              )}
            >
              <span className="font-semibold">Class {group.class}</span>
              <span className="text-gray-500">
                {group.books.length} book{group.books.length !== 1 ? 's' : ''}
              </span>
            </button>

            {expandedClass === group.class && (
              <div className="p-4">
                {group.books.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Price</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.books.map(book => (
                        <tr key={book.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{book.name}</td>
                          <td className="px-4 py-2">₹{book.price}</td>
                          <td className="px-4 py-2 text-right">
                            <Button
                              onClick={() => handleDeleteBook(book.id)}
                              variant="danger"
                              size="sm"
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No books added for this class
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Modal Design */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Books to List</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Selection Form */}
              <div className="space-y-4">
                <form onSubmit={handleSimulate} className="space-y-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Subject
                    </label>
                    <Select
                      options={getRemainingSubjects().map(subject => ({
                        value: subject.id,
                        label: subject.name
                      }))}
                      onChange={handleSubjectChange}
                      value={subjects.map(subject => ({
                        value: subject.id,
                        label: subject.name
                      })).find(option => option.value === selectedSubject)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder={getRemainingSubjects().length === 0 
                        ? "All subjects have been selected" 
                        : "Select subject..."}
                      isClearable
                      isDisabled={getRemainingSubjects().length === 0}
                    />
                    {getRemainingSubjects().length === 0 && (
                      <p className="mt-1 text-sm text-yellow-600">
                        All subjects have been added. Remove some books to select more subjects.
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Publication
                    </label>
                    <Select
                      options={publications.map(pub => ({
                        value: pub.id,
                        label: pub.name
                      }))}
                      onChange={handlePublicationChange}
                      value={publications.map(pub => ({
                        value: pub.id,
                        label: pub.name
                      })).find(option => option.value === selectedPublication)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder="Select publication (optional)..."
                      isClearable
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Book *
                    </label>
                    <Select
                      options={books.map(book => ({
                        value: book.id,
                        label: `${book.name} ${
                          subjects.find(s => s.id === book.subject_id)?.name ? 
                          `(${subjects.find(s => s.id === book.subject_id)?.name})` : 
                          ''
                        } ${
                          publications.find(p => p.id === book.company_id)?.name ?
                          `[${publications.find(p => p.id === book.company_id)?.name}]` :
                          ''
                        }`
                      }))}
                      onChange={handleBookChange}
                      value={books.map(book => ({
                        value: book.id,
                        label: `${book.name} ${
                          subjects.find(s => s.id === book.subject_id)?.name ? 
                          `(${subjects.find(s => s.id === book.subject_id)?.name})` : 
                          ''
                        } ${
                          publications.find(p => p.id === book.company_id)?.name ?
                          `[${publications.find(p => p.id === book.company_id)?.name}]` :
                          ''
                        }`
                      })).find(option => option.value === selectedBook)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder="Select book..."
                      isClearable
                      noOptionsMessage={() => {
                        if (books.length === 0) {
                          if (selectedSubject && selectedPublication) {
                            return "No books found for selected subject and publication";
                          } else if (selectedSubject) {
                            return "No books found for selected subject";
                          } else if (selectedPublication) {
                            return "No books found for selected publication";
                          }
                          return "Select subject or publication to filter books";
                        }
                        return "No options available";
                      }}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {books.length} book{books.length !== 1 ? 's' : ''} available
                      {selectedSubject && subjects.find(s => s.id === selectedSubject) 
                        ? ` for ${subjects.find(s => s.id === selectedSubject)?.name}` 
                        : ''}
                      {selectedPublication && publications.find(p => p.id === selectedPublication)
                        ? ` from ${publications.find(p => p.id === selectedPublication)?.name}` 
                        : ''}
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Classes *
                    </label>
                    <Select
                      options={CLASSES}
                      isMulti
                      onChange={handleClassesChange}
                      value={CLASSES.filter(option => selectedClasses.includes(option.value))}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder="Select classes..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">Add to Preview</Button>
                  </div>
                </form>
              </div>

              {/* Simulation Preview */}
              <div className="border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6">
                <h3 className="text-lg font-semibold mb-4">Preview</h3>
                {simulatedClasses.length > 0 ? (
                  <div className="space-y-4">
                    {simulatedClasses.map(classGroup => (
                      <div key={classGroup.class} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Class {classGroup.class}</h4>
                        <div className="space-y-2">
                          {classGroup.books.map(book => (
                            <div key={`${book.id}-${book.class}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <div>
                                <div className="font-medium">{book.name}</div>
                                <div className="text-sm text-gray-500">
                                  {subjects.find(s => s.id === book.subject_id)?.name} 
                                  {/* {book.company_id && publications.find(p => p.id === book.company_id) 
                                    ? ` - ${publications.find(p => p.id === book.company_id)?.name}` 
                                    : ''} */}
                                </div>
                              </div>
                              <button
                                onClick={() => removeSimulatedBook(classGroup.class, book.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSimulatedClasses([]);
                          setShowSimulation(false);
                        }}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Add books to see preview here
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 