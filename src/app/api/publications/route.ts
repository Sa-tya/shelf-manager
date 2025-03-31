import { NextResponse } from 'next/server';
import { query } from '@/utils/db';

export async function GET() {
  try {
    const publications = await query(
      'SELECT * FROM publications ORDER BY created_at DESC'
    );
    return NextResponse.json(publications);
  } catch (error) {
    console.error('Error fetching publications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch publications' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { pubid, name, city } = await request.json();

    if (!pubid || !name || !city) {
      return NextResponse.json(
        { error: 'Publication ID, name, and city are required' },
        { status: 400 }
      );
    }

    // Check if pubid already exists
    const existing = await query(
      'SELECT id FROM publications WHERE pubid = ?',
      [pubid]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: 'Publication ID already exists' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO publications (pubid, name, city) VALUES (?, ?, ?)',
      [pubid, name, city]
    );

    const insertId = (result as any).insertId;
    const savedPublication = await query(
      'SELECT * FROM publications WHERE id = ?',
      [insertId]
    );

    return NextResponse.json(savedPublication[0], { status: 201 });
  } catch (error) {
    console.error('Error creating publication:', error);
    return NextResponse.json(
      { error: 'Failed to create publication' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, pubid, name, city } = await request.json();

    if (!id || !pubid || !name || !city) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if pubid already exists for different publication
    const existing = await query(
      'SELECT id FROM publications WHERE pubid = ? AND id != ?',
      [pubid, id]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: 'Publication ID already exists' },
        { status: 400 }
      );
    }

    await query(
      'UPDATE publications SET pubid = ?, name = ?, city = ? WHERE id = ?',
      [pubid, name, city, id]
    );

    const updatedPublication = await query(
      'SELECT * FROM publications WHERE id = ?',
      [id]
    );

    return NextResponse.json(updatedPublication[0]);
  } catch (error) {
    console.error('Error updating publication:', error);
    return NextResponse.json(
      { error: 'Failed to update publication' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Publication ID is required' },
        { status: 400 }
      );
    }

    await query('DELETE FROM publications WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting publication:', error);
    return NextResponse.json(
      { error: 'Failed to delete publication' },
      { status: 500 }
    );
  }
} 