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
export function generateDemoModel(conversationHint?: string): LegoModel {
  // Pick the best demo model based on conversation content
  const hint = (conversationHint || '').toLowerCase();
  
  if (hint.match(/pato|duck|patito/)) return generateDuckModel();
  if (hint.match(/coche|car|auto|vehiculo|vehículo/)) return generateCarModel();
  if (hint.match(/robot|mech|androide/)) return generateRobotModel();
  if (hint.match(/árbol|arbol|tree|planta|flor/)) return generateTreeModel();
  if (hint.match(/perro|dog|gato|cat|animal|mascota/)) return generateDogModel();
  if (hint.match(/avión|avion|plane|cohete|rocket|nave/)) return generateRocketModel();
  
  // Default: house
  return generateHouseModel();
}

function makeSourcing(totalParts: number) {
  return [
    {
      type: 'bricklink' as const,
      name: 'Comprar en BrickLink',
      url: 'https://www.bricklink.com',
      partsProvided: totalParts,
      totalPartsNeeded: totalParts,
      estimatedCost: +(totalParts * 0.12).toFixed(2),
      coveragePercent: 100,
    },
    {
      type: 'pick-a-brick' as const,
      name: 'LEGO Pick a Brick',
      url: 'https://www.lego.com/pick-and-build/pick-a-brick',
      partsProvided: Math.round(totalParts * 0.7),
      totalPartsNeeded: totalParts,
      estimatedCost: +(totalParts * 0.18).toFixed(2),
      coveragePercent: 70,
    },
  ];
}

// ── DUCK MODEL ──
function generateDuckModel(): LegoModel {
  const parts: LegoPart[] = [
    { partNum: '3001', name: 'Brick 2x4', colorId: 14, colorName: 'Yellow', colorHex: 'F2CD37', quantity: 7, imageUrl: '' },
    { partNum: '3003', name: 'Brick 2x2', colorId: 14, colorName: 'Yellow', colorHex: 'F2CD37', quantity: 14, imageUrl: '' },
    { partNum: '3004', name: 'Brick 1x2', colorId: 14, colorName: 'Yellow', colorHex: 'F2CD37', quantity: 8, imageUrl: '' },
    { partNum: '3005', name: 'Brick 1x1', colorId: 14, colorName: 'Yellow', colorHex: 'F2CD37', quantity: 4, imageUrl: '' },
    { partNum: '3005', name: 'Brick 1x1', colorId: 0, colorName: 'Black', colorHex: '05131D', quantity: 2, imageUrl: '' },
    { partNum: '3020', name: 'Plate 2x4', colorId: 25, colorName: 'Orange', colorHex: 'FE8A18', quantity: 2, imageUrl: '' },
    { partNum: '3022', name: 'Plate 2x2', colorId: 25, colorName: 'Orange', colorHex: 'FE8A18', quantity: 2, imageUrl: '' },
    { partNum: '3023', name: 'Plate 1x2', colorId: 25, colorName: 'Orange', colorHex: 'FE8A18', quantity: 2, imageUrl: '' },
    { partNum: '3039', name: 'Slope 2x2/45°', colorId: 14, colorName: 'Yellow', colorHex: 'F2CD37', quantity: 1, imageUrl: '' },
  ];

  // Duck faces negative Z (toward viewer). Body centered at x~40, z~60.
  // Y: 0=base (feet), negative=higher layers (LDraw convention, viewer negates Y).
  // Stacking: plates h=8, bricks h=24. Layer y offsets: 0, -8, -32, -56, -80, -104, -128, -152.
  const ldraw = `0 FILE Pato_LEGO.ldr
0 Pato LEGO - BrickBot
0 Name: Pato_LEGO.ldr
0 Author: BrickBot AI

0 STEP
0 // Step 1: Base naranja - patas del pato
1 25 40 0 40 1 0 0 0 1 0 0 0 1 3020.dat
1 25 40 0 80 1 0 0 0 1 0 0 0 1 3020.dat
1 25 80 0 40 1 0 0 0 1 0 0 0 1 3022.dat
1 25 0 0 60 1 0 0 0 1 0 0 0 1 3022.dat

0 STEP
0 // Step 2: Cuerpo inferior - barriga ancha
1 14 40 -8 40 1 0 0 0 1 0 0 0 1 3001.dat
1 14 40 -8 80 1 0 0 0 1 0 0 0 1 3001.dat
1 14 -20 -8 60 1 0 0 0 1 0 0 0 1 3003.dat
1 14 100 -8 60 1 0 0 0 1 0 0 0 1 3003.dat
1 14 40 -8 110 1 0 0 0 1 0 0 0 1 3003.dat

0 STEP
0 // Step 3: Cuerpo medio - la parte mas ancha con alas
1 14 40 -32 40 1 0 0 0 1 0 0 0 1 3001.dat
1 14 40 -32 80 1 0 0 0 1 0 0 0 1 3001.dat
1 14 -20 -32 60 1 0 0 0 1 0 0 0 1 3003.dat
1 14 100 -32 60 1 0 0 0 1 0 0 0 1 3003.dat
1 14 40 -32 110 1 0 0 0 1 0 0 0 1 3003.dat
1 14 -50 -32 60 1 0 0 0 1 0 0 0 1 3004.dat
1 14 130 -32 60 1 0 0 0 1 0 0 0 1 3004.dat

0 STEP
0 // Step 4: Cuerpo superior - empieza a estrecharse
1 14 40 -56 40 1 0 0 0 1 0 0 0 1 3001.dat
1 14 40 -56 80 1 0 0 0 1 0 0 0 1 3001.dat
1 14 -20 -56 60 1 0 0 0 1 0 0 0 1 3004.dat
1 14 100 -56 60 1 0 0 0 1 0 0 0 1 3004.dat
1 14 40 -56 110 1 0 0 0 1 0 0 0 1 3004.dat

0 STEP
0 // Step 5: Lomo y cola - se estrecha arriba, cola sube
1 14 40 -80 60 1 0 0 0 1 0 0 0 1 3001.dat
1 14 40 -80 100 1 0 0 0 1 0 0 0 1 3003.dat
1 14 40 -80 20 1 0 0 0 1 0 0 0 1 3003.dat
1 14 40 -80 140 1 0 0 0 1 0 0 0 1 3039.dat

0 STEP
0 // Step 6: Cuello - columna amarilla que sube del pecho
1 14 40 -104 20 1 0 0 0 1 0 0 0 1 3003.dat
1 14 40 -104 -10 1 0 0 0 1 0 0 0 1 3004.dat

0 STEP
0 // Step 7: Cabeza redonda - mas ancha que el cuello
1 14 40 -128 10 1 0 0 0 1 0 0 0 1 3003.dat
1 14 40 -128 -30 1 0 0 0 1 0 0 0 1 3003.dat
1 14 0 -128 -10 1 0 0 0 1 0 0 0 1 3005.dat
1 14 80 -128 -10 1 0 0 0 1 0 0 0 1 3005.dat

0 STEP
0 // Step 8: Ojos, pico naranja y coronilla
1 0 30 -152 -10 1 0 0 0 1 0 0 0 1 3005.dat
1 0 50 -152 -10 1 0 0 0 1 0 0 0 1 3005.dat
1 25 40 -128 -60 1 0 0 0 1 0 0 0 1 3023.dat
1 25 40 -136 -60 1 0 0 0 1 0 0 0 1 3023.dat
1 14 40 -152 10 1 0 0 0 1 0 0 0 1 3004.dat
1 14 40 -152 -30 1 0 0 0 1 0 0 0 1 3004.dat

0 NOFILE`;

  const totalParts = parts.reduce((s, p) => s + p.quantity, 0);
  const steps: BuildStep[] = [
    { stepNumber: 1, description: 'Base naranja: 4 placas formando las patas', parts: [parts[5], parts[6]] },
    { stepNumber: 2, description: 'Barriga inferior: cuerpo ancho amarillo', parts: [parts[0], parts[1]] },
    { stepNumber: 3, description: 'Cuerpo medio con alas que sobresalen', parts: [parts[0], parts[1], parts[2]] },
    { stepNumber: 4, description: 'Cuerpo superior: se estrecha hacia arriba', parts: [parts[0], parts[2]] },
    { stepNumber: 5, description: 'Lomo y cola: la cola sube con una pendiente', parts: [parts[0], parts[1], parts[8]] },
    { stepNumber: 6, description: 'Cuello: columna que sube del pecho', parts: [parts[1], parts[2]] },
    { stepNumber: 7, description: 'Cabeza redonda: más ancha que el cuello', parts: [parts[1], parts[3]] },
    { stepNumber: 8, description: 'Ojos negros, pico naranja y coronilla', parts: [parts[4], parts[7], parts[2]] },
  ];

  return {
    id: 'demo-duck',
    name: 'Pato LEGO',
    description: 'Un simpático pato amarillo con pico naranja y alas',
    totalParts,
    estimatedPrice: +(totalParts * 0.15).toFixed(2),
    ldrawContent: ldraw,
    steps,
    partsList: parts,
    sourcingSuggestions: makeSourcing(totalParts),
  };
}

// ── CAR MODEL ──
function generateCarModel(): LegoModel {
  const parts: LegoPart[] = [
    { partNum: '3001', name: 'Brick 2x4', colorId: 4, colorName: 'Red', colorHex: 'C91A09', quantity: 6, imageUrl: '' },
    { partNum: '3003', name: 'Brick 2x2', colorId: 4, colorName: 'Red', colorHex: 'C91A09', quantity: 4, imageUrl: '' },
    { partNum: '3020', name: 'Plate 2x4', colorId: 72, colorName: 'Dark Gray', colorHex: '6C6E68', quantity: 4, imageUrl: '' },
    { partNum: '3003', name: 'Brick 2x2', colorId: 0, colorName: 'Black', colorHex: '05131D', quantity: 4, imageUrl: '' },
    { partNum: '3039', name: 'Slope 2x2/45°', colorId: 4, colorName: 'Red', colorHex: 'C91A09', quantity: 2, imageUrl: '' },
    { partNum: '3004', name: 'Brick 1x2', colorId: 15, colorName: 'White', colorHex: 'FFFFFF', quantity: 4, imageUrl: '' },
    { partNum: '3022', name: 'Plate 2x2', colorId: 71, colorName: 'Light Gray', colorHex: 'A0A5A9', quantity: 2, imageUrl: '' },
  ];

  const ldraw = `0 FILE Coche_LEGO.ldr
0 Coche LEGO - BrickBot
0 Name: Coche_LEGO.ldr
0 Author: BrickBot AI

0 STEP
0 // Step 1: Chasis gris
1 72 0 0 0 1 0 0 0 1 0 0 0 1 3020.dat
1 72 80 0 0 1 0 0 0 1 0 0 0 1 3020.dat
1 72 0 0 -40 1 0 0 0 1 0 0 0 1 3020.dat
1 72 80 0 -40 1 0 0 0 1 0 0 0 1 3020.dat

0 STEP
0 // Step 2: Ruedas negras
1 0 -10 -8 0 1 0 0 0 1 0 0 0 1 3003.dat
1 0 130 -8 0 1 0 0 0 1 0 0 0 1 3003.dat
1 0 -10 -8 -40 1 0 0 0 1 0 0 0 1 3003.dat
1 0 130 -8 -40 1 0 0 0 1 0 0 0 1 3003.dat

0 STEP
0 // Step 3: Carrocería roja inferior
1 4 0 -8 0 1 0 0 0 1 0 0 0 1 3001.dat
1 4 80 -8 0 1 0 0 0 1 0 0 0 1 3001.dat
1 4 0 -8 -40 1 0 0 0 1 0 0 0 1 3001.dat
1 4 80 -8 -40 1 0 0 0 1 0 0 0 1 3001.dat

0 STEP
0 // Step 4: Ventanas blancas y carrocería superior
1 15 20 -32 0 1 0 0 0 1 0 0 0 1 3004.dat
1 15 60 -32 0 1 0 0 0 1 0 0 0 1 3004.dat
1 15 20 -32 -40 1 0 0 0 1 0 0 0 1 3004.dat
1 15 60 -32 -40 1 0 0 0 1 0 0 0 1 3004.dat
1 4 20 -32 -20 1 0 0 0 1 0 0 0 1 3003.dat
1 4 60 -32 -20 1 0 0 0 1 0 0 0 1 3003.dat

0 STEP
0 // Step 5: Techo rojo
1 4 20 -56 -10 1 0 0 0 1 0 0 0 1 3001.dat
1 4 20 -56 -30 1 0 0 0 1 0 0 0 1 3001.dat

0 NOFILE`;

  const totalParts = parts.reduce((s, p) => s + p.quantity, 0);
  const steps: BuildStep[] = [
    { stepNumber: 1, description: 'Monta el chasis gris (4 placas 2x4)', parts: [parts[2]] },
    { stepNumber: 2, description: 'Añade las 4 ruedas negras', parts: [parts[3]] },
    { stepNumber: 3, description: 'Carrocería roja - parte inferior', parts: [parts[0]] },
    { stepNumber: 4, description: 'Ventanas blancas y laterales', parts: [parts[5], parts[1]] },
    { stepNumber: 5, description: 'Techo rojo del coche', parts: [parts[0]] },
  ];

  return {
    id: 'demo-car',
    name: 'Coche LEGO',
    description: 'Un coche deportivo rojo con ventanas',
    totalParts,
    estimatedPrice: +(totalParts * 0.15).toFixed(2),
    ldrawContent: ldraw,
    steps,
    partsList: parts,
    sourcingSuggestions: makeSourcing(totalParts),
  };
}

// ── ROBOT MODEL ──
function generateRobotModel(): LegoModel {
  const parts: LegoPart[] = [
    { partNum: '3003', name: 'Brick 2x2', colorId: 71, colorName: 'Light Gray', colorHex: 'A0A5A9', quantity: 8, imageUrl: '' },
    { partNum: '3001', name: 'Brick 2x4', colorId: 71, colorName: 'Light Gray', colorHex: 'A0A5A9', quantity: 4, imageUrl: '' },
    { partNum: '3004', name: 'Brick 1x2', colorId: 1, colorName: 'Blue', colorHex: '0055BF', quantity: 4, imageUrl: '' },
    { partNum: '3005', name: 'Brick 1x1', colorId: 4, colorName: 'Red', colorHex: 'C91A09', quantity: 2, imageUrl: '' },
    { partNum: '3022', name: 'Plate 2x2', colorId: 72, colorName: 'Dark Gray', colorHex: '6C6E68', quantity: 4, imageUrl: '' },
    { partNum: '3024', name: 'Plate 1x1', colorId: 14, colorName: 'Yellow', colorHex: 'F2CD37', quantity: 2, imageUrl: '' },
  ];

  const ldraw = `0 FILE Robot_LEGO.ldr
0 Robot LEGO - BrickBot
0 Name: Robot_LEGO.ldr
0 Author: BrickBot AI

0 STEP
0 // Step 1: Pies del robot
1 72 0 0 0 1 0 0 0 1 0 0 0 1 3022.dat
1 72 60 0 0 1 0 0 0 1 0 0 0 1 3022.dat

0 STEP
0 // Step 2: Piernas grises
1 71 0 -8 0 1 0 0 0 1 0 0 0 1 3003.dat
1 71 60 -8 0 1 0 0 0 1 0 0 0 1 3003.dat

0 STEP
0 // Step 3: Cuerpo - torso grande
1 71 10 -32 0 1 0 0 0 1 0 0 0 1 3001.dat
1 71 10 -32 -40 1 0 0 0 1 0 0 0 1 3001.dat
1 1 10 -56 0 1 0 0 0 1 0 0 0 1 3004.dat
1 1 50 -56 0 1 0 0 0 1 0 0 0 1 3004.dat

0 STEP
0 // Step 4: Brazos laterales
1 71 -30 -32 -10 1 0 0 0 1 0 0 0 1 3003.dat
1 71 100 -32 -10 1 0 0 0 1 0 0 0 1 3003.dat
1 72 -30 -56 -10 1 0 0 0 1 0 0 0 1 3022.dat
1 72 100 -56 -10 1 0 0 0 1 0 0 0 1 3022.dat

0 STEP
0 // Step 5: Cabeza y cara
1 71 20 -56 -10 1 0 0 0 1 0 0 0 1 3003.dat
1 71 20 -80 -10 1 0 0 0 1 0 0 0 1 3003.dat
1 4 25 -104 -5 1 0 0 0 1 0 0 0 1 3005.dat
1 4 45 -104 -5 1 0 0 0 1 0 0 0 1 3005.dat
1 14 30 -80 10 1 0 0 0 1 0 0 0 1 3024.dat
1 14 40 -80 10 1 0 0 0 1 0 0 0 1 3024.dat

0 NOFILE`;

  const totalParts = parts.reduce((s, p) => s + p.quantity, 0);
  const steps: BuildStep[] = [
    { stepNumber: 1, description: 'Pies del robot (2 placas oscuras)', parts: [parts[4]] },
    { stepNumber: 2, description: 'Piernas grises (2 bricks 2x2)', parts: [parts[0]] },
    { stepNumber: 3, description: 'Torso central con detalles azules', parts: [parts[1], parts[2]] },
    { stepNumber: 4, description: 'Brazos laterales articulados', parts: [parts[0], parts[4]] },
    { stepNumber: 5, description: 'Cabeza con ojos rojos y antena', parts: [parts[0], parts[3], parts[5]] },
  ];

  return {
    id: 'demo-robot',
    name: 'Robot LEGO',
    description: 'Un robot futurista gris con ojos rojos',
    totalParts,
    estimatedPrice: +(totalParts * 0.15).toFixed(2),
    ldrawContent: ldraw,
    steps,
    partsList: parts,
    sourcingSuggestions: makeSourcing(totalParts),
  };
}

// ── TREE MODEL ──
function generateTreeModel(): LegoModel {
  const parts: LegoPart[] = [
    { partNum: '3003', name: 'Brick 2x2', colorId: 6, colorName: 'Brown', colorHex: '583927', quantity: 4, imageUrl: '' },
    { partNum: '3003', name: 'Brick 2x2', colorId: 2, colorName: 'Green', colorHex: '237841', quantity: 10, imageUrl: '' },
    { partNum: '3001', name: 'Brick 2x4', colorId: 2, colorName: 'Green', colorHex: '237841', quantity: 4, imageUrl: '' },
    { partNum: '3039', name: 'Slope 2x2/45°', colorId: 2, colorName: 'Green', colorHex: '237841', quantity: 4, imageUrl: '' },
    { partNum: '3022', name: 'Plate 2x2', colorId: 2, colorName: 'Green', colorHex: '237841', quantity: 2, imageUrl: '' },
    { partNum: '3005', name: 'Brick 1x1', colorId: 4, colorName: 'Red', colorHex: 'C91A09', quantity: 3, imageUrl: '' },
  ];

  const ldraw = `0 FILE Arbol_LEGO.ldr
0 Arbol LEGO - BrickBot
0 Name: Arbol_LEGO.ldr
0 Author: BrickBot AI

0 STEP
0 // Step 1: Base del tronco
1 6 20 0 -10 1 0 0 0 1 0 0 0 1 3003.dat
1 6 20 -24 -10 1 0 0 0 1 0 0 0 1 3003.dat

0 STEP
0 // Step 2: Tronco superior
1 6 20 -48 -10 1 0 0 0 1 0 0 0 1 3003.dat
1 6 20 -72 -10 1 0 0 0 1 0 0 0 1 3003.dat

0 STEP
0 // Step 3: Copa inferior - hojas anchas
1 2 -20 -96 -30 1 0 0 0 1 0 0 0 1 3001.dat
1 2 60 -96 -30 1 0 0 0 1 0 0 0 1 3001.dat
1 2 -20 -96 10 1 0 0 0 1 0 0 0 1 3001.dat
1 2 60 -96 10 1 0 0 0 1 0 0 0 1 3001.dat

0 STEP
0 // Step 4: Copa media con frutas rojas
1 2 0 -120 -20 1 0 0 0 1 0 0 0 1 3003.dat
1 2 40 -120 -20 1 0 0 0 1 0 0 0 1 3003.dat
1 2 0 -120 20 1 0 0 0 1 0 0 0 1 3003.dat
1 2 40 -120 20 1 0 0 0 1 0 0 0 1 3003.dat
1 4 -5 -120 0 1 0 0 0 1 0 0 0 1 3005.dat
1 4 65 -120 0 1 0 0 0 1 0 0 0 1 3005.dat

0 STEP
0 // Step 5: Cima del árbol
1 2 10 -144 -10 1 0 0 0 1 0 0 0 1 3003.dat
1 2 30 -144 -10 1 0 0 0 1 0 0 0 1 3003.dat
1 2 20 -144 0 1 0 0 0 1 0 0 0 1 3022.dat
1 4 30 -168 -5 1 0 0 0 1 0 0 0 1 3005.dat

0 NOFILE`;

  const totalParts = parts.reduce((s, p) => s + p.quantity, 0);
  const steps: BuildStep[] = [
    { stepNumber: 1, description: 'Base del tronco marrón', parts: [parts[0]] },
    { stepNumber: 2, description: 'Tronco superior', parts: [parts[0]] },
    { stepNumber: 3, description: 'Copa inferior - hojas anchas', parts: [parts[2]] },
    { stepNumber: 4, description: 'Copa media con frutas rojas', parts: [parts[1], parts[5]] },
    { stepNumber: 5, description: 'Cima del árbol', parts: [parts[1], parts[4]] },
  ];

  return {
    id: 'demo-tree',
    name: 'Árbol LEGO',
    description: 'Un frondoso árbol verde con frutas rojas',
    totalParts,
    estimatedPrice: +(totalParts * 0.15).toFixed(2),
    ldrawContent: ldraw,
    steps,
    partsList: parts,
    sourcingSuggestions: makeSourcing(totalParts),
  };
}

// ── DOG MODEL ──
function generateDogModel(): LegoModel {
  const parts: LegoPart[] = [
    { partNum: '3003', name: 'Brick 2x2', colorId: 25, colorName: 'Orange', colorHex: 'FE8A18', quantity: 8, imageUrl: '' },
    { partNum: '3001', name: 'Brick 2x4', colorId: 25, colorName: 'Orange', colorHex: 'FE8A18', quantity: 4, imageUrl: '' },
    { partNum: '3004', name: 'Brick 1x2', colorId: 25, colorName: 'Orange', colorHex: 'FE8A18', quantity: 4, imageUrl: '' },
    { partNum: '3005', name: 'Brick 1x1', colorId: 0, colorName: 'Black', colorHex: '05131D', quantity: 3, imageUrl: '' },
    { partNum: '3022', name: 'Plate 2x2', colorId: 25, colorName: 'Orange', colorHex: 'FE8A18', quantity: 2, imageUrl: '' },
    { partNum: '3004', name: 'Brick 1x2', colorId: 15, colorName: 'White', colorHex: 'FFFFFF', quantity: 2, imageUrl: '' },
  ];

  const ldraw = `0 FILE Perro_LEGO.ldr
0 Perro LEGO - BrickBot
0 Name: Perro_LEGO.ldr
0 Author: BrickBot AI

0 STEP
0 // Step 1: Patas del perro
1 25 0 0 0 1 0 0 0 1 0 0 0 1 3004.dat
1 25 60 0 0 1 0 0 0 1 0 0 0 1 3004.dat
1 25 0 0 -40 1 0 0 0 1 0 0 0 1 3004.dat
1 25 60 0 -40 1 0 0 0 1 0 0 0 1 3004.dat

0 STEP
0 // Step 2: Cuerpo del perro
1 25 0 -24 -10 1 0 0 0 1 0 0 0 1 3001.dat
1 25 0 -24 -30 1 0 0 0 1 0 0 0 1 3001.dat

0 STEP
0 // Step 3: Lomo y barriga
1 25 0 -48 -10 1 0 0 0 1 0 0 0 1 3001.dat
1 15 0 -48 -30 1 0 0 0 1 0 0 0 1 3004.dat
1 15 40 -48 -30 1 0 0 0 1 0 0 0 1 3004.dat
1 25 0 -48 -50 1 0 0 0 1 0 0 0 1 3001.dat

0 STEP
0 // Step 4: Cabeza
1 25 -30 -48 -20 1 0 0 0 1 0 0 0 1 3003.dat
1 25 -30 -72 -20 1 0 0 0 1 0 0 0 1 3003.dat

0 STEP
0 // Step 5: Cara - ojos, nariz y cola
1 0 -30 -96 -15 1 0 0 0 1 0 0 0 1 3005.dat
1 0 -10 -96 -15 1 0 0 0 1 0 0 0 1 3005.dat
1 0 -20 -72 -40 1 0 0 0 1 0 0 0 1 3005.dat
1 25 80 -48 -20 1 0 0 0 1 0 0 0 1 3003.dat

0 NOFILE`;

  const totalParts = parts.reduce((s, p) => s + p.quantity, 0);
  const steps: BuildStep[] = [
    { stepNumber: 1, description: 'Cuatro patas naranjas', parts: [parts[2]] },
    { stepNumber: 2, description: 'Cuerpo base (2 bricks 2x4)', parts: [parts[1]] },
    { stepNumber: 3, description: 'Lomo y barriga blanca', parts: [parts[1], parts[5]] },
    { stepNumber: 4, description: 'Cabeza del perro', parts: [parts[0]] },
    { stepNumber: 5, description: 'Ojos, nariz y cola', parts: [parts[3], parts[0]] },
  ];

  return {
    id: 'demo-dog',
    name: 'Perro LEGO',
    description: 'Un simpático perro naranja con barriga blanca',
    totalParts,
    estimatedPrice: +(totalParts * 0.15).toFixed(2),
    ldrawContent: ldraw,
    steps,
    partsList: parts,
    sourcingSuggestions: makeSourcing(totalParts),
  };
}

// ── ROCKET MODEL ──
function generateRocketModel(): LegoModel {
  const parts: LegoPart[] = [
    { partNum: '3003', name: 'Brick 2x2', colorId: 15, colorName: 'White', colorHex: 'FFFFFF', quantity: 8, imageUrl: '' },
    { partNum: '3001', name: 'Brick 2x4', colorId: 15, colorName: 'White', colorHex: 'FFFFFF', quantity: 2, imageUrl: '' },
    { partNum: '3039', name: 'Slope 2x2/45°', colorId: 4, colorName: 'Red', colorHex: 'C91A09', quantity: 4, imageUrl: '' },
    { partNum: '3004', name: 'Brick 1x2', colorId: 1, colorName: 'Blue', colorHex: '0055BF', quantity: 4, imageUrl: '' },
    { partNum: '3022', name: 'Plate 2x2', colorId: 72, colorName: 'Dark Gray', colorHex: '6C6E68', quantity: 4, imageUrl: '' },
    { partNum: '3005', name: 'Brick 1x1', colorId: 4, colorName: 'Red', colorHex: 'C91A09', quantity: 2, imageUrl: '' },
    { partNum: '3039', name: 'Slope 2x2/45°', colorId: 15, colorName: 'White', colorHex: 'FFFFFF', quantity: 2, imageUrl: '' },
  ];

  const ldraw = `0 FILE Cohete_LEGO.ldr
0 Cohete LEGO - BrickBot
0 Name: Cohete_LEGO.ldr
0 Author: BrickBot AI

0 STEP
0 // Step 1: Propulsores grises
1 72 0 0 0 1 0 0 0 1 0 0 0 1 3022.dat
1 72 0 0 -40 1 0 0 0 1 0 0 0 1 3022.dat
1 72 40 0 0 1 0 0 0 1 0 0 0 1 3022.dat
1 72 40 0 -40 1 0 0 0 1 0 0 0 1 3022.dat

0 STEP
0 // Step 2: Alerones rojos
1 4 -20 -8 -10 1 0 0 0 1 0 0 0 1 3039.dat
1 4 60 -8 -10 1 0 0 0 1 0 0 0 1 3039.dat
1 4 20 -8 -50 1 0 0 0 1 0 0 0 1 3039.dat
1 4 20 -8 30 1 0 0 0 1 0 0 0 1 3039.dat

0 STEP
0 // Step 3: Cuerpo inferior blanco
1 15 10 -8 -10 1 0 0 0 1 0 0 0 1 3003.dat
1 15 10 -32 -10 1 0 0 0 1 0 0 0 1 3003.dat
1 15 10 -32 -30 1 0 0 0 1 0 0 0 1 3003.dat

0 STEP
0 // Step 4: Cuerpo medio con ventanas azules
1 15 10 -56 -20 1 0 0 0 1 0 0 0 1 3003.dat
1 1 10 -56 0 1 0 0 0 1 0 0 0 1 3004.dat
1 1 30 -56 0 1 0 0 0 1 0 0 0 1 3004.dat
1 15 10 -80 -20 1 0 0 0 1 0 0 0 1 3003.dat
1 1 10 -80 0 1 0 0 0 1 0 0 0 1 3004.dat
1 1 30 -80 0 1 0 0 0 1 0 0 0 1 3004.dat

0 STEP
0 // Step 5: Punta del cohete
1 15 10 -104 -20 1 0 0 0 1 0 0 0 1 3003.dat
1 15 10 -104 0 1 0 0 0 1 0 0 0 1 3039.dat
1 15 10 -104 -40 1 0 0 0 1 0 0 0 1 3039.dat
1 4 20 -128 -10 1 0 0 0 1 0 0 0 1 3005.dat
1 4 20 -128 -20 1 0 0 0 1 0 0 0 1 3005.dat

0 NOFILE`;

  const totalParts = parts.reduce((s, p) => s + p.quantity, 0);
  const steps: BuildStep[] = [
    { stepNumber: 1, description: 'Propulsores grises de la base', parts: [parts[4]] },
    { stepNumber: 2, description: 'Alerones rojos laterales', parts: [parts[2]] },
    { stepNumber: 3, description: 'Cuerpo inferior blanco', parts: [parts[0]] },
    { stepNumber: 4, description: 'Cuerpo medio con ventanas azules', parts: [parts[0], parts[3]] },
    { stepNumber: 5, description: 'Punta del cohete con cono', parts: [parts[0], parts[6], parts[5]] },
  ];

  return {
    id: 'demo-rocket',
    name: 'Cohete LEGO',
    description: 'Un cohete espacial blanco con alerones rojos',
    totalParts,
    estimatedPrice: +(totalParts * 0.15).toFixed(2),
    ldrawContent: ldraw,
    steps,
    partsList: parts,
    sourcingSuggestions: makeSourcing(totalParts),
  };
}

// ── HOUSE MODEL (default) ──
function generateHouseModel(): LegoModel {
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

  const totalParts = parts.reduce((sum, p) => sum + p.quantity, 0);
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
    totalParts,
    estimatedPrice: 12.50,
    ldrawContent: ldraw,
    steps,
    partsList: parts,
    sourcingSuggestions: makeSourcing(totalParts),
  };
}

export { LDRAW_PARTS, LDRAW_COLORS };
