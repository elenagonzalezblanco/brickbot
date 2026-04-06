import type { LegoSet, LegoPart } from '@/types';

const API_BASE = 'https://rebrickable.com/api/v3';

async function rebrickableGet(endpoint: string, params?: Record<string, string>) {
  const url = new URL(`${API_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `key ${process.env.REBRICKABLE_API_KEY}`,
    },
  });

  if (!res.ok) throw new Error(`Rebrickable API error: ${res.status}`);
  return res.json();
}

export async function searchSets(query: string, maxParts?: number): Promise<LegoSet[]> {
  const params: Record<string, string> = {
    search: query,
    page_size: '20',
    ordering: '-year',
  };
  if (maxParts) params.max_parts = String(maxParts);

  const data = await rebrickableGet('/lego/sets/', params);

  return data.results.map((s: any) => ({
    setNum: s.set_num,
    name: s.name,
    year: s.year,
    numParts: s.num_parts,
    imageUrl: s.set_img_url || '',
    theme: s.theme_id?.toString(),
  }));
}

export async function getSetParts(setNum: string): Promise<LegoPart[]> {
  const data = await rebrickableGet(`/lego/sets/${encodeURIComponent(setNum)}/parts/`, {
    page_size: '1000',
    inc_color_details: '1',
  });

  return data.results.map((item: any) => ({
    partNum: item.part.part_num,
    name: item.part.name,
    colorId: item.color.id,
    colorName: item.color.name,
    colorHex: item.color.rgb,
    quantity: item.quantity,
    imageUrl: item.part.part_img_url,
    category: item.part.part_cat_id?.toString(),
  }));
}

export async function searchParts(query: string): Promise<LegoPart[]> {
  const data = await rebrickableGet('/lego/parts/', {
    search: query,
    page_size: '20',
    inc_part_details: '1',
  });

  return data.results.map((p: any) => ({
    partNum: p.part_num,
    name: p.name,
    colorId: 0,
    colorName: 'Various',
    colorHex: '999999',
    quantity: 0,
    imageUrl: p.part_img_url,
    category: p.part_cat_id?.toString(),
  }));
}

export async function getPartColors(partNum: string) {
  const data = await rebrickableGet(`/lego/parts/${encodeURIComponent(partNum)}/colors/`, {
    page_size: '100',
  });
  return data.results;
}

export async function getColors() {
  const data = await rebrickableGet('/lego/colors/', { page_size: '200' });
  return data.results;
}
