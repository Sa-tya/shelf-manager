import { NextResponse } from 'next/server';
import { query } from '@/utils/db';
import { Book, BookFormData } from '@/types/book';

export async function GET() {
  try {
    const books = await query(
      `SELECT books.*, booknames.name as book_name, 
       subjects.name as subject_name, publications.name as publication_name
       FROM books
       JOIN booknames ON books.book_name_id = booknames.id
       LEFT JOIN subjects ON booknames.subject_id = subjects.id
       LEFT JOIN publications ON booknames.company_id = publications.id
       ORDER BY books.created_at DESC`
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
    const { book_name_id, entries } = await request.json() as BookFormData;

    if (!book_name_id || !entries || entries.length === 0) {
      return NextResponse.json(
        { error: 'Book name and at least one entry are required' },
        { status: 400 }
      );
    }

    // Validate entries
    // for (const entry of entries) {
    //   if (!entry.class || !entry.price || !entry.quantity) {
    //     return NextResponse.json(
    //       { error: 'Class, price, and quantity are required for each entry' },
    //       { status: 400 }
    //     );
    //   }
    // }

    // Check if book_name_id exists
    const bookName = await query(
      'SELECT id FROM booknames WHERE id = ?',
      [book_name_id]
    );

    if (!Array.isArray(bookName) || bookName.length === 0) {
      return NextResponse.json(
        { error: 'Book name not found' },
        { status: 404 }
      );
    }

    // Insert all entries
    const insertPromises = entries
      .filter(entry => entry.class && entry.price && entry.quantity)
      .map(entry =>
        query(
          'INSERT INTO books (book_name_id, class, price, quantity) VALUES (?, ?, ?, ?)',
          [book_name_id, entry.class, entry.price, entry.quantity]
        )
      );

    await Promise.all(insertPromises);

    // Fetch all inserted entries
    const savedBooks = await query(
      `SELECT books.*, booknames.name as book_name
       FROM books
       JOIN booknames ON books.book_name_id = booknames.id
       WHERE books.book_name_id = ?
       ORDER BY books.created_at DESC`,
      [book_name_id]
    );

    return NextResponse.json(savedBooks, { status: 201 });
  } catch (error) {
    console.error('Error creating book entries:', error);
    return NextResponse.json(
      { error: 'Failed to create book entries' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, price, quantity } = await request.json();

    if (!id || (!price && !quantity)) {
      return NextResponse.json(
        { error: 'Book ID and at least price or quantity are required' },
        { status: 400 }
      );
    }

    // Check if book exists
    const existing = await query(
      'SELECT id FROM books WHERE id = ?',
      [id]
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Update only provided fields
    const updates: string[] = [];
    const values: (number)[] = [];

    if (price !== undefined) {
      updates.push('price = ?');
      values.push(price);
    }
    if (quantity !== undefined) {
      updates.push('quantity = ?');
      values.push(quantity);
    }

    values.push(id);

    await query(
      `UPDATE books SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updatedBook = await query(
      `SELECT books.*, booknames.name as book_name, 
       subjects.name as subject_name, publications.name as publication_name
       FROM books
       JOIN booknames ON books.book_name_id = booknames.id
       LEFT JOIN subjects ON booknames.subject_id = subjects.id
       LEFT JOIN publications ON booknames.company_id = publications.id
       WHERE books.id = ?`,
      [id]
    );

    if (!Array.isArray(updatedBook) || updatedBook.length === 0) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBook[0]);
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

    // Check if book exists
    const existing = await query(
      'SELECT id FROM books WHERE id = ?',
      [id]
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
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