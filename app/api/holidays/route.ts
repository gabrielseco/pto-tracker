import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { PublicHoliday } from '@/lib/types';

const HOLIDAYS_KEY = 'public-holidays';

export async function GET() {
  try {
    const holidays = await redis.get<PublicHoliday[]>(HOLIDAYS_KEY) || [];
    return NextResponse.json(holidays);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return NextResponse.json({ error: 'Failed to fetch holidays' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, date, year } = body;

    if (!name || !date || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const holidays = await redis.get<PublicHoliday[]>(HOLIDAYS_KEY) || [];
    const newHoliday: PublicHoliday = {
      id: Date.now().toString(),
      name,
      date,
      year,
    };

    holidays.push(newHoliday);
    await redis.set(HOLIDAYS_KEY, holidays);

    return NextResponse.json(newHoliday, { status: 201 });
  } catch (error) {
    console.error('Error creating holiday:', error);
    return NextResponse.json({ error: 'Failed to create holiday' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Holiday ID is required' }, { status: 400 });
    }

    const holidays = await redis.get<PublicHoliday[]>(HOLIDAYS_KEY) || [];
    const filteredHolidays = holidays.filter(holiday => holiday.id !== id);

    if (filteredHolidays.length === holidays.length) {
      return NextResponse.json({ error: 'Holiday not found' }, { status: 404 });
    }

    await redis.set(HOLIDAYS_KEY, filteredHolidays);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    return NextResponse.json({ error: 'Failed to delete holiday' }, { status: 500 });
  }
}
