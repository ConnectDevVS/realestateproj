const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const InvoiceModel = require("../models/invoice.model");

const INVOICE_ROOT = path.join(__dirname, "../public/uploads/invoices");

const M = 50;           // page margin
const RH = 22;          // standard row height
const FS = 9;           // base font size

async function addInvoiceForTenant(tenantId, requestData) {
    return await InvoiceModel.create({ ...requestData, tenantId });
}

function _fmt(amount) {
    return Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function _drawInfoRow(doc, x, y, w, h, cells) {
    doc.rect(x, y, w, h).stroke();
    let cx = x;
    for (const cell of cells) {
        if (cx > x) {
            doc.moveTo(cx, y).lineTo(cx, y + h).stroke();
        }
        doc.font(cell.bold ? "Helvetica-Bold" : "Helvetica")
            .fontSize(FS)
            .fillColor("#000000")
            .text(cell.text, cx + 5, y + 7, { width: cell.w - 10, lineBreak: false });
        cx += cell.w;
    }
}


function _drawSummaryTotalRow(doc, x, y, w, h, col1W, col2W, label, value, bold) {
    doc.rect(x, y, w, h).stroke();
    doc.moveTo(x + col1W, y).lineTo(x + col1W, y + h).stroke();
    const font = bold ? "Helvetica-Bold" : "Helvetica";
    // label sits in the right portion of col1
    doc.font(font).fontSize(FS).fillColor("#000000")
        .text(label, x + col1W - 160, y + 7, { width: 155, align: "right" })
        .text(value, x + col1W + 3, y + 7, { width: col2W - 8, align: "right" });
}

async function generateInvoicePdf({ invoice, tenantId, invoice_no, tenant }) {
    return new Promise((resolve, reject) => {
        try {
            const tenantDir = path.join(INVOICE_ROOT, tenantId);
            fs.mkdirSync(tenantDir, { recursive: true });

            invoice_no = `${invoice_no}.pdf`;
            const filePath = path.join(tenantDir, invoice_no);

            const doc = new PDFDocument({ size: "A4", margin: M });
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            const PW = doc.page.width;
            const CW = PW - 2 * M;  // 495.28

            // ── HEADER ─────────────────────────────────────────────
            const logoPath = path.join(__dirname, "../public/tenantpublic", tenantId, "businesslogo.png");
            const logoMaxW = 150;
            const logoMaxH = 90;

            let y = M;
            const hasLogo = fs.existsSync(logoPath);
            if (hasLogo) {
                doc.image(logoPath, (PW - logoMaxW) / 2, y, { fit: [logoMaxW, logoMaxH], align: "center", valign: "center" });
                y += logoMaxH + 3;
            }

            doc.font("Helvetica-Bold").fontSize(13).fillColor("#000000")
                .text(tenant?.name || "", M, y, { width: CW, align: "center" });
            y = doc.y + 2;

            if (tenant?.address) {
                doc.font("Helvetica").fontSize(8).fillColor("#000000")
                    .text(tenant.address, M, y, { width: CW, align: "center" });
                y = doc.y + 2;
            }
            if (tenant?.email) {
                doc.font("Helvetica").fontSize(8).fillColor("#000000")
                    .text(tenant.email, M, y, { width: CW, align: "center" });
                y = doc.y + 2;
            }
            if (tenant?.contact) {
                doc.font("Helvetica").fontSize(8).fillColor("#000000")
                    .text(tenant.contact, M, y, { width: CW, align: "center" });
                y = doc.y + 2;
            }

            y += 10;

            // ── INFO TABLE ─────────────────────────────────────────
            const C1 = 90;
            const C2 = 160;
            const C3 = 90;
            const C4 = CW - C1 - C2 - C3;

            // "Invoice Details" header row
            doc.rect(M, y, CW, RH).fillAndStroke("#eeeeee", "#000000");
            doc.fillColor("#000000").font("Helvetica-Bold").fontSize(FS)
                .text("Invoice Details", M + 5, y + 7);
            y += RH;

            _drawInfoRow(doc, M, y, CW, RH, [
                { text: "Billed To", w: C1, bold: true },
                { text: invoice.billed_from?.name || "", w: C2 },
                { text: "Invoice No", w: C3, bold: true },
                { text: invoice.invoice_no, w: C4 },
            ]);
            y += RH;

            _drawInfoRow(doc, M, y, CW, RH, [
                { text: "Email", w: C1, bold: true },
                { text: invoice.billed_from?.email || "", w: C2 },
                { text: "Date", w: C3, bold: true },
                { text: new Date(invoice.invoice_date).toLocaleDateString(), w: C4 },
            ]);
            y += RH + 15;

            // ── PARTICULARS TABLE ──────────────────────────────────
            const PC1 = CW - 130;
            const PC2 = 130;

            doc.rect(M, y, CW, RH).fillAndStroke("#eeeeee", "#000000");
            doc.moveTo(M + PC1, y).lineTo(M + PC1, y + RH).stroke();
            doc.fillColor("#000000").font("Helvetica-Bold").fontSize(FS)
                .text("Particulars", M + 5, y + 7)
                .text("Amount (INR)", M + PC1 + 3, y + 7, { width: PC2 - 6, align: "right" });
            y += RH;

            const descText = invoice.description || "";
            const descH = Math.max(RH, doc.heightOfString(descText, { width: PC1 - 10, fontSize: FS }) + 12);
            doc.rect(M, y, CW, descH).stroke();
            doc.moveTo(M + PC1, y).lineTo(M + PC1, y + descH).stroke();
            doc.font("Helvetica").fontSize(FS).fillColor("#000000")
                .text(descText, M + 5, y + 6, { width: PC1 - 10 })
                .text(_fmt(invoice.amount), M + PC1 + 3, y + 6, { width: PC2 - 8, align: "right" });
            y += descH + 10;

            // ── SUMMARY TABLE ──────────────────────────────────────
            const tax = (invoice.tax / 100) * invoice.amount;
            const amountDue = invoice.amount + tax;

            doc.rect(M, y, CW, RH).fillAndStroke("#eeeeee", "#000000");
            doc.moveTo(M + PC1, y).lineTo(M + PC1, y + RH).stroke();
            doc.fillColor("#000000").font("Helvetica-Bold").fontSize(FS)
                .text("Summary", M + 5, y + 7)
                .text("Amount (INR)", M + PC1 + 3, y + 7, { width: PC2 - 6, align: "right" });
            y += RH;

            const totals = [
                ["Total amount to pay", _fmt(invoice.amount), false],
                [`Tax (${invoice.tax}%)`, _fmt(tax), false],
                ["Amount due", _fmt(amountDue), true],
            ];
            for (const [label, value, bold] of totals) {
                _drawSummaryTotalRow(doc, M, y, CW, RH, PC1, PC2, label, value, bold);
                y += RH;
            }

            doc.end();
            stream.on("finish", () => resolve({ invoice_no, filePath }));
            stream.on("error", reject);
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    generateInvoicePdf,
    addInvoiceForTenant,
};
