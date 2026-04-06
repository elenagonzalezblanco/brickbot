import type { LegoPart, SourcingSuggestion } from '@/types';

// BrickLink price estimation (simplified - in production, use OAuth API)
// Average price per piece based on type and color availability
const AVERAGE_PRICE_PER_PIECE = 0.08; // EUR
const RARE_COLOR_MULTIPLIER = 1.5;
const SPECIAL_PART_MULTIPLIER = 2.0;

const COMMON_COLORS = [
  'Black', 'White', 'Red', 'Blue', 'Yellow', 'Green',
  'Dark Bluish Gray', 'Light Bluish Gray', 'Tan', 'Brown',
];

export function estimatePartPrice(part: LegoPart): number {
  let price = AVERAGE_PRICE_PER_PIECE;

  if (!COMMON_COLORS.includes(part.colorName)) {
    price *= RARE_COLOR_MULTIPLIER;
  }

  // Special parts (Technic, decorated, etc.)
  if (part.category && parseInt(part.category) > 30) {
    price *= SPECIAL_PART_MULTIPLIER;
  }

  return Math.round(price * part.quantity * 100) / 100;
}

export function estimateTotalPrice(parts: LegoPart[]): number {
  return parts.reduce((total, part) => total + estimatePartPrice(part), 0);
}

export function generateBrickLinkWantedList(parts: LegoPart[]): string {
  // Generate BrickLink XML wanted list format
  const xmlParts = parts.map(
    (p) =>
      `  <ITEM>
    <ITEMTYPE>P</ITEMTYPE>
    <ITEMID>${p.partNum}</ITEMID>
    <COLOR>${p.colorId}</COLOR>
    <MINQTY>${p.quantity}</MINQTY>
  </ITEM>`
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<INVENTORY>
${xmlParts.join('\n')}
</INVENTORY>`;
}

export function generateSourcingSuggestions(
  parts: LegoPart[],
  availableSets?: { setNum: string; name: string; parts: LegoPart[]; price: number }[]
): SourcingSuggestion[] {
  const suggestions: SourcingSuggestion[] = [];
  const totalParts = parts.reduce((sum, p) => sum + p.quantity, 0);

  // Suggestion: Buy individual parts on BrickLink
  const bricklinkPrice = estimateTotalPrice(parts);
  suggestions.push({
    type: 'bricklink',
    name: 'Comprar piezas individuales en BrickLink',
    url: 'https://www.bricklink.com',
    partsProvided: totalParts,
    totalPartsNeeded: totalParts,
    estimatedCost: bricklinkPrice,
    coveragePercent: 100,
  });

  // Suggestion: LEGO Pick a Brick
  suggestions.push({
    type: 'pick-a-brick',
    name: 'LEGO Pick a Brick (tienda oficial)',
    url: 'https://www.lego.com/pick-and-build/pick-a-brick',
    partsProvided: Math.floor(totalParts * 0.7), // ~70% common parts available
    totalPartsNeeded: totalParts,
    estimatedCost: bricklinkPrice * 1.3, // Typically more expensive
    coveragePercent: 70,
  });

  // Check if any existing sets cover many of the needed parts
  if (availableSets) {
    for (const set of availableSets) {
      const matchingParts = set.parts.filter((sp) =>
        parts.some((p) => p.partNum === sp.partNum && p.colorId === sp.colorId)
      );
      const coverage = matchingParts.reduce((sum, p) => sum + p.quantity, 0);
      const coveragePercent = Math.round((coverage / totalParts) * 100);

      if (coveragePercent > 20) {
        suggestions.push({
          type: 'set',
          name: `Set ${set.setNum}: ${set.name}`,
          url: `https://www.bricklink.com/v2/catalog/catalogitem.page?S=${set.setNum}`,
          partsProvided: coverage,
          totalPartsNeeded: totalParts,
          estimatedCost: set.price,
          coveragePercent,
        });
      }
    }
  }

  return suggestions.sort((a, b) => b.coveragePercent - a.coveragePercent);
}
