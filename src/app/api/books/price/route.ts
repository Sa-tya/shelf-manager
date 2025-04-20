import { NextResponse } from 'next/server';
import { query } from '@/utils/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Book id is required' },
      { status: 400 }
    );
  }

  try {
    const prices = await query(
      `SELECT b.class, b.price 
       FROM books b
       WHERE b.book_name_id = ?
       ORDER BY b.class`,
      [id]
    ) as { class: string; price: number }[];

    if (prices.length === 0) {
      return NextResponse.json(
        { error: 'No prices found for the given book' },
        { status: 404 }
      );
    }

    // Convert array to object with class as key for easier lookup
    const pricesByClass = prices.reduce((acc, curr) => {
      acc[curr.class] = curr.price;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({ prices: pricesByClass });
  } catch (error) {
    console.error('Error fetching book prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book prices' },
      { status: 500 }
    );
  }
} 