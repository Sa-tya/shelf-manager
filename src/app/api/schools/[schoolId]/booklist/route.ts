import { NextResponse } from 'next/server';
import { query } from '@/utils/db';
import { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2';

interface SchoolRow extends RowDataPacket {
  id: number;
}

interface BookListRow extends RowDataPacket {
  id: number;
  school_id: number;
  name: string;
  class: string;
  price: number;
}

export async function GET(
  request: Request,
  context: { params: { schoolId: string } }
) {
  const { schoolId } = await context.params;
  
  try {
    // First get the school's ID from school_id
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

    const schoolInternalId = school.id;

    const books = await query(
      'SELECT * FROM booklist WHERE school_id = ? ORDER BY class ASC',
      [schoolInternalId]
    ) as BookListRow[];
    
    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching booklist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booklist' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: { schoolId: string } }
) {
  const { schoolId } = await context.params;
  
  try {
    const { name, class: className, price } = await request.json();

    if (!name || !className || price === undefined) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // First get the school's ID from school_id
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

    const schoolInternalId = school.id;

    const result = await query(
      'INSERT INTO booklist (school_id, name, class, price) VALUES (?, ?, ?, ?)',
      [schoolInternalId, name, className, price]
    ) as ResultSetHeader;

    const [savedBook] = await query(
      'SELECT * FROM booklist WHERE id = ?',
      [result.insertId]
    ) as BookListRow[];

    return NextResponse.json(savedBook || null, { status: 201 });
  } catch (error) {
    console.error('Error adding book:', error);
    return NextResponse.json(
      { error: 'Failed to add book' },
      { status: 500 }
    );
  }
} 