// ── Image2Lego: Convert images to LEGO mosaic models ──
// Pixelates an image and maps each pixel to the nearest LEGO color,
// generating a flat plate mosaic with build instructions.

import type { LegoModel, BuildStep, LegoPart, SourcingSuggestion } from '@/types';

// Official LEGO colors for mosaics
const LEGO_PALETTE: Array<{ id: number; name: string; hex: string; rgb: [number, number, number] }> = [
  { id: 0,  name: 'Black',           hex: '05131D', rgb: [5, 19, 29] },
  { id: 1,  name: 'Blue',            hex: '0055BF', rgb: [0, 85, 191] },
  { id: 2,  name: 'Green',           hex: '237841', rgb: [35, 120, 65] },
  { id: 4,  name: 'Red',             hex: 'C91A09', rgb: [201, 26, 9] },
  { id: 6,  name: 'Brown',           hex: '583927', rgb: [88, 57, 39] },
  { id: 14, name: 'Yellow',          hex: 'F2CD37', rgb: [242, 205, 55] },
  { id: 15, name: 'White',           hex: 'FFFFFF', rgb: [255, 255, 255] },
  { id: 19, name: 'Tan',             hex: 'DEC69C', rgb: [222, 198, 156] },
  { id: 25, name: 'Orange',          hex: 'FE8A18', rgb: [254, 138, 24] },
  { id: 27, name: 'Lime',            hex: 'BDC618', rgb: [189, 198, 24] },
  { id: 71, name: 'Light Bluish Gray', hex: 'A0A5A9', rgb: [160, 165, 169] },
  { id: 72, name: 'Dark Bluish Gray',  hex: '6C6E68', rgb: [108, 110, 104] },
  { id: 5,  name: 'Purple',          hex: '8320B7', rgb: [131, 32, 183] },
  { id: 13, name: 'Pink',            hex: 'FCB4D0', rgb: [252, 180, 208] },
];

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  // Weighted Euclidean distance (human eye is more sensitive to green)
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);
}

function findNearestLegoColor(r: number, g: number, b: number): typeof LEGO_PALETTE[0] {
  let best = LEGO_PALETTE[0];
  let bestDist = Infinity;
  for (const c of LEGO_PALETTE) {
    const d = colorDistance(r, g, b, c.rgb[0], c.rgb[1], c.rgb[2]);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}

export interface MosaicOptions {
  width: number;     // Studs wide
  height: number;    // Studs tall
  useAllColors: boolean;
}

export interface MosaicResult {
  model: LegoModel;
  preview: ImageData;      // Pixelated preview
  grid: number[][];        // Color IDs grid  
  studsWide: number;
  studsTall: number;
}

/**
 * Convert an image to a LEGO mosaic model.
 * Returns a LegoModel with flat 1x1 plates arranged as a mosaic.
 */
export async function imageToLegoMosaic(
  imageSource: string,  // data URL or URL
  options: MosaicOptions,
): Promise<MosaicResult> {
  const { width: targetWidth, height: targetHeight } = options;

  // Load image into canvas
  const img = await loadImage(imageSource);
  
  // Create canvas at target resolution (1 pixel = 1 stud)
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;
  
  // Draw image scaled to target size
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const pixels = imageData.data;

  // Map each pixel to nearest LEGO color
  const grid: number[][] = [];
  const colorCounts: Record<number, number> = {};
  const preview = ctx.createImageData(targetWidth, targetHeight);

  for (let row = 0; row < targetHeight; row++) {
    const gridRow: number[] = [];
    for (let col = 0; col < targetWidth; col++) {
      const i = (row * targetWidth + col) * 4;
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      
      const legoColor = findNearestLegoColor(r, g, b);
      gridRow.push(legoColor.id);
      colorCounts[legoColor.id] = (colorCounts[legoColor.id] || 0) + 1;

      // Update preview with LEGO color
      preview.data[i] = legoColor.rgb[0];
      preview.data[i + 1] = legoColor.rgb[1];
      preview.data[i + 2] = legoColor.rgb[2];
      preview.data[i + 3] = 255;
    }
    grid.push(gridRow);
  }

  // Generate parts list
  const partsList: LegoPart[] = [];
  for (const [colorIdStr, qty] of Object.entries(colorCounts)) {
    const colorId = parseInt(colorIdStr);
    const color = LEGO_PALETTE.find(c => c.id === colorId) || LEGO_PALETTE[0];
    partsList.push({
      partNum: '3024',
      name: 'Plate 1x1',
      colorId: color.id,
      colorName: color.name,
      colorHex: color.hex,
      quantity: qty,
      imageUrl: '',
    });
  }

  // Generate LDraw content — each row is a build step
  const rowsPerStep = Math.max(1, Math.ceil(targetHeight / 8));
  const steps: BuildStep[] = [];

  let ldraw = `0 FILE Mosaico_LEGO.ldr\n`;
  ldraw += `0 Mosaico LEGO - Image2Lego\n`;
  ldraw += `0 Name: Mosaico_LEGO.ldr\n`;
  ldraw += `0 Author: BrickBot AI (Image2Lego)\n\n`;

  let stepNum = 0;
  for (let startRow = 0; startRow < targetHeight; startRow += rowsPerStep) {
    stepNum++;
    const endRow = Math.min(startRow + rowsPerStep, targetHeight);
    ldraw += `0 STEP\n`;
    ldraw += `0 // Step ${stepNum}: Filas ${startRow + 1} a ${endRow}\n`;

    const stepParts: LegoPart[] = [];
    for (let row = startRow; row < endRow; row++) {
      for (let col = 0; col < targetWidth; col++) {
        const colorId = grid[row][col];
        // Position: each plate is 20x8x20 LDU. We lay them flat as a mosaic.
        // X = col * 20, Y = 0 (flat on baseplate), Z = row * 20
        ldraw += `1 ${colorId} ${col * 20} 0 ${row * 20} 1 0 0 0 1 0 0 0 1 3024.dat\n`;
      }
    }

    steps.push({
      stepNumber: stepNum,
      description: `Filas ${startRow + 1}-${endRow}: Coloca ${targetWidth * (endRow - startRow)} placas 1x1`,
      parts: stepParts,
    });
  }

  ldraw += `\n0 NOFILE`;

  const totalParts = targetWidth * targetHeight;

  const model: LegoModel = {
    id: `mosaic-${Date.now()}`,
    name: `Mosaico LEGO ${targetWidth}×${targetHeight}`,
    description: `Mosaico de ${targetWidth}×${targetHeight} studs (${totalParts} piezas) generado con Image2Lego`,
    totalParts,
    estimatedPrice: +(totalParts * 0.08).toFixed(2),
    ldrawContent: ldraw,
    steps,
    partsList,
    sourcingSuggestions: [
      {
        type: 'bricklink',
        name: 'Comprar en BrickLink',
        url: 'https://www.bricklink.com',
        partsProvided: totalParts,
        totalPartsNeeded: totalParts,
        estimatedCost: +(totalParts * 0.05).toFixed(2),
        coveragePercent: 100,
      },
      {
        type: 'pick-a-brick',
        name: 'LEGO Pick a Brick',
        url: 'https://www.lego.com/pick-and-build/pick-a-brick',
        partsProvided: Math.round(totalParts * 0.8),
        totalPartsNeeded: totalParts,
        estimatedCost: +(totalParts * 0.07).toFixed(2),
        coveragePercent: 80,
      },
    ],
  };

  return { model, preview, grid, studsWide: targetWidth, studsTall: targetHeight };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Render a mosaic preview to a canvas element
 */
export function renderMosaicPreview(
  canvas: HTMLCanvasElement,
  grid: number[][],
  scale: number = 1,
): void {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  canvas.width = cols * scale;
  canvas.height = rows * scale;
  const ctx = canvas.getContext('2d')!;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const colorId = grid[row][col];
      const color = LEGO_PALETTE.find(c => c.id === colorId) || LEGO_PALETTE[0];
      ctx.fillStyle = `#${color.hex}`;
      ctx.fillRect(col * scale, row * scale, scale, scale);
      
      // Draw stud circle if scale is large enough
      if (scale >= 8) {
        ctx.beginPath();
        ctx.arc(col * scale + scale / 2, row * scale + scale / 2, scale * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,0.15)`;
        ctx.fill();
        ctx.strokeStyle = `rgba(0,0,0,0.1)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}
