import type { LegoModel, BuildStep, LegoPart } from '@/types';

// ── LDraw File Generation ──
// We generate LDraw-format files that can be rendered by Three.js LDrawLoader
// LDraw format reference: https://www.ldraw.org/article/218.html

// Common LDraw part IDs for basic bricks
const LDRAW_PARTS: Record<string, string> = {
  'brick_1x1': '3005.dat',
  'brick_1x2': '3004.dat',
  'brick_1x3': '3622.dat',
  'brick_1x4': '3010.dat',
  'brick_1x6': '3009.dat',
  'brick_1x8': '3008.dat',
  'brick_2x2': '3003.dat',
  'brick_2x3': '3002.dat',
  'brick_2x4': '3001.dat',
  'brick_2x6': '2456.dat',
  'brick_2x8': '3007.dat',
  'plate_1x1': '3024.dat',
  'plate_1x2': '3023.dat',
  'plate_1x4': '3710.dat',
  'plate_2x2': '3022.dat',
  'plate_2x4': '3020.dat',
  'plate_2x6': '3795.dat',
  'plate_4x4': '3031.dat',
  'slope_2x2': '3039.dat',
  'slope_1x2': '3040.dat',
  'tile_1x1': '3070b.dat',
  'tile_1x2': '3069b.dat',
  'tile_2x2': '3068b.dat',
  'round_1x1': '4073.dat',
  'round_2x2': '4032.dat',
  'arch_1x4': '3659.dat',
  'cylinder_2x2': '6143.dat',
};

// LDraw color codes
const LDRAW_COLORS: Record<string, number> = {
  Red: 4,
  Blue: 1,
  Yellow: 14,
  Green: 2,
  Black: 0,
  White: 15,
  Orange: 25,
  'Dark Bluish Gray': 72,
  'Light Bluish Gray': 71,
  Brown: 6,
  Tan: 19,
  'Dark Red': 320,
  'Dark Blue': 272,
  'Dark Green': 288,
  Pink: 13,
  Purple: 5,
  Lime: 27,
  'Medium Azure': 322,
  'Dark Orange': 484,
  Magenta: 26,
};

// Generate a simple LDraw model from a description
// This creates a visual prototype that can be rendered in 3D
export function generateLDrawModel(
  name: string,
  description: string,
  partsList: LegoPart[],
  steps: BuildStep[]
): string {
  const lines: string[] = [];

  // File header
  lines.push(`0 FILE ${name}.ldr`);
  lines.push(`0 ${name}`);
  lines.push(`0 Name: ${name}.ldr`);
  lines.push(`0 Author: BrickBot AI`);
  lines.push(`0 !CATEGORY ${description}`);
  lines.push('');

  // Add steps
  for (const step of steps) {
    lines.push(`0 STEP`);
    lines.push(`0 // Step ${step.stepNumber}: ${step.description}`);

    if (step.ldrawContent) {
      lines.push(step.ldrawContent);
    }
  }

  lines.push('0 NOFILE');
  return lines.join('\n');
}

// Generate a sample demo model (a simple house) for showcasing
export function generateDemoModel(): LegoModel {
  const parts: LegoPart[] = [
    { partNum: '3001', name: 'Brick 2x4', colorId: 4, colorName: 'Red', colorHex: 'C91A09', quantity: 20, imageUrl: '' },
    { partNum: '3003', name: 'Brick 2x2', colorId: 4, colorName: 'Red', colorHex: 'C91A09', quantity: 12, imageUrl: '' },
    { partNum: '3004', name: 'Brick 1x2', colorId: 15, colorName: 'White', colorHex: 'FFFFFF', quantity: 16, imageUrl: '' },
    { partNum: '3010', name: 'Brick 1x4', colorId: 15, colorName: 'White', colorHex: 'FFFFFF', quantity: 8, imageUrl: '' },
    { partNum: '3020', name: 'Plate 2x4', colorId: 2, colorName: 'Green', colorHex: '237841', quantity: 8, imageUrl: '' },
    { partNum: '3039', name: 'Slope 2x2/45°', colorId: 1, colorName: 'Blue', colorHex: '0055BF', quantity: 8, imageUrl: '' },
    { partNum: '3023', name: 'Plate 1x2', colorId: 14, colorName: 'Yellow', colorHex: 'F2CD37', quantity: 4, imageUrl: '' },
    { partNum: '3024', name: 'Plate 1x1', colorId: 0, colorName: 'Black', colorHex: '05131D', quantity: 4, imageUrl: '' },
  ];

  // Build a simple house in LDraw
  const ldraw = `0 FILE Casa_Demo.ldr
0 Casa Demo - BrickBot
0 Name: Casa_Demo.ldr
0 Author: BrickBot AI
0 !CATEGORY Architecture

0 STEP
0 // Step 1: Base verde
1 2 0 0 0 1 0 0 0 1 0 0 0 1 3020.dat
1 2 80 0 0 1 0 0 0 1 0 0 0 1 3020.dat
1 2 0 0 -40 1 0 0 0 1 0 0 0 1 3020.dat
1 2 80 0 -40 1 0 0 0 1 0 0 0 1 3020.dat

0 STEP
0 // Step 2: Primera fila de ladrillos rojos
1 4 0 -24 0 1 0 0 0 1 0 0 0 1 3001.dat
1 4 80 -24 0 1 0 0 0 1 0 0 0 1 3001.dat
1 4 0 -24 -40 1 0 0 0 1 0 0 0 1 3001.dat
1 4 80 -24 -40 1 0 0 0 1 0 0 0 1 3001.dat

0 STEP
0 // Step 3: Segunda fila con ventanas (ladrillos blancos)
1 15 0 -48 0 1 0 0 0 1 0 0 0 1 3010.dat
1 4 40 -48 0 1 0 0 0 1 0 0 0 1 3003.dat
1 15 80 -48 0 1 0 0 0 1 0 0 0 1 3010.dat
1 15 0 -48 -40 1 0 0 0 1 0 0 0 1 3004.dat
1 4 40 -48 -40 1 0 0 0 1 0 0 0 1 3001.dat

0 STEP
0 // Step 4: Tercera fila de ladrillos rojos
1 4 0 -72 0 1 0 0 0 1 0 0 0 1 3001.dat
1 4 80 -72 0 1 0 0 0 1 0 0 0 1 3001.dat
1 4 0 -72 -40 1 0 0 0 1 0 0 0 1 3001.dat
1 4 80 -72 -40 1 0 0 0 1 0 0 0 1 3001.dat

0 STEP
0 // Step 5: Tejado azul con pendientes
1 1 0 -96 0 0 0 1 0 1 0 -1 0 0 3039.dat
1 1 40 -96 0 0 0 1 0 1 0 -1 0 0 3039.dat
1 1 80 -96 0 0 0 1 0 1 0 -1 0 0 3039.dat
1 1 0 -96 -40 0 0 -1 0 1 0 1 0 0 3039.dat
1 1 40 -96 -40 0 0 -1 0 1 0 1 0 0 3039.dat
1 1 80 -96 -40 0 0 -1 0 1 0 1 0 0 3039.dat

0 NOFILE`;

  const steps: BuildStep[] = [
    { stepNumber: 1, description: 'Coloca la base verde (4 placas 2x4)', parts: [parts[4]] },
    { stepNumber: 2, description: 'Primera fila de ladrillos rojos', parts: [parts[0]] },
    { stepNumber: 3, description: 'Añade ventanas blancas en la segunda fila', parts: [parts[2], parts[3]] },
    { stepNumber: 4, description: 'Tercera fila de ladrillos rojos', parts: [parts[0]] },
    { stepNumber: 5, description: 'Coloca el tejado azul con pendientes', parts: [parts[5]] },
  ];

  return {
    id: 'demo-house',
    name: 'Casa Demo',
    description: 'Una casa sencilla para demostrar las capacidades de BrickBot',
    totalParts: parts.reduce((sum, p) => sum + p.quantity, 0),
    estimatedPrice: 12.50,
    ldrawContent: ldraw,
    steps,
    partsList: parts,
    sourcingSuggestions: [
      {
        type: 'bricklink',
        name: 'Comprar en BrickLink',
        url: 'https://www.bricklink.com',
        partsProvided: 80,
        totalPartsNeeded: 80,
        estimatedCost: 8.50,
        coveragePercent: 100,
      },
      {
        type: 'pick-a-brick',
        name: 'LEGO Pick a Brick',
        url: 'https://www.lego.com/pick-and-build/pick-a-brick',
        partsProvided: 56,
        totalPartsNeeded: 80,
        estimatedCost: 11.00,
        coveragePercent: 70,
      },
    ],
  };
}

export { LDRAW_PARTS, LDRAW_COLORS };
