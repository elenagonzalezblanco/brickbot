// ── Packed MPD Generator for LDraw-compatible viewers ──
// Generates self-contained .ldr/.mpd files with inline part geometry
// Compatible with: LeoCad, LDCad, Mecabricks (via import), Bricksmith

// ── Part Dimensions (LDU = LDraw Units) ──
// 1 stud = 20 LDU, 1 brick height = 24 LDU, 1 plate height = 8 LDU
// Stud: radius 6 LDU, height 4 LDU above top surface

interface PartDef {
  id: string;       // e.g. '3001'
  file: string;     // e.g. '3001.dat'
  name: string;
  width: number;    // X in LDU
  height: number;   // Y in LDU (24 for brick, 8 for plate)
  depth: number;    // Z in LDU
  studsX: number;   // studs along X
  studsZ: number;   // studs along Z
  isSlope?: boolean;
}

const PARTS: Record<string, PartDef> = {
  '3005': { id: '3005', file: '3005.dat', name: 'Brick 1 x 1',  width: 20,  height: 24, depth: 20,  studsX: 1, studsZ: 1 },
  '3004': { id: '3004', file: '3004.dat', name: 'Brick 1 x 2',  width: 40,  height: 24, depth: 20,  studsX: 2, studsZ: 1 },
  '3622': { id: '3622', file: '3622.dat', name: 'Brick 1 x 3',  width: 60,  height: 24, depth: 20,  studsX: 3, studsZ: 1 },
  '3010': { id: '3010', file: '3010.dat', name: 'Brick 1 x 4',  width: 80,  height: 24, depth: 20,  studsX: 4, studsZ: 1 },
  '3009': { id: '3009', file: '3009.dat', name: 'Brick 1 x 6',  width: 120, height: 24, depth: 20,  studsX: 6, studsZ: 1 },
  '3003': { id: '3003', file: '3003.dat', name: 'Brick 2 x 2',  width: 40,  height: 24, depth: 40,  studsX: 2, studsZ: 2 },
  '3001': { id: '3001', file: '3001.dat', name: 'Brick 2 x 4',  width: 80,  height: 24, depth: 40,  studsX: 4, studsZ: 2 },
  '3024': { id: '3024', file: '3024.dat', name: 'Plate 1 x 1',  width: 20,  height: 8,  depth: 20,  studsX: 1, studsZ: 1 },
  '3023': { id: '3023', file: '3023.dat', name: 'Plate 1 x 2',  width: 40,  height: 8,  depth: 20,  studsX: 2, studsZ: 1 },
  '3022': { id: '3022', file: '3022.dat', name: 'Plate 2 x 2',  width: 40,  height: 8,  depth: 40,  studsX: 2, studsZ: 2 },
  '3020': { id: '3020', file: '3020.dat', name: 'Plate 2 x 4',  width: 80,  height: 8,  depth: 40,  studsX: 4, studsZ: 2 },
  '3039': { id: '3039', file: '3039.dat', name: 'Slope 45 2 x 2',width: 40, height: 24, depth: 40,  studsX: 2, studsZ: 1, isSlope: true },
  '3040': { id: '3040', file: '3040.dat', name: 'Slope 45 1 x 2',width: 40, height: 24, depth: 20,  studsX: 2, studsZ: 1, isSlope: true },
};

// ── Geometry Generators ──

function generateCylinder(cx: number, topY: number, cz: number, radius: number, height: number, sides: number = 16): string {
  const lines: string[] = [];
  const bottomY = topY + height;
  const pts: [number, number][] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    pts.push([
      Math.round((cx + radius * Math.cos(angle)) * 100) / 100,
      Math.round((cz + radius * Math.sin(angle)) * 100) / 100,
    ]);
  }
  // Top disc
  for (let i = 0; i < sides; i++) {
    const n = (i + 1) % sides;
    lines.push(`3 16 ${cx} ${topY} ${cz} ${pts[i][0]} ${topY} ${pts[i][1]} ${pts[n][0]} ${topY} ${pts[n][1]}`);
  }
  // Bottom disc (reverse winding)
  for (let i = 0; i < sides; i++) {
    const n = (i + 1) % sides;
    lines.push(`3 16 ${cx} ${bottomY} ${cz} ${pts[n][0]} ${bottomY} ${pts[n][1]} ${pts[i][0]} ${bottomY} ${pts[i][1]}`);
  }
  // Side quads
  for (let i = 0; i < sides; i++) {
    const n = (i + 1) % sides;
    lines.push(`4 16 ${pts[i][0]} ${topY} ${pts[i][1]} ${pts[n][0]} ${topY} ${pts[n][1]} ${pts[n][0]} ${bottomY} ${pts[n][1]} ${pts[i][0]} ${bottomY} ${pts[i][1]}`);
  }
  // Edge lines (top ring)
  for (let i = 0; i < sides; i++) {
    const n = (i + 1) % sides;
    lines.push(`2 24 ${pts[i][0]} ${topY} ${pts[i][1]} ${pts[n][0]} ${topY} ${pts[n][1]}`);
  }
  return lines.join('\n');
}

function generateBox(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): string {
  const lines: string[] = [];
  // 6 faces (CCW from outside)
  lines.push(`4 16 ${x1} ${y1} ${z1} ${x1} ${y1} ${z2} ${x2} ${y1} ${z2} ${x2} ${y1} ${z1}`); // Top
  lines.push(`4 16 ${x1} ${y2} ${z1} ${x2} ${y2} ${z1} ${x2} ${y2} ${z2} ${x1} ${y2} ${z2}`); // Bottom
  lines.push(`4 16 ${x1} ${y1} ${z1} ${x2} ${y1} ${z1} ${x2} ${y2} ${z1} ${x1} ${y2} ${z1}`); // Front
  lines.push(`4 16 ${x2} ${y1} ${z2} ${x1} ${y1} ${z2} ${x1} ${y2} ${z2} ${x2} ${y2} ${z2}`); // Back
  lines.push(`4 16 ${x1} ${y1} ${z2} ${x1} ${y1} ${z1} ${x1} ${y2} ${z1} ${x1} ${y2} ${z2}`); // Left
  lines.push(`4 16 ${x2} ${y1} ${z1} ${x2} ${y1} ${z2} ${x2} ${y2} ${z2} ${x2} ${y2} ${z1}`); // Right
  // 12 edge lines
  lines.push(`2 24 ${x1} ${y1} ${z1} ${x2} ${y1} ${z1}`);
  lines.push(`2 24 ${x2} ${y1} ${z1} ${x2} ${y1} ${z2}`);
  lines.push(`2 24 ${x2} ${y1} ${z2} ${x1} ${y1} ${z2}`);
  lines.push(`2 24 ${x1} ${y1} ${z2} ${x1} ${y1} ${z1}`);
  lines.push(`2 24 ${x1} ${y2} ${z1} ${x2} ${y2} ${z1}`);
  lines.push(`2 24 ${x2} ${y2} ${z1} ${x2} ${y2} ${z2}`);
  lines.push(`2 24 ${x2} ${y2} ${z2} ${x1} ${y2} ${z2}`);
  lines.push(`2 24 ${x1} ${y2} ${z2} ${x1} ${y2} ${z1}`);
  lines.push(`2 24 ${x1} ${y1} ${z1} ${x1} ${y2} ${z1}`);
  lines.push(`2 24 ${x2} ${y1} ${z1} ${x2} ${y2} ${z1}`);
  lines.push(`2 24 ${x2} ${y1} ${z2} ${x2} ${y2} ${z2}`);
  lines.push(`2 24 ${x1} ${y1} ${z2} ${x1} ${y2} ${z2}`);
  return lines.join('\n');
}

function generateSlopeGeometry(w: number, h: number, d: number): string {
  // Slope goes from full height at front (z=-d/2) to zero at back (z=d/2)
  const hw = w / 2, hd = d / 2;
  const lines: string[] = [];
  // Bottom face
  lines.push(`4 16 ${-hw} ${h} ${-hd} ${hw} ${h} ${-hd} ${hw} ${h} ${hd} ${-hw} ${h} ${hd}`);
  // Front face (full height)
  lines.push(`4 16 ${-hw} 0 ${-hd} ${hw} 0 ${-hd} ${hw} ${h} ${-hd} ${-hw} ${h} ${-hd}`);
  // Left triangle
  lines.push(`3 16 ${-hw} 0 ${-hd} ${-hw} ${h} ${-hd} ${-hw} ${h} ${hd}`);
  // Right triangle
  lines.push(`3 16 ${hw} 0 ${-hd} ${hw} ${h} ${hd} ${hw} ${h} ${-hd}`);
  // Slope face (top angled)
  lines.push(`4 16 ${-hw} 0 ${-hd} ${-hw} ${h} ${hd} ${hw} ${h} ${hd} ${hw} 0 ${-hd}`);
  // Back face (plate height only)
  lines.push(`4 16 ${-hw} ${h} ${hd} ${-hw} ${h} ${hd} ${hw} ${h} ${hd} ${hw} ${h} ${hd}`);
  // Edge lines
  lines.push(`2 24 ${-hw} 0 ${-hd} ${hw} 0 ${-hd}`);
  lines.push(`2 24 ${-hw} 0 ${-hd} ${-hw} ${h} ${-hd}`);
  lines.push(`2 24 ${hw} 0 ${-hd} ${hw} ${h} ${-hd}`);
  lines.push(`2 24 ${-hw} 0 ${-hd} ${-hw} ${h} ${hd}`);
  lines.push(`2 24 ${hw} 0 ${-hd} ${hw} ${h} ${hd}`);
  return lines.join('\n');
}

// ── Generate inline part definition ──

function generatePartGeometry(part: PartDef): string {
  const lines: string[] = [];
  lines.push(`0 FILE ${part.file}`);
  lines.push(`0 ${part.name}`);
  lines.push(`0 Name: ${part.file}`);
  lines.push(`0 Author: BrickBot`);
  lines.push(`0 !LDRAW_ORG Unofficial_Part`);
  lines.push(`0 BFC CERTIFY CCW`);
  lines.push('');

  const hw = part.width / 2;
  const hd = part.depth / 2;

  if (part.isSlope) {
    lines.push(generateSlopeGeometry(part.width, part.height, part.depth));
  } else {
    // Main box body (top at y=0, bottom at y=height)
    lines.push(generateBox(-hw, 0, -hd, hw, part.height, hd));
  }

  // Studs on top (y = -4 to y = 0)
  for (let sz = 0; sz < part.studsZ; sz++) {
    for (let sx = 0; sx < part.studsX; sx++) {
      const cx = -hw + 10 + sx * 20;
      const cz = -hd + 10 + sz * 20;
      lines.push(generateCylinder(cx, -4, cz, 6, 4, 16));
    }
  }

  lines.push('');
  lines.push('0 NOFILE');
  return lines.join('\n');
}

// ── Color definitions (minimal LDConfig) ──
const LDCONFIG = `0 FILE LDConfig.ldr
0 LDraw Colour Definitions (BrickBot Minimal)
0 !COLOUR Black            CODE   0 VALUE #05131D EDGE #595959
0 !COLOUR Blue             CODE   1 VALUE #0055BF EDGE #333333
0 !COLOUR Green            CODE   2 VALUE #237841 EDGE #184632
0 !COLOUR Red              CODE   4 VALUE #C91A09 EDGE #8B1208
0 !COLOUR Purple           CODE   5 VALUE #8320B7 EDGE #5F1E83
0 !COLOUR Brown            CODE   6 VALUE #583927 EDGE #31261A
0 !COLOUR Pink             CODE  13 VALUE #FCB4D0 EDGE #D39AAF
0 !COLOUR Yellow           CODE  14 VALUE #F2CD37 EDGE #C4A22A
0 !COLOUR White            CODE  15 VALUE #FFFFFF EDGE #B4B4B4
0 !COLOUR Light_Green      CODE  17 VALUE #BDC618 EDGE #99A215
0 !COLOUR Tan              CODE  19 VALUE #DEC69C EDGE #B49F7C
0 !COLOUR Orange           CODE  25 VALUE #FE8A18 EDGE #CF7115
0 !COLOUR Lime             CODE  27 VALUE #BDC618 EDGE #99A215
0 !COLOUR Light_Bluish_Gray CODE 71 VALUE #A0A5A9 EDGE #767B7E
0 !COLOUR Dark_Bluish_Gray  CODE 72 VALUE #6C6E68 EDGE #4B4D49
0 NOFILE`;

// ── Public API ──

/**
 * Generate a properly formatted LDraw .ldr file from model data.
 * Compatible with LeoCad, LDCad, Bricksmith, and any LDraw viewer.
 */
export function generateLDrawFile(
  name: string,
  steps: Array<{ stepNumber: number; description: string; bricks: Array<{ color: number; x: number; y: number; z: number; part: string }> }>,
): string {
  const lines: string[] = [];
  lines.push(`0 FILE ${sanitizeFilename(name)}.ldr`);
  lines.push(`0 ${name}`);
  lines.push(`0 Name: ${sanitizeFilename(name)}.ldr`);
  lines.push(`0 Author: BrickBot AI`);
  lines.push(`0 !CATEGORY Model`);
  lines.push('');

  for (const step of steps) {
    lines.push('0 STEP');
    lines.push(`0 // Step ${step.stepNumber}: ${step.description}`);
    if (step.bricks && Array.isArray(step.bricks)) {
      for (const b of step.bricks) {
        const partFile = b.part.endsWith('.dat') ? b.part : `${b.part}.dat`;
        lines.push(`1 ${b.color} ${b.x} ${b.y} ${b.z} 1 0 0 0 1 0 0 0 1 ${partFile}`);
      }
    }
  }

  lines.push('');
  lines.push('0 NOFILE');
  return lines.join('\n');
}

/**
 * Generate a packed MPD file with inline part geometry.
 * This is a self-contained file that doesn't need an external parts library.
 * Can be imported into Mecabricks, LeoCad, LDCad, etc.
 */
export function generatePackedMPD(
  name: string,
  ldrawContent: string,
): string {
  // Find all referenced parts
  const usedParts = new Set<string>();
  const lines = ldrawContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('1 ')) {
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 15) {
        const partFile = parts[14].replace('.dat', '');
        if (PARTS[partFile]) {
          usedParts.add(partFile);
        }
      }
    }
  }

  // Build packed MPD
  const mpd: string[] = [];

  // Main model
  mpd.push(ldrawContent);
  mpd.push('');

  // Color definitions
  mpd.push(LDCONFIG);
  mpd.push('');

  // Inline part geometry for all referenced parts
  for (const partId of Array.from(usedParts)) {
    const part = PARTS[partId];
    if (part) {
      mpd.push(generatePartGeometry(part));
      mpd.push('');
    }
  }

  return mpd.join('\n');
}

/**
 * Get part dimensions for a given part ID
 */
export function getPartDimensions(partId: string): PartDef | undefined {
  const id = partId.replace('.dat', '');
  return PARTS[id];
}

/**
 * Generate a Mecabricks-compatible import URL
 * Mecabricks can import .ldr files directly
 */
export function getMecabricksImportInfo(): { url: string; instructions: string } {
  return {
    url: 'https://www.mecabricks.com/en/workshop',
    instructions: 'Descarga el archivo .ldr y en Mecabricks ve a File > Import para cargar tu modelo.',
  };
}

/**
 * Generate LeoCad launch info
 */
export function getLeoCadInfo(): { downloadUrl: string; instructions: string } {
  return {
    downloadUrl: 'https://www.leocad.org/download.html',
    instructions: 'Descarga LeoCad gratis, luego abre el archivo .ldr para editar tu modelo con piezas LEGO reales.',
  };
}

/**
 * Generate LDCad launch info
 */
export function getLDCadInfo(): { downloadUrl: string; instructions: string } {
  return {
    downloadUrl: 'http://www.melkert.net/LDCad',
    instructions: 'Descarga LDCad gratis, luego abre el archivo .ldr para editar con herramientas avanzadas de diseño.',
  };
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
}
