const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const InvoiceModel = require("../models/invoice.model");

const INVOICE_ROOT = path.join(__dirname, "../uploads/invoices");

const COL_DESC_X = 50;
const COL_DESC_WIDTH = 250;
const COL_AMOUNT_X = 450;
const COL_AMOUNT_WIDTH = 100;

async function addInvoiceForTenant(tenantId, requestData) {
    return await InvoiceModel.create({ ...requestData, tenantId });
}

async function generateInvoicePdf({ invoice, tenantId, invoice_no }) {
    return new Promise((resolve, reject) => {
        try {
            const tenantDir = path.join(INVOICE_ROOT, tenantId);
            fs.mkdirSync(tenantDir, { recursive: true });

            //const fileName = `invoice-${Date.now()}-${uuidv4()}.pdf`;
            invoice_no = `${invoice_no}.pdf`;
            const filePath = path.join(tenantDir, invoice_no);

            const doc = new PDFDocument({ size: "A4", margin: 50 });
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            const pageWidth = doc.page.width - 100;

            /* ---------- HEADER ---------- */
            doc.fontSize(18).font("Helvetica-Bold").text("INVOICE", { align: "center" });

            doc.moveDown(2);

            /* ---------- ISSUED TO / INVOICE META ---------- */
            const topY = doc.y;

            // Issued To (Left)
            doc.fontSize(9).font("Helvetica-Bold").text("ISSUED TO:", 50, topY);

            doc.font("Helvetica").text(invoice.billed_to.name).text(invoice.billed_to.email);

            // Invoice Meta (Right)
            doc.font("Helvetica-Bold")
                .text("INVOICE NO:", 350, topY, { align: "right" })
                .font("Helvetica")
                .text(invoice.invoice_no, { align: "right" })
                .moveDown(0.5)
                .text(new Date(invoice.invoice_date).toLocaleDateString(), {
                    align: "right",
                });

            doc.moveDown(2);

            /* ---------- DIVIDER ---------- */
            doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#999").stroke();

            doc.moveDown(1);

            /* ---------- TABLE HEADER ---------- */
            const tableHeaderY = doc.y;
            doc.fontSize(10)
                .font("Helvetica-Bold")
                .text("DESCRIPTION", 50, tableHeaderY)
                .text("AMOUNT", 450, tableHeaderY, { align: "right" });

            doc.moveDown(0.5);

            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

            doc.moveDown(1);

            /* ---------- TABLE ROW ---------- */
            const rowY = doc.y;
            // DESCRIPTION (wrapped)
            doc.font("Helvetica").fontSize(10).text(invoice.description, COL_DESC_X, rowY, {
                width: COL_DESC_WIDTH,
                align: "left",
            });

            // Calculate height used by description
            const descHeight = doc.heightOfString(invoice.description, {
                width: COL_DESC_WIDTH,
                align: "left",
            });

            // AMOUNT (aligned to first line)
            doc.font("Helvetica").text(`INR ${invoice.amount}`, COL_AMOUNT_X, rowY, {
                width: COL_AMOUNT_WIDTH,
                align: "right",
            });

            // Move cursor BELOW the tallest column
            doc.y = rowY + descHeight + 10;

            doc.moveDown(6);

            /* ---------- PURPLE LINE ---------- */
            doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#999").lineWidth(2).stroke();

            doc.moveDown(2);

            /* ---------- TOTAL SECTION ---------- */
            const rightX = 350;

            doc.font("Helvetica")
                .fontSize(10)
                .text("Total", rightX, doc.y)
                .text(`INR ${invoice.amount}`, 450, doc.y - 12, {
                    align: "right",
                });

            doc.moveDown(0.5);

            doc.text("Tax", rightX).text(`${invoice.tax}%`, 450, doc.y - 12, {
                align: "right",
            });

            doc.moveDown(0.5);
            let tax = (invoice.tax / 100) * invoice.amount;
            let total = invoice.amount + tax;
            doc.font("Helvetica-Bold")
                .text("Amount due", rightX)
                .text(`INR ${total}`, 450, doc.y - 12, {
                    align: "right",
                });

            doc.end();

            stream.on("finish", () => resolve({ invoice_no, filePath }));
            stream.on("error", reject);
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    generateInvoicePdf: generateInvoicePdf,
    addInvoiceForTenant: addInvoiceForTenant,
};
