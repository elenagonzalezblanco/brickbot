import { NextRequest, NextResponse } from 'next/server';
import { searchSets, getSetParts, searchParts } from '@/lib/rebrickable';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const query = searchParams.get('q') || '';

  try {
    switch (action) {
      case 'search-sets': {
        const maxParts = searchParams.get('max_parts');
        const sets = await searchSets(query, maxParts ? parseInt(maxParts) : undefined);
        return NextResponse.json({ sets });
      }

      case 'set-parts': {
        const setNum = searchParams.get('set_num');
        if (!setNum) {
          return NextResponse.json({ error: 'set_num required' }, { status: 400 });
        }
        const parts = await getSetParts(setNum);
        return NextResponse.json({ parts });
      }

      case 'search-parts': {
        const parts = await searchParts(query);
        return NextResponse.json({ parts });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Parts sourcing API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
