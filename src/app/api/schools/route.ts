import { NextResponse } from 'next/server';
import { query } from '@/utils/db';
import { School } from '@/types/school';

export async function GET() {
  try {
    const schools = await query(
      'SELECT * FROM schools ORDER BY created_at DESC'
    );
    return NextResponse.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schools' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { school_id, name, city, contact, email } = await request.json();

    if (!school_id || !name || !city || !contact || !email) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if school_id already exists
    const existing = await query(
      'SELECT id FROM schools WHERE school_id = ?',
      [school_id]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: 'School ID already exists' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO schools (school_id, name, city, contact, email) VALUES (?, ?, ?, ?, ?)',
      [school_id, name, city, contact, email]
    );

    const insertId = (result as any).insertId;
    const savedSchool = await query(
      'SELECT * FROM schools WHERE id = ?',
      [insertId]
    );

    return NextResponse.json(Array.isArray(savedSchool) ? savedSchool[0] : null, { status: 201 });
  } catch (error) {
    console.error('Error creating school:', error);
    return NextResponse.json(
      { error: 'Failed to create school' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, school_id, name, city, contact, email } = await request.json();

    if (!id || !school_id || !name || !city || !contact || !email) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if school_id already exists for different school
    const existing = await query(
      'SELECT id FROM schools WHERE school_id = ? AND id != ?',
      [school_id, id]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: 'School ID already exists' },
        { status: 400 }
      );
    }

    await query(
      'UPDATE schools SET school_id = ?, name = ?, city = ?, contact = ?, email = ? WHERE id = ?',
      [school_id, name, city, contact, email, id]
    );

    const updatedSchool = await query(
      'SELECT * FROM schools WHERE id = ?',
      [id]
    );

    if (!Array.isArray(updatedSchool) || updatedSchool.length === 0) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSchool[0]);
  } catch (error) {
    console.error('Error updating school:', error);
    return NextResponse.json(
      { error: 'Failed to update school' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Check if school exists
    const existing = await query(
      'SELECT id FROM schools WHERE id = ?',
      [id]
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    await query('DELETE FROM schools WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting school:', error);
    return NextResponse.json(
      { error: 'Failed to delete school' },
      { status: 500 }
    );
  }
} 