import { NextResponse } from 'next/server';
import { query } from '@/utils/db';
import { Book } from '@/types/book';

export async function GET() {
  try {
    const books = await query(
      'SELECT booknames.*, subjects.name as subject_name, publications.name as publication_name ' +
      'FROM booknames ' +
      'LEFT JOIN subjects ON booknames.subject_id = subjects.id ' +
      'LEFT JOIN publications ON booknames.company_id = publications.id ' +
      'ORDER BY booknames.created_at DESC'
    );
    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { book_name_id, name, subject_id, company_id } = await request.json();

    if (!book_name_id || !name || !subject_id || !company_id) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if book_name_id already exists
    const existing = await query(
      'SELECT id FROM booknames WHERE book_name_id = ?',
      [book_name_id]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: 'Book ID already exists' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO booknames (book_name_id, name, subject_id, company_id) VALUES (?, ?, ?, ?)',
      [book_name_id, name, subject_id, company_id]
    );

    const insertId = (result as any).insertId;
    const [savedBook] = await query(
      'SELECT booknames.*, subjects.name as subject_name, publications.name as publication_name ' +
      'FROM booknames ' +
      'LEFT JOIN subjects ON booknames.subject_id = subjects.id ' +
      'LEFT JOIN publications ON booknames.company_id = publications.id ' +
      'WHERE booknames.id = ?',
      [insertId]
    );

    return NextResponse.json(savedBook, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, book_name_id, name, subject_id, company_id } = await request.json();

    if (!id || !book_name_id || !name || !subject_id || !company_id) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if book_name_id already exists for different book
    const existing = await query(
      'SELECT id FROM booknames WHERE book_name_id = ? AND id != ?',
      [book_name_id, id]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: 'Book ID already exists' },
        { status: 400 }
      );
    }

    await query(
      'UPDATE booknames SET book_name_id = ?, name = ?, subject_id = ?, company_id = ? WHERE id = ?',
      [book_name_id, name, subject_id, company_id, id]
    );

    const [updatedBook] = await query(
      'SELECT booknames.*, subjects.name as subject_name, publications.name as publication_name ' +
      'FROM booknames ' +
      'LEFT JOIN subjects ON booknames.subject_id = subjects.id ' +
      'LEFT JOIN publications ON booknames.company_id = publications.id ' +
      'WHERE booknames.id = ?',
      [id]
    );

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    await query('DELETE FROM booknames WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    );
  }
} 