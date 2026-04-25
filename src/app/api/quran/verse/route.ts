import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ayahKey = searchParams.get('ayahKey');

  if (!ayahKey) {
    return NextResponse.json({ error: 'Missing ayahKey' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/quran/verses/uthmani?verse_key=${ayahKey}`,
      { 
        headers: { Accept: 'application/json' },
        next: { revalidate: 86400 } 
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch verse' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
