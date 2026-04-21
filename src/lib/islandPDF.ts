"use client";

import { WeekPlan, ISLANDS, EXTRA_SECTIONS, IslandSlot } from "@/types/island";

function formatItem(item: IslandSlot): string {
  const plu = item.plu ? ` [${item.plu}]` : "";
  const price = item.price ? ` — ${item.price}` : "";
  return `${item.productName}${plu}${price}`;
}

export async function generateIslandPDF(plan: WeekPlan): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });

  const PAGE_W = 215.9;
  const PAGE_H = 279.4;
  const MARGIN = 14;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  let y = MARGIN;

  const checkPage = (needed: number) => {
    if (y + needed > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  // Header
  doc.setFillColor(30, 30, 30);
  doc.rect(0, 0, PAGE_W, 22, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(220, 50, 50);
  doc.text("ISLAND PLAN", MARGIN, 14);
  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text(plan.weekLabel, PAGE_W - MARGIN, 14, { align: "right" });
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated ${dateStr}`, PAGE_W - MARGIN, 19, { align: "right" });

  y = 30;

  const sectionHeader = (title: string) => {
    checkPage(12);
    doc.setFillColor(40, 40, 40);
    doc.rect(MARGIN, y, CONTENT_W, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(220, 50, 50);
    doc.text(title.toUpperCase(), MARGIN + 3, y + 5);
    y += 9;
  };

  const renderItems = (items: IslandSlot[]) => {
    items.forEach((item) => {
      checkPage(6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      doc.text("•", MARGIN + 4, y);
      doc.setTextColor(30, 30, 30);
      doc.text(formatItem(item), MARGIN + 8, y, { maxWidth: CONTENT_W - 10 });
      y += 5.5;
    });
  };

  const renderEndcap = (label: string, items: IslandSlot[]) => {
    if (items.length === 0) return;
    checkPage(10);
    doc.setFont("helvetica", "bolditalic");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(label, MARGIN + 2, y);
    y += 5;
    renderItems(items);
  };

  // Extra sections
  const hasExtras = EXTRA_SECTIONS.some((s) => (plan.extras[s.id] || []).length > 0);
  if (hasExtras) {
    sectionHeader("Special Sections");
    EXTRA_SECTIONS.forEach((section) => {
      const items = plan.extras[section.id] || [];
      if (items.length > 0) {
        checkPage(10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(50, 50, 50);
        doc.text(section.label, MARGIN + 2, y);
        y += 5;
        renderItems(items);
      }
    });
    y += 3;
  }

  // Islands
  ISLANDS.forEach((island) => {
    sectionHeader(island.label);

    // Top endcap
    renderEndcap(`Endcap ${island.topEndcap}`, plan.endcaps[island.topEndcap] || []);

    // Rows
    const filledRows: Array<{ row: number; left: IslandSlot | null; right: IslandSlot | null }> = [];
    for (let r = 0; r < island.rows; r++) {
      const left = plan.slots[`${island.id}-${r}-L`] || null;
      const right = plan.slots[`${island.id}-${r}-R`] || null;
      if (left || right) filledRows.push({ row: r, left, right });
    }

    if (filledRows.length > 0) {
      // Column headers
      checkPage(8);
      doc.setFillColor(245, 245, 245);
      doc.rect(MARGIN, y, CONTENT_W, 5.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(90, 90, 90);
      doc.text("ROW", MARGIN + 2, y + 4);
      doc.text("LEFT", MARGIN + 22, y + 4);
      doc.text("RIGHT", MARGIN + CONTENT_W / 2 + 4, y + 4);
      y += 6;

      filledRows.forEach(({ row, left, right }, idx) => {
        checkPage(7);
        if (idx % 2 === 0) {
          doc.setFillColor(252, 252, 252);
          doc.rect(MARGIN, y - 1, CONTENT_W, 6.5, "F");
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 100, 100);
        doc.text(`${row + 1}`, MARGIN + 5, y + 4, { align: "center" });

        const half = CONTENT_W / 2 - 14;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);

        if (left) {
          doc.setTextColor(20, 20, 20);
          doc.text(left.productName, MARGIN + 18, y + 3, { maxWidth: half });
          if (left.plu) {
            doc.setTextColor(100, 100, 200);
            doc.setFontSize(6.5);
            doc.text(`PLU: ${left.plu}`, MARGIN + 18, y + 6.5, { maxWidth: half });
            doc.setFontSize(7.5);
          }
        } else {
          doc.setTextColor(180, 180, 180);
          doc.text("—", MARGIN + 18, y + 4);
        }

        const rightX = MARGIN + CONTENT_W / 2 + 2;
        if (right) {
          doc.setTextColor(20, 20, 20);
          doc.text(right.productName, rightX, y + 3, { maxWidth: half });
          if (right.plu) {
            doc.setTextColor(100, 100, 200);
            doc.setFontSize(6.5);
            doc.text(`PLU: ${right.plu}`, rightX, y + 6.5, { maxWidth: half });
            doc.setFontSize(7.5);
          }
        } else {
          doc.setTextColor(180, 180, 180);
          doc.text("—", rightX, y + 4);
        }

        // Divider line
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.1);
        doc.line(MARGIN, y + 7, MARGIN + CONTENT_W, y + 7);

        y += 7.5;
      });
    } else {
      checkPage(7);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 160);
      doc.text("No items", MARGIN + 4, y);
      y += 6;
    }

    // Bottom endcap
    renderEndcap(`Endcap ${island.bottomEndcap}`, plan.endcaps[island.bottomEndcap] || []);

    y += 4;
  });

  // Footer on every page
  const totalPages = (doc as { getNumberOfPages?: () => number }).getNumberOfPages?.() ?? 1;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `${plan.weekLabel} — Island Planner — Page ${p} of ${totalPages}`,
      PAGE_W / 2,
      PAGE_H - 6,
      { align: "center" }
    );
  }

  return doc.output("blob");
}
