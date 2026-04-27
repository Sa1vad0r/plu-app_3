"use client";

import { WeekPlan, ISLANDS, EXTRA_SECTIONS, IslandSlot, SLOT_FLAGS } from "@/types/island";

function getFlagShort(flag: string): string {
  return SLOT_FLAGS.find(f => f.value === flag)?.short ?? flag.toUpperCase();
}

export async function generateIslandPDF(plan: WeekPlan): Promise<Blob> {
  const { jsPDF } = await import("jspdf");

  // Portrait letter — matches the reference image orientation
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });

  const PAGE_W  = 215.9;
  const PAGE_H  = 279.4;
  const MARGIN  = 8;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  const YELLOW: [number, number, number]     = [255, 253, 150];
  const BLUE_EC: [number, number, number]    = [218, 232, 252];
  const GRAY_HDR: [number, number, number]   = [210, 210, 210];
  const GRAY_DARK: [number, number, number]  = [70,  70,  70 ];

  const sf = (r: number, g: number, b: number) => doc.setFillColor(r, g, b);
  const sd = (r: number, g: number, b: number) => doc.setDrawColor(r, g, b);
  const st = (r: number, g: number, b: number) => doc.setTextColor(r, g, b);

  // ── Page background ───────────────────────────────────────────────────────
  sf(255, 255, 255); doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // ── HEADER ────────────────────────────────────────────────────────────────
  const HEADER_H = 14;

  doc.setFont("helvetica", "bold"); doc.setFontSize(13); st(0, 0, 0);
  doc.text("ISLAND PLAN", MARGIN, 9);

  // Week label — yellow highlighted box (top-right, like image)
  const BOX_W = 44;
  sf(...YELLOW); sd(0, 0, 0); doc.setLineWidth(0.5);
  doc.rect(PAGE_W - MARGIN - BOX_W, 2, BOX_W, 9, "FD");
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); st(0, 0, 0);
  doc.text(plan.weekLabel, PAGE_W - MARGIN - BOX_W / 2, 7.8, { align: "center" });

  doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); st(100, 100, 100);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
    MARGIN, HEADER_H - 1,
  );

  sd(0, 0, 0); doc.setLineWidth(0.7);
  doc.line(MARGIN, HEADER_H, PAGE_W - MARGIN, HEADER_H);

  // ── Layout constants ──────────────────────────────────────────────────────
  const BODY_TOP     = HEADER_H + 3;
  const FOOTER_H     = 7;
  const BODY_H       = PAGE_H - BODY_TOP - FOOTER_H;

  const COL_COUNT    = 3;
  const COL_GAP      = 2;
  const COL_W        = (CONTENT_W - COL_GAP * (COL_COUNT - 1)) / COL_COUNT;

  const ISLAND_HDR_H = 6;
  const LABEL_BAR_H  = 5;   // endcap label bar height
  const ROW_HDR_H    = 5;   // #/LEFT/RIGHT header bar
  const CELL_GAP     = 1.5;
  const LINE_H       = 3.5; // height per endcap item line
  const ROW_NUM_W    = 6;   // width of the row-number column

  // Determine a uniform endcap height (based on largest endcap across all islands)
  const maxEndcapItems = Math.max(
    1,
    ...ISLANDS.flatMap(island => [
      (plan.endcaps[island.topEndcap]    || []).length,
      (plan.endcaps[island.bottomEndcap] || []).length,
    ]),
  );
  const ENDCAP_H = Math.max(12, LABEL_BAR_H + maxEndcapItems * LINE_H + 2);

  // Row height: fill the remaining vertical space, sized for the tallest island
  const maxRows   = Math.max(...ISLANDS.map(i => i.rows));
  const fixedPerCol = ISLAND_HDR_H + ENDCAP_H + ROW_HDR_H + ENDCAP_H + CELL_GAP * 3;
  const ROW_H     = Math.max(3.5, (BODY_H - fixedPerCol) / maxRows);

  // ── Draw endcap cell ──────────────────────────────────────────────────────
  const drawEndcap = (
    x: number, y: number, w: number, h: number,
    label: string, items: IslandSlot[],
  ) => {
    const hasFlag = items.some(i => i.flags.length > 0);
    const labelBg: [number, number, number] = hasFlag ? YELLOW : BLUE_EC;

    sf(255, 255, 255); doc.rect(x, y, w, h, "F");
    sf(...labelBg);    doc.rect(x, y, w, LABEL_BAR_H, "F");
    sd(0, 0, 0); doc.setLineWidth(0.4); doc.rect(x, y, w, h);

    doc.setFont("helvetica", "bold"); doc.setFontSize(6); st(0, 0, 0);
    doc.text(label, x + w / 2, y + LABEL_BAR_H - 1.2, { align: "center", maxWidth: w - 2 });

    let iy = y + LABEL_BAR_H + 2;
    items.forEach(item => {
      const hi = item.flags.length > 0;
      if (hi) {
        sf(...YELLOW);
        doc.rect(x + 0.5, iy - 2.5, w - 1, LINE_H + 0.3, "F");
      }
      doc.setFont("helvetica", hi ? "bold" : "normal");
      doc.setFontSize(5.5); st(0, 0, 0);
      const txt = item.productName
        + (item.price ? `  ${item.price}` : "")
        + (item.flags.length ? `  [${item.flags.map(getFlagShort).join("/")}]` : "");
      doc.text(txt || "—", x + 1.5, iy, { maxWidth: w - 3 });
      iy += LINE_H;
    });
  };

  // ── Draw one island column ────────────────────────────────────────────────
  ISLANDS.forEach((island, idx) => {
    const x  = MARGIN + idx * (COL_W + COL_GAP);
    let   y  = BODY_TOP;
    const HALF_W = (COL_W - ROW_NUM_W) / 2;

    // Island header
    sf(...GRAY_DARK); sd(0, 0, 0); doc.setLineWidth(0.5);
    doc.rect(x, y, COL_W, ISLAND_HDR_H, "FD");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); st(255, 255, 255);
    doc.text(island.label.toUpperCase(), x + COL_W / 2, y + ISLAND_HDR_H - 1.5, { align: "center" });
    y += ISLAND_HDR_H + CELL_GAP;

    // Top endcap
    drawEndcap(x, y, COL_W, ENDCAP_H, `ENDCAP ${island.topEndcap}`, plan.endcaps[island.topEndcap] || []);
    y += ENDCAP_H + CELL_GAP;

    // Row header bar
    sf(...GRAY_HDR); sd(0, 0, 0); doc.setLineWidth(0.4);
    doc.rect(x, y, COL_W, ROW_HDR_H, "FD");
    // Vertical dividers in header
    sd(130, 130, 130); doc.setLineWidth(0.2);
    doc.line(x + ROW_NUM_W,           y, x + ROW_NUM_W,           y + ROW_HDR_H);
    doc.line(x + ROW_NUM_W + HALF_W,  y, x + ROW_NUM_W + HALF_W,  y + ROW_HDR_H);
    doc.setFont("helvetica", "bold"); doc.setFontSize(5.5); st(0, 0, 0);
    doc.text("#",      x + ROW_NUM_W / 2,                     y + ROW_HDR_H - 1.3, { align: "center" });
    doc.text("LEFT",   x + ROW_NUM_W + HALF_W / 2,            y + ROW_HDR_H - 1.3, { align: "center" });
    doc.text("RIGHT",  x + ROW_NUM_W + HALF_W + HALF_W / 2,   y + ROW_HDR_H - 1.3, { align: "center" });
    y += ROW_HDR_H;

    // All rows — including empty ones — as a single bordered block
    const totalRowsH = ROW_H * island.rows;
    sf(255, 255, 255); doc.rect(x, y, COL_W, totalRowsH, "F");

    // Outer border for the whole rows block
    sd(0, 0, 0); doc.setLineWidth(0.4); doc.rect(x, y, COL_W, totalRowsH);

    // Vertical dividers running through all rows
    sd(160, 160, 160); doc.setLineWidth(0.2);
    doc.line(x + ROW_NUM_W,          y, x + ROW_NUM_W,          y + totalRowsH);
    doc.line(x + ROW_NUM_W + HALF_W, y, x + ROW_NUM_W + HALF_W, y + totalRowsH);

    for (let r = 0; r < island.rows; r++) {
      const left  = plan.slots[`${island.id}-${r}-L`] || null;
      const right = plan.slots[`${island.id}-${r}-R`] || null;
      const ry    = y + r * ROW_H;

      // Row background
      const anyFlag = (left?.flags.length ?? 0) > 0 || (right?.flags.length ?? 0) > 0;
      if (anyFlag) {
        sf(...YELLOW); doc.rect(x + 0.2, ry + 0.1, COL_W - 0.4, ROW_H - 0.1, "F");
      } else if (r % 2 === 0) {
        sf(249, 249, 249); doc.rect(x + 0.2, ry + 0.1, COL_W - 0.4, ROW_H - 0.1, "F");
      }

      // Row number
      const textY = ry + ROW_H * 0.68;
      doc.setFont("helvetica", "bold"); doc.setFontSize(4.8); st(110, 110, 110);
      doc.text(`${r + 1}`, x + ROW_NUM_W / 2, textY, { align: "center" });

      // Item text
      doc.setFont("helvetica", "normal"); doc.setFontSize(5.5); st(0, 0, 0);
      if (left) {
        doc.text(
          left.productName + (left.price ? `  ${left.price}` : ""),
          x + ROW_NUM_W + 1, textY, { maxWidth: HALF_W - 2 },
        );
      }
      if (right) {
        doc.text(
          right.productName + (right.price ? `  ${right.price}` : ""),
          x + ROW_NUM_W + HALF_W + 1, textY, { maxWidth: HALF_W - 2 },
        );
      }

      // Horizontal row separator
      sd(210, 210, 210); doc.setLineWidth(0.1);
      doc.line(x, ry + ROW_H, x + COL_W, ry + ROW_H);
    }

    y += totalRowsH + CELL_GAP;

    // Bottom endcap
    drawEndcap(x, y, COL_W, ENDCAP_H, `ENDCAP ${island.bottomEndcap}`, plan.endcaps[island.bottomEndcap] || []);
  });

  // ── Extras section (second page if any content) ───────────────────────────
  const hasExtras = EXTRA_SECTIONS.some(s => (plan.extras[s.id] || []).length > 0);
  if (hasExtras) {
    doc.addPage();
    sf(255, 255, 255); doc.rect(0, 0, PAGE_W, PAGE_H, "F");

    // Page 2 header
    sd(0, 0, 0); doc.setLineWidth(0.7);
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); st(0, 0, 0);
    doc.text("SPECIAL SECTIONS", MARGIN, 12);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); st(80, 80, 80);
    doc.text(plan.weekLabel, PAGE_W - MARGIN, 12, { align: "right" });
    doc.line(MARGIN, 15, PAGE_W - MARGIN, 15);

    let ey = 20;
    EXTRA_SECTIONS.forEach(section => {
      const items = plan.extras[section.id] || [];
      if (items.length === 0) return;

      const hasFlag = items.some(i => i.flags.length > 0);
      const cellH = Math.max(12, LABEL_BAR_H + items.length * LINE_H + 3);

      // Section label bar
      const lbg: [number, number, number] = hasFlag ? YELLOW : [210, 242, 210];
      sf(...lbg); sd(0, 0, 0); doc.setLineWidth(0.4);
      doc.rect(MARGIN, ey, CONTENT_W, LABEL_BAR_H, "FD");
      doc.setFont("helvetica", "bold"); doc.setFontSize(7); st(0, 0, 0);
      doc.text(section.label.toUpperCase(), MARGIN + 3, ey + LABEL_BAR_H - 1.3);

      // Items box
      sf(255, 255, 255); doc.rect(MARGIN, ey + LABEL_BAR_H, CONTENT_W, cellH - LABEL_BAR_H, "F");
      sd(0, 0, 0); doc.rect(MARGIN, ey, CONTENT_W, cellH);

      let iy = ey + LABEL_BAR_H + 3;
      items.forEach(item => {
        const hi = item.flags.length > 0;
        if (hi) {
          sf(...YELLOW); doc.rect(MARGIN + 0.5, iy - 2.5, CONTENT_W - 1, LINE_H + 0.3, "F");
        }
        doc.setFont("helvetica", hi ? "bold" : "normal");
        doc.setFontSize(7); st(0, 0, 0);
        doc.text(
          item.productName
            + (item.price ? `  ${item.price}` : "")
            + (item.flags.length ? `  [${item.flags.map(getFlagShort).join("/")}]` : ""),
          MARGIN + 2, iy, { maxWidth: CONTENT_W - 4 },
        );
        iy += LINE_H + 1;
      });

      ey += cellH + 4;
    });
  }

  // ── Footer on every page ──────────────────────────────────────────────────
  const totalPages = (doc as { getNumberOfPages?: () => number }).getNumberOfPages?.() ?? 1;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); st(140, 140, 140);
    doc.text(
      `${plan.weekLabel}  ·  Island Planner  ·  Page ${p} of ${totalPages}`,
      PAGE_W / 2, PAGE_H - 3, { align: "center" },
    );
  }

  return doc.output("blob");
}
