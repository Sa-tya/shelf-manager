import { NextResponse } from 'next/server';
import { query } from '@/utils/db';
import { RowDataPacket } from 'mysql2';

interface BookListRow extends RowDataPacket {
  id: number;
  school_id: number;
}

export async function DELETE(
  request: Request,
  { params }: { params: { schoolId: string; bookId: string } }
) {
  try {
    // First get the school's ID from school_id
    const school = await query<RowDataPacket[]>(
      'SELECT id FROM schools WHERE school_id = ?',
      [params.schoolId]
    );

    if (!school || school.length === 0) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    const schoolInternalId = school[0].id;

    // Verify the book belongs to the school before deleting
    const existing = await query<BookListRow[]>(
      'SELECT id FROM booklist WHERE id = ? AND school_id = ?',
      [params.bookId, schoolInternalId]
    );

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    await query(
      'DELETE FROM booklist WHERE id = ? AND school_id = ?',
      [params.bookId, schoolInternalId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    );
  }
} 