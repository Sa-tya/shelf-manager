import { NextResponse } from 'next/server';
import { query } from '@/utils/db';

export async function GET() {
  try {
    const subjects = await query('SELECT * FROM subjects ORDER BY id DESC');
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { subid, name } = await request.json();

    if (!subid || !name) {
      return NextResponse.json(
        { error: 'Subject ID and name are required' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO subjects (subid, name) VALUES (?, ?)',
      [subid, name]
    );

    return NextResponse.json({
      id: result.insertId,
      subid,
      name,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, subid, name } = await request.json();

    if (!id || !subid || !name) {
      return NextResponse.json(
        { error: 'Subject ID, subid, and name are required' },
        { status: 400 }
      );
    }

    await query(
      'UPDATE subjects SET subid = ?, name = ? WHERE id = ?',
      [subid, name, id]
    );

    return NextResponse.json({ id, subid, name });
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json(
      { error: 'Failed to update subject' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    await query('DELETE FROM subjects WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json(
      { error: 'Failed to delete subject' },
      { status: 500 }
    );
  }
} 