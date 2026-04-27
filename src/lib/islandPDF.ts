"use client";

import { WeekPlan, ISLANDS, EXTRA_SECTIONS, IslandSlot, SLOT_FLAGS } from "@/types/island";

function getFlagShort(flag: string): string {
  return SLOT_FLAGS.find(f => f.value === flag)?.short ?? flag.toUpperCase();
}

function isHighlighted(item: IslandSlot): boolean {
  return item.flags.length > 0;
}

export async function generateIslandPDF(plan: WeekPlan): Promise<Blob> {
  const { jsPDF } = await import("jspdf");

  // Landscape letter — matches the style in reference image
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "letter" });

  const PAGE_W = 279.4;
  const PAGE_H = 215.9;
  const MARGIN = 8;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  // Soft yellow used for highlighted cells (coupon, bogo, etc.)
  const YELLOW: [number, number, number] = [255, 252, 150];
  const GRAY_HEADER: [number, number, number] = [200, 200, 200];
  const GRAY_SECTION: [number, number, number] = [230, 230, 230];
  const BLUE_ENDCAP: [number, number, number] = [218, 232, 252];

  const LABEL_H = 5.5;   // height of a cell's label bar
  const LINE_H  = 4.2;   // vertical space per item
  const ROW_H   = 3.8;   // vertical space per island row line
  const SECTION_H = 6;   // island column header height
  const MIN_CELL_H = 12; // minimum height for endcap cells

  // ── Helpers ───────────────────────────────────────────────────────────────

  const sf = (r: number, g: number, b: number) => doc.setFillColor(r, g, b);
  const sd = (r: number, g: number, b: number) => doc.setDrawColor(r, g, b);
  const st = (r: number, g: number, b: number) => doc.setTextColor(r, g, b);

  // Draw a bordered labeled cell with items listed inside
  const drawCell = (
    x: number, y: number, w: number, h: number,
    label: string,
    items: IslandSlot[],
    labelBg: [number, number, number] = GRAY_SECTION,
    cellBg: [number, number, number] = [255, 255, 255],
  ) => {
    // Cell fill
    sf(...cellBg); doc.rect(x, y, w, h, "F");
    // Label bar
    sf(...labelBg); doc.rect(x, y, w, LABEL_H, "F");
    // Outer border
    sd(0, 0, 0); doc.setLineWidth(0.4);
    doc.rect(x, y, w, h);
    // Label text
    doc.setFont("helvetica", "bold"); doc.setFontSize(6);
    st(0, 0, 0);
    doc.text(label, x + w / 2, y + LABEL_H - 1.3, { align: "center", maxWidth: w - 2 });

    let iy = y + LABEL_H + 2;
    items.forEach(item => {
      const hi = isHighlighted(item);
      if (hi) {
        sf(...YELLOW);
        doc.rect(x + 0.5, iy - 2.8, w - 1, LINE_H, "F");
      }
      doc.setFont("helvetica", hi ? "bold" : "normal");
      doc.setFontSize(5.5); st(0, 0, 0);
      // Product name (with price inline if present)
      const label2 = item.productName
        + (item.price ? `  ${item.price}` : "")
        + (item.flags.length ? `  [${item.flags.map(getFlagShort).join("/")}]` : "");
      doc.text(label2 || "—", x + 1.5, iy, { maxWidth: w - 3 });
      if (item.notes) {
        doc.setFont("helvetica", "italic"); doc.setFontSize(5); st(80, 80, 80);
        doc.text(item.notes, x + 1.5, iy + 3, { maxWidth: w - 3 });
        iy += 3;
      }
      iy += LINE_H;
    });
  };

  // ── Page background ───────────────────────────────────────────────────────
  sf(255, 255, 255);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // ── Header ────────────────────────────────────────────────────────────────
  const HEADER_H = 14;

  // Title
  doc.setFont("helvetica", "bold"); doc.setFontSize(13); st(0, 0, 0);
  doc.text("ISLAND PLAN", MARGIN, 9);

  // Week label in yellow box (top-right, matches image style)
  const boxW = 44;
  sf(...YELLOW); sd(0, 0, 0); doc.setLineWidth(0.5);
  doc.rect(PAGE_W - MARGIN - boxW, 2, boxW, 9, "FD");
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); st(0, 0, 0);
  doc.text(plan.weekLabel, PAGE_W - MARGIN - boxW / 2, 7.8, { align: "center" });

  // Small generated date
  doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); st(100, 100, 100);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
    MARGIN, HEADER_H - 1,
  );

  // Header rule
  sd(0, 0, 0); doc.setLineWidth(0.7);
  doc.line(MARGIN, HEADER_H, PAGE_W - MARGIN, HEADER_H);

  // ── Body layout ───────────────────────────────────────────────────────────
  const BODY_TOP = HEADER_H + 3;
  const hasExtras = EXTRA_SECTIONS.some(s => (plan.extras[s.id] || []).length > 0);
  const COL_COUNT = hasExtras ? 4 : 3;
  const COL_GAP = 2.5;
  const COL_W = (CONTENT_W - COL_GAP * (COL_COUNT - 1)) / COL_COUNT;

  // ── Islands ───────────────────────────────────────────────────────────────
  ISLANDS.forEach((island, idx) => {
    const x = MARGIN + idx * (COL_W + COL_GAP);
    let y = BODY_TOP;

    // Island column header (dark gray, white text)
    sf(70, 70, 70); sd(0, 0, 0); doc.setLineWidth(0.5);
    doc.rect(x, y, COL_W, SECTION_H, "FD");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); st(255, 255, 255);
    doc.text(island.label.toUpperCase(), x + COL_W / 2, y + SECTION_H - 1.5, { align: "center" });
    y += SECTION_H + 2;

    // Top endcap cell
    const topItems = plan.endcaps[island.topEndcap] || [];
    const topBg: [number, number, number] = topItems.some(isHighlighted) ? YELLOW : BLUE_ENDCAP;
    const topH = Math.max(MIN_CELL_H, LABEL_H + topItems.length * LINE_H + topItems.filter(i => i.notes).length * 3 + 3);
    drawCell(x, y, COL_W, topH, `ENDCAP ${island.topEndcap}`, topItems, topBg);
    y += topH + 2;

    // Rows section
    const filledRows: { row: number; left: IslandSlot | null; right: IslandSlot | null }[] = [];
    for (let r = 0; r < island.rows; r++) {
      const left  = plan.slots[`${island.id}-${r}-L`] || null;
      const right = plan.slots[`${island.id}-${r}-R`] || null;
      if (left || right) filledRows.push({ row: r, left, right });
    }

    if (filledRows.length > 0) {
      const rowsH = LABEL_H + filledRows.length * ROW_H + 2;
      const ROW_NUM_W = 7;
      const HALF_W = (COL_W - ROW_NUM_W) / 2;

      // Container
      sf(255, 255, 255); doc.rect(x, y, COL_W, rowsH, "F");
      // Header bar
      sf(...GRAY_HEADER); doc.rect(x, y, COL_W, LABEL_H, "F");
      // Outer border
      sd(0, 0, 0); doc.setLineWidth(0.4); doc.rect(x, y, COL_W, rowsH);
      // Vertical dividers
      sd(150, 150, 150); doc.setLineWidth(0.2);
      doc.line(x + ROW_NUM_W, y, x + ROW_NUM_W, y + rowsH);
      doc.line(x + ROW_NUM_W + HALF_W, y, x + ROW_NUM_W + HALF_W, y + rowsH);
      // Sub-headers
      doc.setFont("helvetica", "bold"); doc.setFontSize(5.5); st(0, 0, 0);
      doc.text("#",     x + ROW_NUM_W / 2,             y + LABEL_H - 1.3, { align: "center" });
      doc.text("LEFT",  x + ROW_NUM_W + HALF_W / 2,    y + LABEL_H - 1.3, { align: "center" });
      doc.text("RIGHT", x + ROW_NUM_W + HALF_W * 1.5,  y + LABEL_H - 1.3, { align: "center" });

      let ry = y + LABEL_H + 0.8;
      filledRows.forEach(({ row, left, right }, ri) => {
        const anyFlag = (left?.flags.length ?? 0) > 0 || (right?.flags.length ?? 0) > 0;
        if (anyFlag) {
          sf(...YELLOW); doc.rect(x + 0.2, ry - 2.5, COL_W - 0.4, ROW_H, "F");
        } else if (ri % 2 === 0) {
          sf(248, 248, 248); doc.rect(x + 0.2, ry - 2.5, COL_W - 0.4, ROW_H, "F");
        }
        // Row number
        doc.setFont("helvetica", "bold"); doc.setFontSize(5); st(80, 80, 80);
        doc.text(`${row + 1}`, x + ROW_NUM_W / 2, ry, { align: "center" });
        // Items
        doc.setFont("helvetica", "normal"); doc.setFontSize(5.5); st(0, 0, 0);
        if (left)  doc.text(left.productName  + (left.price  ? `  ${left.price}`  : ""), x + ROW_NUM_W + 1,           ry, { maxWidth: HALF_W - 2 });
        if (right) doc.text(right.productName + (right.price ? `  ${right.price}` : ""), x + ROW_NUM_W + HALF_W + 1,  ry, { maxWidth: HALF_W - 2 });
        // Row separator
        sd(210, 210, 210); doc.setLineWidth(0.1);
        doc.line(x, ry + ROW_H - 2.2, x + COL_W, ry + ROW_H - 2.2);
        ry += ROW_H;
      });

      y += rowsH + 2;
    }

    // Bottom endcap cell
    const botItems = plan.endcaps[island.bottomEndcap] || [];
    const botBg: [number, number, number] = botItems.some(isHighlighted) ? YELLOW : BLUE_ENDCAP;
    const botH = Math.max(MIN_CELL_H, LABEL_H + botItems.length * LINE_H + botItems.filter(i => i.notes).length * 3 + 3);
    drawCell(x, y, COL_W, botH, `ENDCAP ${island.bottomEndcap}`, botItems, botBg);
  });

  // ── Extras column (Meal Deal, Freezer Display, etc.) ─────────────────────
  if (hasExtras) {
    const x = MARGIN + 3 * (COL_W + COL_GAP);
    let y = BODY_TOP;

    sf(70, 70, 70); sd(0, 0, 0); doc.setLineWidth(0.5);
    doc.rect(x, y, COL_W, SECTION_H, "FD");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); st(255, 255, 255);
    doc.text("SPECIALS", x + COL_W / 2, y + SECTION_H - 1.5, { align: "center" });
    y += SECTION_H + 2;

    EXTRA_SECTIONS.forEach(section => {
      const items = plan.extras[section.id] || [];
      if (items.length === 0) return;
      const hi = items.some(isHighlighted);
      const h = Math.max(MIN_CELL_H, LABEL_H + items.length * LINE_H + items.filter(i => i.notes).length * 3 + 3);
      const lbg: [number, number, number] = hi ? YELLOW : [210, 242, 210];
      drawCell(x, y, COL_W, h, section.label.toUpperCase(), items, lbg);
      y += h + 2;
    });
  }

  // ── Footer on every page ─────────────────────────────────────────────────
  const totalPages = (doc as { getNumberOfPages?: () => number }).getNumberOfPages?.() ?? 1;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); st(140, 140, 140);
    doc.text(
      `${plan.weekLabel}  ·  Island Planner  ·  Page ${p} of ${totalPages}`,
      PAGE_W / 2, PAGE_H - 3,
      { align: "center" },
    );
  }

  return doc.output("blob");
}
