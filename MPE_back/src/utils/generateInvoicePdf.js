"use strict";

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const GREEN  = "#132A24";
const LGRAY  = "#f5f5f3";
const GRAY   = "#879f98";
const BLACK  = "#1a1a1a";
const W = 595; // A4 width pts

const fmtAmt = (v) =>
  v != null && v !== "" ? `${parseFloat(v).toFixed(2).replace(".", ",")} €` : "—";

const fmtDate = (v) => {
  if (!v) return "";
  return new Date(v).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });
};

function drawHLine(doc, y, color = "#e0e0de", lx = 40, rx = 555) {
  doc.save().moveTo(lx, y).lineTo(rx, y).lineWidth(0.5).strokeColor(color).stroke().restore();
}

function buildPdf(invoice, logoPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0, bufferPages: true });
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end",  () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const M = 40; // margin
    const contentW = W - M * 2;

    /* ── HEADER ── */
    doc.rect(0, 0, W, 110).fill(GREEN);

    let logoW = 0;
    if (logoPath && fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, M, 18, { height: 50, fit: [90, 50] });
        logoW = 100;
      } catch {/* skip logo if error */}
    }

    const titleX = M + logoW + (logoW ? 12 : 0);
    doc.fillColor("#879f98").fontSize(8).font("Helvetica").text("FACTURE", titleX, 22);
    doc.fillColor("#ffffff").fontSize(18).font("Helvetica").text(invoice.invoice_number || "", titleX, 33);

    const dueDate = invoice.due_date ? fmtDate(invoice.due_date) : "";

    doc.fillColor("#879f98").fontSize(8).font("Helvetica")
      .text(`Date : ${fmtDate(invoice.invoice_date)}`, 0, 24, { align: "right", width: W - M })
      .text(`Échéance : : ${dueDate}`, 0, 36, { align: "right", width: W - M })
      .text("Facture", 0, 50, { align: "right", width: W - M });

    /* ── PARTIES ── */
    let y = 130;
    const halfW = (contentW - 20) / 2;

    const drawParty = (label, lines, x) => {
      doc.fillColor(GRAY).fontSize(7.5).font("Helvetica-Bold")
        .text(label.toUpperCase(), x, y, { width: halfW, characterSpacing: 0.8 });
      let py = y + 14;
      lines.filter(Boolean).forEach((line, i) => {
        doc.fillColor(i === 0 ? GREEN : "#444").fontSize(i === 0 ? 10 : 8.5)
          .font(i === 0 ? "Helvetica-Bold" : "Helvetica")
          .text(line, x, py, { width: halfW });
        py += doc.currentLineHeight() + 2;
      });
      return py;
    };

    const entLines = [
      invoice.ent_name,
      [invoice.ent_legal_form, invoice.ent_legal_status].filter(Boolean).join(" — "),
      invoice.ent_address,
      [invoice.ent_zip, invoice.ent_city].filter(Boolean).join(" "),
      invoice.ent_siret     ? `SIRET : ${invoice.ent_siret}` : null,
      invoice.ent_tva_number? `TVA : ${invoice.ent_tva_number}` : null,
      invoice.ent_rcs       ? `RCS : ${invoice.ent_rcs}` : null,
      invoice.ent_rm        ? `RM : ${invoice.ent_rm}` : null,
      [invoice.ent_phone, invoice.ent_email].filter(Boolean).join(" · "),
    ];
    const cliLines = [
      [invoice.client_name, invoice.client_company].filter(Boolean).join(" — "),
      invoice.client_address,
      [invoice.client_zip, invoice.client_city].filter(Boolean).join(" "),
      invoice.client_phone ? `Tél : ${invoice.client_phone}` : null,
      invoice.client_email,
    ];

    const yEntEnd = drawParty("Prestataire", entLines, M);
    const yCLiEnd = drawParty("Client", cliLines, M + halfW + 20);
    y = Math.max(yEntEnd, yCLiEnd) + 16;

    drawHLine(doc, y);
    y += 16;

    /* ── TRAVAUX ── */
    if (invoice.work_start_date || invoice.work_duration) {
      doc.fillColor(GRAY).fontSize(7.5).font("Helvetica-Bold")
        .text("DÉTAILS DE LA PRESTATION", M, y, { characterSpacing: 0.8 });
      y += 14;
      const detail = [
        invoice.work_start_date ? `Début prévu : ${fmtDate(invoice.work_start_date)}` : null,
        invoice.work_duration   ? `Durée estimée : ${invoice.work_duration}` : null,
      ].filter(Boolean).join("   —   ");
      doc.fillColor(BLACK).fontSize(9).font("Helvetica").text(detail, M, y, { width: contentW });
      y += 20;
      drawHLine(doc, y);
      y += 16;
    }

    /* ── ITEMS TABLE ── */
    const items = Array.isArray(invoice.items) ? invoice.items : [];
    if (items.length > 0 || invoice.labor_description) {
      doc.fillColor(GRAY).fontSize(7.5).font("Helvetica-Bold")
        .text("DÉTAIL DES PRESTATIONS", M, y, { characterSpacing: 0.8 });
      y += 14;

      if (items.length > 0) {
        // Table header
        const cols = { desc: M, qty: M + 290, price: M + 360, total: M + 440 };
        doc.rect(M, y, contentW, 20).fill(LGRAY);
        doc.fillColor(GRAY).fontSize(7.5).font("Helvetica-Bold");
        doc.text("Description",  cols.desc  + 6, y + 6, { width: 280 });
        doc.text("Qté",          cols.qty,        y + 6, { width: 60,  align: "center" });
        doc.text("Prix HT",      cols.price,      y + 6, { width: 75,  align: "right" });
        doc.text("Total HT",     cols.total,      y + 6, { width: 75,  align: "right" });
        y += 20;

        items.forEach((it) => {
          const lineTotal = (parseFloat(it.quantity) || 0) * (parseFloat(it.unit_price) || 0);
          drawHLine(doc, y, "#eeeeec");
          y += 3;
          doc.fillColor(BLACK).fontSize(8.5).font("Helvetica");
          doc.text(it.description || "", cols.desc + 6, y, { width: 278 });
          doc.text(String(it.quantity || 0), cols.qty, y, { width: 60, align: "center" });
          doc.text(fmtAmt(it.unit_price), cols.price, y, { width: 75, align: "right" });
          doc.fillColor(GREEN).font("Helvetica-Bold")
            .text(fmtAmt(lineTotal), cols.total, y, { width: 75, align: "right" });
          y += 18;
        });
      }

      if (invoice.labor_description) {
        y += 4;
        doc.rect(M, y, contentW, 1).fill("#eeeeec");
        y += 8;
        doc.fillColor(BLACK).fontSize(8.5).font("Helvetica-Bold").text("Main d'œuvre : ", M + 4, y, { continued: true });
        doc.font("Helvetica").text(invoice.labor_description, { width: contentW - 8 });
        if (invoice.labor_price_type) {
          y += 14;
          const typeLabel = invoice.labor_price_type === "hourly" ? "Taux horaire" : "Forfait";
          doc.fillColor(GRAY).fontSize(8).text(`${typeLabel} : ${fmtAmt(invoice.labor_price)}`, M + 4, y);
        }
        y += 16;
      }

      if (parseFloat(invoice.travel_expenses) > 0) {
        doc.fillColor(GRAY).fontSize(8).font("Helvetica")
          .text(`Frais de déplacement : ${fmtAmt(invoice.travel_expenses)}`, M, y);
        y += 14;
      }

      y += 6;
      drawHLine(doc, y);
      y += 14;
    }

    /* ── TOTALS ── */
    const totW = 200;
    const totX = W - M - totW;

    const drawTotal = (label, value, bold = false) => {
      doc.fillColor(bold ? GREEN : GRAY)
        .fontSize(bold ? 10 : 8.5)
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .text(label, totX, y, { width: totW / 2 });
      doc.fillColor(bold ? GREEN : BLACK)
        .text(value, totX + totW / 2, y, { width: totW / 2, align: "right" });
      y += bold ? 14 : 13;
    };

    drawTotal("Total HT", fmtAmt(invoice.total_ht));
    drawTotal(`TVA ${invoice.tva_rate} %`, fmtAmt(invoice.total_tva));
    y += 4;
    drawHLine(doc, y, GREEN, totX, totX + totW);
    y += 8;
    drawTotal("Total TTC", fmtAmt(invoice.total_ttc), true);
    y += 20;

    /* ── CONDITIONS ── */
    const conditions = [
      invoice.payment_conditions  ? `Paiement : ${invoice.payment_conditions}` : null,
      invoice.delivery_conditions ? `Livraison : ${invoice.delivery_conditions}` : null,
      invoice.sav_conditions      ? `SAV : ${invoice.sav_conditions}` : null,
    ].filter(Boolean);

    if (conditions.length > 0) {
      doc.rect(M, y, contentW, 8).fill(LGRAY); // top stripe
      const condH = conditions.length * 14 + 16;
      doc.rect(M, y, contentW, condH).fill(LGRAY);
      y += 8;
      conditions.forEach((line) => {
        doc.fillColor(BLACK).fontSize(8).font("Helvetica")
          .text(line, M + 8, y, { width: contentW - 16 });
        y += 14;
      });
      y += 8;
    }

    if (invoice.notes) {
      y += 4;
      doc.fillColor(GRAY).fontSize(7.5).font("Helvetica-Bold")
        .text("NOTES", M, y, { characterSpacing: 0.8 });
      y += 12;
      doc.fillColor("#555").fontSize(8.5).font("Helvetica")
        .text(invoice.notes, M, y, { width: contentW });
      y += doc.currentLineHeight() + 14;
    }

    /* ── BON POUR ACCORD ── */
    if (y > 700) { doc.addPage(); y = 40; }

    doc.rect(M, y, contentW, 90).dash(3, { space: 3 }).strokeColor("#cccccc").lineWidth(1).stroke().undash();
    doc.fillColor(GREEN).fontSize(11).font("Helvetica-Bold")
      .text("Conditions de règlement", M, y + 12, { align: "center", width: contentW });
    doc.fillColor(GRAY).fontSize(8).font("Helvetica")
      .text("Lu et approuvé — Signature précédée de la mention « Conditions de règlement »", M, y + 28, { align: "center", width: contentW });
    const sigY = y + 52;
    const sig1X = M + 60;
    const sig2X = M + contentW - 60 - 140;
    [[sig1X, "Date :"], [sig2X, "Signature :"]].forEach(([sx, label]) => {
      doc.fillColor(GRAY).fontSize(7.5).font("Helvetica").text(label, sx, sigY - 10, { width: 140 });
      doc.moveTo(sx, sigY + 20).lineTo(sx + 140, sigY + 20).lineWidth(0.7).strokeColor("#999999").stroke();
    });
    y += 100;

    /* ── FOOTER ── */
    const footerY = doc.page.height - 30;
    drawHLine(doc, footerY - 4, "#e0e0de");
    doc.fillColor(GRAY).fontSize(7.5).font("Helvetica")
      .text(`Facture émise via Proxilio — proxilio.fr · Échéance : ${dueDate}`, M, footerY, {
        align: "center", width: contentW,
      });

    doc.end();
  });
}

module.exports = buildPdf;
