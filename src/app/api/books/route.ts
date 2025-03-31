import { NextResponse } from 'next/server';
import { query } from '@/utils/db';
import { Book } from '@/types/book';

export async function GET() {
  try {
    const books = await query(
      'SELECT books.*, subjects.name as subject_name, publications.name as publication_name ' +
      'FROM books ' +
      'LEFT JOIN subjects ON books.subject_id = subjects.id ' +
      'LEFT JOIN publications ON books.company_id = publications.id ' +
      'ORDER BY books.created_at DESC'
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
    const { title, author, isbn, subject_id, company_id } = await request.json();

    if (!title || !author || !isbn || !subject_id || !company_id) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO books (title, author, isbn, subject_id, company_id) VALUES (?, ?, ?, ?, ?)',
      [title, author, isbn, subject_id, company_id]
    );

    const insertId = (result as any).insertId;
    const [savedBook] = await query(
      'SELECT * FROM books WHERE id = ?',
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
    const { id, title, author, isbn, subject_id, company_id } = await request.json();

    if (!id || !title || !author || !isbn || !subject_id || !company_id) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await query(
      'UPDATE books SET title = ?, author = ?, isbn = ?, subject_id = ?, company_id = ? WHERE id = ?',
      [title, author, isbn, subject_id, company_id, id]
    );

    const [updatedBook] = await query(
      'SELECT * FROM books WHERE id = ?',
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

    await query('DELETE FROM books WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    );
  }
} 