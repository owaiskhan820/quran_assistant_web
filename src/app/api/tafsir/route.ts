import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const resourceId = searchParams.get('resourceId');
  const ayahKey = searchParams.get('ayahKey');

  if (!resourceId || !ayahKey) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/tafsirs/${resourceId}/by_ayah/${ayahKey}`,
      { 
        headers: { Accept: 'application/json' },
        next: { revalidate: 86400 } // Cache for 24 hours
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch tafsir' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Tafsir API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
