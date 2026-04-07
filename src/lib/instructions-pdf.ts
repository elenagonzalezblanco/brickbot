// ── LEGO-style Instruction Booklet PDF Generator ──
// Generates a downloadable PDF with cover page, parts inventory,
// and step-by-step building instructions with isometric diagrams.
// jsPDF is dynamically imported to avoid bloating the main bundle.

import type { LegoModel, BuildStep, LegoPart } from '@/types';

// ── Color mapping ──
const COLOR_MAP: Record<number, { hex: string; name: string }> = {
  0:  { hex: '#05131D', name: 'Black' },
  1:  { hex: '#0055BF', name: 'Blue' },
  2:  { hex: '#237841', name: 'Green' },
  4:  { hex: '#C91A09', name: 'Red' },
  5:  { hex: '#8320B7', name: 'Purple' },
  6:  { hex: '#583927', name: 'Brown' },
  13: { hex: '#FCB4D0', name: 'Pink' },
  14: { hex: '#F2CD37', name: 'Yellow' },
  15: { hex: '#FFFFFF', name: 'White' },
  19: { hex: '#DEC69C', name: 'Tan' },
  25: { hex: '#FE8A18', name: 'Orange' },
  27: { hex: '#BDC618', name: 'Lime' },
  71: { hex: '#A0A5A9', name: 'Light Gray' },
  72: { hex: '#6C6E68', name: 'Dark Gray' },
};

// ── Brick parsed from LDraw ──
interface ParsedBrick {
  colorId: number;
  x: number;
  y: number;
  z: number;
  partFile: string;
  width: number;   // LDU
  height: number;  // LDU
  depth: number;   // LDU
  step: number;
}

// Part name mapping
const PART_NAMES: Record<string, string> = {
  '3001': 'Brick 2×4',
  '3003': 'Brick 2×2',
  '3004': 'Brick 1×2',
  '3010': 'Brick 1×4',
  '3622': 'Brick 1×3',
  '3009': 'Brick 1×6',
  '3005': 'Brick 1×1',
  '3020': 'Plate 2×4',
  '3022': 'Plate 2×2',
  '3023': 'Plate 1×2',
  '3024': 'Plate 1×1',
  '3039': 'Slope 2×2',
  '3040': 'Slope 1×2',
};

function parseLDraw(ldrawContent: string): ParsedBrick[] {
  const bricks: ParsedBrick[] = [];
  let stepCount = 0;

  for (const line of ldrawContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '0 STEP') { stepCount++; continue; }
    if (!trimmed.startsWith('1 ')) continue;

    const parts = trimmed.split(/\s+/);
    if (parts.length < 15) continue;

    const colorId = parseInt(parts[1]);
    const x = parseFloat(parts[2]);
    const y = parseFloat(parts[3]);
    const z = parseFloat(parts[4]);
    const partFile = parts[14];

    let width = 40, height = 24, depth = 20;
    if (partFile.includes('3001')) { width = 80; depth = 40; }
    else if (partFile.includes('3003')) { width = 40; depth = 40; }
    else if (partFile.includes('3004')) { width = 40; depth = 20; }
    else if (partFile.includes('3010')) { width = 80; depth = 20; }
    else if (partFile.includes('3622')) { width = 60; depth = 20; }
    else if (partFile.includes('3009')) { width = 120; depth = 20; }
    else if (partFile.includes('3005')) { width = 20; depth = 20; }
    else if (partFile.includes('3020')) { width = 80; depth = 40; height = 8; }
    else if (partFile.includes('3022')) { width = 40; depth = 40; height = 8; }
    else if (partFile.includes('3023')) { width = 40; depth = 20; height = 8; }
    else if (partFile.includes('3024')) { width = 20; depth = 20; height = 8; }
    else if (partFile.includes('3039')) { width = 40; depth = 40; height = 24; }
    else if (partFile.includes('3040')) { width = 40; depth = 20; height = 24; }

    bricks.push({ colorId, x, y, z, partFile, width, height, depth, step: stepCount });
  }

  return bricks;
}

// ── Isometric projection helpers ──
// Isometric: x_screen = (x - z) * cos(30°), y_screen = -(y) + (x + z) * sin(30°)
const ISO_ANGLE = Math.PI / 6; // 30 degrees
const COS30 = Math.cos(ISO_ANGLE);
const SIN30 = Math.sin(ISO_ANGLE);

function isoProject(x: number, y: number, z: number): { sx: number; sy: number } {
  return {
    sx: (x - z) * COS30,
    sy: (x + z) * SIN30 - y,
  };
}

// ── Draw isometric brick on a canvas 2D context ──
function drawIsoBrick(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, z: number,
  w: number, h: number, d: number,
  color: string,
  highlight: boolean,
  offsetX: number, offsetY: number,
  scale: number,
) {
  // 8 corners of the box (simplified isometric projection)
  const corners = [
    isoProject(x,       -y,       z),       // 0: front-bottom-left
    isoProject(x + w,   -y,       z),       // 1: front-bottom-right
    isoProject(x + w,   -y,       z + d),   // 2: back-bottom-right
    isoProject(x,       -y,       z + d),   // 3: back-bottom-left
    isoProject(x,       -y - h,   z),       // 4: front-top-left
    isoProject(x + w,   -y - h,   z),       // 5: front-top-right
    isoProject(x + w,   -y - h,   z + d),   // 6: back-top-right
    isoProject(x,       -y - h,   z + d),   // 7: back-top-left
  ];

  const sx = (c: typeof corners[0]) => c.sx * scale + offsetX;
  const sy = (c: typeof corners[0]) => c.sy * scale + offsetY;

  // Parse color for shading
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  const darken = (factor: number) =>
    `rgb(${Math.round(r * factor)},${Math.round(g * factor)},${Math.round(b * factor)})`;

  // Top face (brightest)
  ctx.beginPath();
  ctx.moveTo(sx(corners[4]), sy(corners[4]));
  ctx.lineTo(sx(corners[5]), sy(corners[5]));
  ctx.lineTo(sx(corners[6]), sy(corners[6]));
  ctx.lineTo(sx(corners[7]), sy(corners[7]));
  ctx.closePath();
  ctx.fillStyle = highlight ? color : darken(0.95);
  ctx.fill();
  ctx.strokeStyle = darken(0.7);
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Front face (medium)
  ctx.beginPath();
  ctx.moveTo(sx(corners[0]), sy(corners[0]));
  ctx.lineTo(sx(corners[1]), sy(corners[1]));
  ctx.lineTo(sx(corners[5]), sy(corners[5]));
  ctx.lineTo(sx(corners[4]), sy(corners[4]));
  ctx.closePath();
  ctx.fillStyle = highlight ? darken(0.9) : darken(0.8);
  ctx.fill();
  ctx.strokeStyle = darken(0.6);
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Right face (darkest)
  ctx.beginPath();
  ctx.moveTo(sx(corners[1]), sy(corners[1]));
  ctx.lineTo(sx(corners[2]), sy(corners[2]));
  ctx.lineTo(sx(corners[6]), sy(corners[6]));
  ctx.lineTo(sx(corners[5]), sy(corners[5]));
  ctx.closePath();
  ctx.fillStyle = highlight ? darken(0.85) : darken(0.65);
  ctx.fill();
  ctx.strokeStyle = darken(0.5);
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Draw stud circles on top face
  const studCols = Math.max(1, Math.round(w / 20));
  const studRows = Math.max(1, Math.round(d / 20));
  for (let sr = 0; sr < studRows; sr++) {
    for (let sc = 0; sc < studCols; sc++) {
      const studX = x + 10 + sc * 20;
      const studZ = z + 10 + sr * 20;
      const studY = -y - h;
      const center = isoProject(studX, studY, studZ);
      ctx.beginPath();
      ctx.arc(center.sx * scale + offsetX, center.sy * scale + offsetY, 2.5 * scale, 0, Math.PI * 2);
      ctx.fillStyle = highlight ? `rgba(255,255,255,0.3)` : `rgba(255,255,255,0.15)`;
      ctx.fill();
      ctx.strokeStyle = darken(0.6);
      ctx.lineWidth = 0.3;
      ctx.stroke();
    }
  }

  // Highlight border for new bricks
  if (highlight) {
    ctx.strokeStyle = '#FF4444';
    ctx.lineWidth = 1.5;
    // Top outline
    ctx.beginPath();
    ctx.moveTo(sx(corners[4]), sy(corners[4]));
    ctx.lineTo(sx(corners[5]), sy(corners[5]));
    ctx.lineTo(sx(corners[6]), sy(corners[6]));
    ctx.lineTo(sx(corners[7]), sy(corners[7]));
    ctx.closePath();
    ctx.stroke();
  }
}

// ── Render a step diagram to a canvas, return as data URL ──
function renderStepDiagram(
  bricks: ParsedBrick[],
  upToStep: number,
  canvasWidth: number,
  canvasHeight: number,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#F8F9FA';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Filter bricks up to this step
  const visible = bricks.filter(b => b.step <= upToStep);
  if (visible.length === 0) return canvas.toDataURL('image/png');

  // Compute bounding box in screen space
  let minSx = Infinity, maxSx = -Infinity;
  let minSy = Infinity, maxSy = -Infinity;
  for (const b of visible) {
    // Check all 8 corners of each brick
    for (const dx of [0, b.width]) {
      for (const dy of [0, b.height]) {
        for (const dz of [0, b.depth]) {
          const p = isoProject(b.x + dx, -b.y - dy, b.z + dz);
          minSx = Math.min(minSx, p.sx);
          maxSx = Math.max(maxSx, p.sx);
          minSy = Math.min(minSy, p.sy);
          maxSy = Math.max(maxSy, p.sy);
        }
      }
    }
  }

  const bboxW = maxSx - minSx;
  const bboxH = maxSy - minSy;
  const margin = 30;
  const scale = Math.min(
    (canvasWidth - margin * 2) / (bboxW || 1),
    (canvasHeight - margin * 2) / (bboxH || 1),
  );
  const offsetX = canvasWidth / 2 - (minSx + bboxW / 2) * scale;
  const offsetY = canvasHeight / 2 - (minSy + bboxH / 2) * scale;

  // Sort bricks by depth (painter's algorithm): far to near, bottom to top
  const sorted = [...visible].sort((a, b2) => {
    const depthA = a.z + a.x - a.y;
    const depthB = b2.z + b2.x - b2.y;
    return depthA - depthB;
  });

  // Draw bricks
  for (const b of sorted) {
    const color = COLOR_MAP[b.colorId]?.hex || '#999999';
    const isNew = b.step === upToStep;
    drawIsoBrick(ctx, b.x, b.y, b.z, b.width, b.height, b.depth, color, isNew, offsetX, offsetY, scale);
  }

  return canvas.toDataURL('image/png');
}

// ── Small brick diagram for parts inventory ──
function renderBrickIcon(
  partFile: string,
  colorHex: string,
  size: number,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  let w = 40, h = 24, d = 20;
  if (partFile.includes('3001')) { w = 80; d = 40; }
  else if (partFile.includes('3003')) { w = 40; d = 40; }
  else if (partFile.includes('3010')) { w = 80; d = 20; }
  else if (partFile.includes('3020')) { w = 80; d = 40; h = 8; }
  else if (partFile.includes('3022')) { w = 40; d = 40; h = 8; }
  else if (partFile.includes('3039')) { w = 40; d = 40; }

  const p = isoProject(0, 0, 0);
  const p2 = isoProject(w, -h, d);
  const bboxW = Math.abs(p2.sx - p.sx) + w * 0.5;
  const bboxH = Math.abs(p2.sy - p.sy) + h * 0.5;
  const scale = Math.min((size - 8) / bboxW, (size - 8) / bboxH);

  drawIsoBrick(ctx, 0, 0, 0, w, h, d, `#${colorHex}`, false, size / 2 - w * COS30 * scale * 0.3, size / 2 + h * scale * 0.3, scale);

  return canvas.toDataURL('image/png');
}

// ── Main: Generate PDF Instruction Booklet ──
export async function generateInstructionsPDF(model: LegoModel): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = 210; // A4 width mm
  const ph = 297; // A4 height mm

  const bricks = parseLDraw(model.ldrawContent);
  const totalSteps = model.steps.length;

  // ═══════════════════════════════════════════
  // PAGE 1: COVER
  // ═══════════════════════════════════════════
  // Background
  pdf.setFillColor(245, 245, 250);
  pdf.rect(0, 0, pw, ph, 'F');

  // Red header bar (LEGO-style)
  pdf.setFillColor(201, 26, 9);
  pdf.rect(0, 0, pw, 55, 'F');

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.text('INSTRUCCIONES DE CONSTRUCCIÓN', pw / 2, 18, { align: 'center' });
  pdf.setFontSize(24);
  pdf.text(model.name, pw / 2, 35, { align: 'center' });
  pdf.setFontSize(10);
  pdf.text('BrickBot — Generado automáticamente', pw / 2, 47, { align: 'center' });

  // Cover model diagram (large)
  if (bricks.length > 0) {
    const coverImg = renderStepDiagram(bricks, totalSteps, 800, 600);
    pdf.addImage(coverImg, 'PNG', 20, 65, 170, 127.5);
  }

  // Model info box
  const infoY = 200;
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(25, infoY, pw - 50, 55, 4, 4, 'F');
  pdf.setDrawColor(220, 220, 220);
  pdf.roundedRect(25, infoY, pw - 50, 55, 4, 4, 'S');

  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(9);
  pdf.text('MODELO', 40, infoY + 12);
  pdf.text('PIEZAS', 105, infoY + 12);
  pdf.text('PASOS', 155, infoY + 12);

  pdf.setTextColor(30, 30, 30);
  pdf.setFontSize(14);
  pdf.text(model.name, 40, infoY + 24);
  pdf.text(String(model.totalParts), 105, infoY + 24);
  pdf.text(String(totalSteps), 155, infoY + 24);

  pdf.setTextColor(120, 120, 120);
  pdf.setFontSize(9);
  const descLines = pdf.splitTextToSize(model.description, 130);
  pdf.text(descLines, 40, infoY + 38);

  // Footer
  pdf.setTextColor(170, 170, 170);
  pdf.setFontSize(7);
  pdf.text('Generado por BrickBot · brickbot-app.azurewebsites.net', pw / 2, ph - 10, { align: 'center' });

  // ═══════════════════════════════════════════
  // PAGE 2: PARTS INVENTORY
  // ═══════════════════════════════════════════
  pdf.addPage();
  pdf.setFillColor(245, 245, 250);
  pdf.rect(0, 0, pw, ph, 'F');

  // Header
  pdf.setFillColor(201, 26, 9);
  pdf.rect(0, 0, pw, 20, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text('INVENTARIO DE PIEZAS', pw / 2, 14, { align: 'center' });

  // Parts grid
  const cols = 3;
  const cellW = (pw - 30) / cols;
  const cellH = 30;
  let px = 15, py = 30;

  for (let i = 0; i < model.partsList.length; i++) {
    const part = model.partsList[i];

    if (py + cellH > ph - 20) {
      pdf.addPage();
      pdf.setFillColor(245, 245, 250);
      pdf.rect(0, 0, pw, ph, 'F');
      pdf.setFillColor(201, 26, 9);
      pdf.rect(0, 0, pw, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.text('INVENTARIO DE PIEZAS (cont.)', pw / 2, 14, { align: 'center' });
      py = 30;
    }

    // Part card
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(px, py, cellW - 5, cellH - 3, 2, 2, 'F');
    pdf.setDrawColor(230, 230, 230);
    pdf.roundedRect(px, py, cellW - 5, cellH - 3, 2, 2, 'S');

    // Brick icon
    try {
      const icon = renderBrickIcon(part.partNum, part.colorHex, 80);
      pdf.addImage(icon, 'PNG', px + 2, py + 2, 12, 12);
    } catch { /* skip icon on error */ }

    // Color swatch
    const r = parseInt(part.colorHex.slice(0, 2), 16);
    const g = parseInt(part.colorHex.slice(2, 4), 16);
    const b = parseInt(part.colorHex.slice(4, 6), 16);
    pdf.setFillColor(r, g, b);
    pdf.circle(px + 8, py + 22, 3, 'F');
    if (part.colorHex.toUpperCase() === 'FFFFFF') {
      pdf.setDrawColor(200, 200, 200);
      pdf.circle(px + 8, py + 22, 3, 'S');
    }

    // Part info
    pdf.setTextColor(30, 30, 30);
    pdf.setFontSize(8);
    const partName = PART_NAMES[part.partNum] || part.name;
    pdf.text(partName, px + 16, py + 8);

    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(7);
    pdf.text(part.colorName, px + 16, py + 14);
    pdf.text(`#${part.partNum}`, px + 16, py + 20);

    // Quantity badge
    pdf.setFillColor(201, 26, 9);
    pdf.roundedRect(px + cellW - 22, py + 3, 14, 9, 2, 2, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.text(`×${part.quantity}`, px + cellW - 15, py + 9.5, { align: 'center' });

    px += cellW;
    if ((i + 1) % cols === 0) {
      px = 15;
      py += cellH;
    }
  }

  // ═══════════════════════════════════════════
  // STEP PAGES
  // ═══════════════════════════════════════════
  for (let stepIdx = 0; stepIdx < totalSteps; stepIdx++) {
    pdf.addPage();
    const step = model.steps[stepIdx];

    // Background
    pdf.setFillColor(245, 245, 250);
    pdf.rect(0, 0, pw, ph, 'F');

    // Header bar with step number
    pdf.setFillColor(201, 26, 9);
    pdf.rect(0, 0, pw, 20, 'F');

    // Step circle
    pdf.setFillColor(255, 255, 255);
    pdf.circle(pw / 2, 10, 10, 'F');
    pdf.setTextColor(201, 26, 9);
    pdf.setFontSize(14);
    pdf.text(String(stepIdx + 1), pw / 2, 14, { align: 'center' });

    // "Step X of Y"
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.text(`PASO ${stepIdx + 1} DE ${totalSteps}`, 15, 14);
    pdf.text(model.name, pw - 15, 14, { align: 'right' });

    // Step description
    pdf.setTextColor(60, 60, 60);
    pdf.setFontSize(11);
    const descText = step.description || `Paso ${stepIdx + 1}`;
    pdf.text(descText, pw / 2, 30, { align: 'center' });

    // Render isometric diagram for this step
    const diagramImg = renderStepDiagram(bricks, stepIdx + 1, 900, 650);
    pdf.addImage(diagramImg, 'PNG', 10, 36, 190, 137);

    // Parts needed for this step — callout box at bottom
    const boxY = 180;
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(10, boxY, pw - 20, 100, 4, 4, 'F');
    pdf.setDrawColor(220, 220, 220);
    pdf.roundedRect(10, boxY, pw - 20, 100, 4, 4, 'S');

    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(8);
    pdf.text('PIEZAS PARA ESTE PASO', 18, boxY + 9);

    // Draw the new bricks added in this step
    const stepBricks = bricks.filter(b => b.step === stepIdx + 1);
    // Count pieces by type+color
    const pieceCounts: Record<string, { partFile: string; colorId: number; count: number }> = {};
    for (const sb of stepBricks) {
      const key = `${sb.partFile}:${sb.colorId}`;
      if (!pieceCounts[key]) pieceCounts[key] = { partFile: sb.partFile, colorId: sb.colorId, count: 0 };
      pieceCounts[key].count++;
    }

    let bpx = 18, bpy = boxY + 16;
    const entries = Object.values(pieceCounts);
    for (let ei = 0; ei < entries.length; ei++) {
      const entry = entries[ei];
      if (bpx + 35 > pw - 15) { bpx = 18; bpy += 28; }
      if (bpy + 24 > boxY + 96) break; // don't overflow

      // Brick icon
      const colorInfo = COLOR_MAP[entry.colorId];
      const hex = colorInfo?.hex.slice(1) || '999999';
      try {
        const icon = renderBrickIcon(entry.partFile, hex, 80);
        pdf.addImage(icon, 'PNG', bpx, bpy, 14, 14);
      } catch { /* skip */ }

      // Quantity
      pdf.setFillColor(201, 26, 9);
      pdf.roundedRect(bpx + 15, bpy, 12, 7, 1.5, 1.5, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7);
      pdf.text(`×${entry.count}`, bpx + 21, bpy + 5, { align: 'center' });

      // Part name below
      const partNumMatch = entry.partFile.match(/(\d+)/);
      const partNum = partNumMatch ? partNumMatch[1] : '';
      const name = PART_NAMES[partNum] || partNum;
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(6);
      pdf.text(name, bpx + 7, bpy + 20, { align: 'center' });

      bpx += 35;
    }

    // Also show a small 'new pieces only' diagram (just the pieces added in this step)
    if (stepBricks.length > 0 && stepBricks.length < 30) {
      // Render just the new pieces in a small inset
      const newOnlyImg = renderNewPiecesOnly(stepBricks, 200, 150);
      pdf.addImage(newOnlyImg, 'PNG', pw - 60, boxY + 10, 42, 31);
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(6);
      pdf.text('Piezas nuevas', pw - 39, boxY + 45, { align: 'center' });
    }

    // Progress bar at bottom
    const barY = ph - 12;
    pdf.setFillColor(230, 230, 230);
    pdf.roundedRect(15, barY, pw - 30, 3, 1.5, 1.5, 'F');
    const progress = (stepIdx + 1) / totalSteps;
    pdf.setFillColor(201, 26, 9);
    pdf.roundedRect(15, barY, (pw - 30) * progress, 3, 1.5, 1.5, 'F');

    // Footer
    pdf.setTextColor(170, 170, 170);
    pdf.setFontSize(7);
    pdf.text(`${stepIdx + 1} / ${totalSteps}`, pw / 2, ph - 5, { align: 'center' });
  }

  // ═══════════════════════════════════════════
  // FINAL PAGE: Completed model
  // ═══════════════════════════════════════════
  pdf.addPage();
  pdf.setFillColor(245, 245, 250);
  pdf.rect(0, 0, pw, ph, 'F');

  // Green header
  pdf.setFillColor(35, 120, 65);
  pdf.rect(0, 0, pw, 40, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.text('¡MODELO COMPLETADO!', pw / 2, 25, { align: 'center' });

  // Final model diagram
  const finalImg = renderStepDiagram(bricks, totalSteps, 900, 700);
  pdf.addImage(finalImg, 'PNG', 15, 50, 180, 140);

  // Stats
  pdf.setTextColor(60, 60, 60);
  pdf.setFontSize(14);
  pdf.text(model.name, pw / 2, 205, { align: 'center' });

  pdf.setTextColor(120, 120, 120);
  pdf.setFontSize(10);
  pdf.text(`${model.totalParts} piezas · ${totalSteps} pasos`, pw / 2, 215, { align: 'center' });

  pdf.setFontSize(9);
  pdf.text('¡Felicidades! Has terminado tu modelo LEGO.', pw / 2, 230, { align: 'center' });
  pdf.text('Comparte tu creación con #BrickBot', pw / 2, 238, { align: 'center' });

  // BrickBot credits
  pdf.setTextColor(170, 170, 170);
  pdf.setFontSize(7);
  pdf.text('Diseñado con BrickBot — IA generativa para LEGO', pw / 2, ph - 15, { align: 'center' });
  pdf.text('brickbot-app.azurewebsites.net', pw / 2, ph - 10, { align: 'center' });

  // Save
  const filename = model.name.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑüÜ\s-]/g, '').replace(/\s+/g, '_') || 'instrucciones';
  pdf.save(`${filename}_instrucciones.pdf`);
}

// ── Helper: Render only new pieces (isolated) ──
function renderNewPiecesOnly(bricks: ParsedBrick[], w: number, h: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, h);

  // Shift all bricks so they start at origin
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  for (const b of bricks) {
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    minZ = Math.min(minZ, b.z);
  }

  const shifted = bricks.map(b => ({ ...b, x: b.x - minX, y: b.y - minY, z: b.z - minZ }));

  let minSx = Infinity, maxSx = -Infinity, minSy = Infinity, maxSy = -Infinity;
  for (const b of shifted) {
    for (const dx of [0, b.width]) {
      for (const dy of [0, b.height]) {
        for (const dz of [0, b.depth]) {
          const p = isoProject(b.x + dx, -b.y - dy, b.z + dz);
          minSx = Math.min(minSx, p.sx); maxSx = Math.max(maxSx, p.sx);
          minSy = Math.min(minSy, p.sy); maxSy = Math.max(maxSy, p.sy);
        }
      }
    }
  }

  const bboxW = maxSx - minSx || 1;
  const bboxH = maxSy - minSy || 1;
  const scale = Math.min((w - 10) / bboxW, (h - 10) / bboxH);
  const offsetX = w / 2 - (minSx + bboxW / 2) * scale;
  const offsetY = h / 2 - (minSy + bboxH / 2) * scale;

  const sorted = [...shifted].sort((a, b2) => (a.z + a.x - a.y) - (b2.z + b2.x - b2.y));

  for (const b of sorted) {
    const color = COLOR_MAP[b.colorId]?.hex || '#999999';
    drawIsoBrick(ctx, b.x, b.y, b.z, b.width, b.height, b.depth, color, true, offsetX, offsetY, scale);
  }

  return canvas.toDataURL('image/png');
}
