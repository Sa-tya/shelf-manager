import { NextResponse } from 'next/server';
import { query } from '@/utils/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface BookListItemRow extends RowDataPacket {
  id: number;
  book_id: number;
  booklist_id: number;
  created_at: Date;
}

interface SchoolRow extends RowDataPacket {
  id: number;
}

interface BookListRow extends RowDataPacket {
  id: number;
  school_id: number;
  class: string;
  expected_count: number;
  sell_count: number;
  session: number;
  created_at: Date;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const schoolId = searchParams.get('schoolId');
  const session = searchParams.get('session');

  if (!schoolId || !session) {
    return NextResponse.json(
      { error: 'School ID and session are required' },
      { status: 400 }
    );
  }
  
  try {
    // First verify the school exists
    const [school] = await query(
      'SELECT id FROM schools WHERE school_id = ?',
      [schoolId]
    ) as SchoolRow[];

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Get all items for these booklists
    const items = await query(
      `SELECT bli.*, bn.name as book_name, s.name as subject_name, p.name as company_name,
              b.price as book_price, bl.class
       FROM booklist_items bli
       LEFT JOIN booklist bl ON bli.booklist_id = bl.id
       LEFT JOIN books b ON bli.book_id = b.id
       LEFT JOIN booknames bn ON b.book_name_id = bn.id
       LEFT JOIN subjects s ON bn.subject_id = s.id
       LEFT JOIN publications p ON bn.company_id = p.id
       WHERE bl.school_id = ? AND bl.session = ?`,
      [school.id, session]
    ) as BookListItemRow[];
    console.log(items);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching booklist items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booklist items' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { schoolId, booklistId, book_id, _class } = await request.json();

    if (!schoolId || !booklistId || !book_id) {
      return NextResponse.json(
        { error: 'School ID, booklist ID, and book ID are required' },
        { status: 400 }
      );
    }

    // First verify the school exists
    const [school] = await query(
      'SELECT id FROM schools WHERE school_id = ?',
      [schoolId]
    ) as SchoolRow[];

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Then verify the booklist exists and belongs to the school
    const [booklist] = await query(
      'SELECT * FROM booklist WHERE id = ? AND school_id = ?',
      [booklistId, school.id]
    ) as BookListRow[];

    if (!booklist) {
      return NextResponse.json(
        { error: 'Booklist not found' },
        { status: 404 }
      );
    }

    const [book] = await query(
      'SELECT id FROM books WHERE class = ? AND book_name_id = ?',
      [_class, book_id]
    );

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found for the specified class and book name' },
        { status: 404 }
      );
    }

    const result = await query(
      `INSERT INTO booklist_items 
       (book_id, booklist_id) 
       VALUES (?, ?)`,
      [book.id, booklistId]
    ) as ResultSetHeader;

    const [savedItem] = await query(
      `SELECT bli.*, bn.name as book_name, s.name as subject_name, p.name as publication_name,
              b.price as book_price
       FROM booklist_items bli
       LEFT JOIN books b ON bli.book_id = b.id
       LEFT JOIN booknames bn ON b.book_name_id = bn.id
       LEFT JOIN subjects s ON bn.subject_id = s.id
       LEFT JOIN publications p ON bn.company_id = p.id
       WHERE bli.id = ?`,
      [result.insertId]
    ) as BookListItemRow[];

    return NextResponse.json(savedItem, { status: 201 });
  } catch (error) {
    console.error('Error creating booklist item:', error);
    return NextResponse.json(
      { error: 'Failed to create booklist item' },
      { status: 500 }
    );
  }
} 