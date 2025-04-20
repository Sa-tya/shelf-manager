import { NextResponse } from 'next/server';
import { query } from '@/utils/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface BookListRow extends RowDataPacket {
  id: number;
  school_id: number;
  class: string;
  expected_count: number;
  sell_count: number;
  session: number;
  created_at: Date;
}

interface SchoolRow extends RowDataPacket {
  id: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const schoolId = searchParams.get('schoolId');
  const session = searchParams.get('session');
  if (!schoolId) {
    return NextResponse.json(
      { error: 'School ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // First get the school's internal ID
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

    // If no session specified, get available sessions first
    let latestSession: number = session ? Number(session) : 0;
    let sessions: number[] = [latestSession];

    if (!session) {
      const sessionsResult = await query(
        `SELECT DISTINCT session 
         FROM booklist 
         WHERE school_id = ? 
         ORDER BY session DESC`,
        [school.id]
      ) as { session: number }[];

      sessions = sessionsResult.map(s => s.session);
      if (sessions.length > 0) {
        latestSession = sessions[0];
      }
    }
    
      // If there are sessions, get booklists for the latest session
      if (sessions.length > 0) {
        const booklists = await query(
          `SELECT * FROM booklist
           WHERE school_id = ? AND session = ?
           ORDER BY class ASC`,
          [school.id, latestSession]
        ) as BookListRow[];
        
        return NextResponse.json({
        sessions,
        currentSession: latestSession,
        booklists
      });
    }

    // If no sessions exist, return empty data
      return NextResponse.json({
        sessions: [],
        currentSession: latestSession,
        booklists: []
      });

    // Get booklists for specific session
    // const booklists = await query(
    //   `SELECT bl.*, bli.* 
    //    FROM booklist bl
    //    LEFT JOIN booklist_items bli ON bl.id = bli.booklist_id
    //    WHERE bl.school_id = ? AND bl.session = ?
    //    ORDER BY bl.class ASC`,
    //   [school.id, session]
    // ) as BookListRow[];
    
    // return NextResponse.json({
    //   booklists
    // });
  } catch (error) {
    console.error('Error fetching booklists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booklists' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { schoolId, class: className } = await request.json();

    if (!schoolId || !className) {
      return NextResponse.json(
        { error: 'School ID and class are required' },
        { status: 400 }
      );
    }

    // First get the school's internal ID
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

    // Get current year for session
    const currentYear = new Date().getFullYear();

    // Create new booklist
    const result = await query(
      'INSERT INTO booklist (school_id, class, session) VALUES (?, ?, ?)',
      [school.id, className, currentYear]
    ) as ResultSetHeader;

    const [savedBooklist] = await query(
      'SELECT * FROM booklist WHERE id = ?',
      [result.insertId]
    ) as BookListRow[];

    return NextResponse.json(savedBooklist, { status: 201 });
  } catch (error) {
    console.error('Error creating booklist:', error);
    return NextResponse.json(
      { error: 'Failed to create booklist' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { schoolId, booklistId } = await request.json();

    if (!schoolId || !booklistId) {
      return NextResponse.json(
        { error: 'School ID and booklist ID are required' },
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

    // Verify the booklist belongs to the school before deleting
    const [existing] = await query(
      'SELECT id FROM booklist WHERE id = ? AND school_id = ?',
      [booklistId, schoolInternalId]
    ) as BookListRow[];

    if (!existing) {
      return NextResponse.json(
        { error: 'Booklist not found' },
        { status: 404 }
      );
    }

    await query(
      'DELETE FROM booklist WHERE id = ? AND school_id = ?',
      [booklistId, schoolInternalId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booklist:', error);
    return NextResponse.json(
      { error: 'Failed to delete booklist' },
      { status: 500 }
    );
  }
} 