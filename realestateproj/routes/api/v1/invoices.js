const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
let helper = require("../../../utilities/helper");
let responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");
const { findTransactionById } = require("../../../services/transaction.services.js");
const { generateInvoiceUniqueCode } = require("../../../utilities/otp.js");
const {
    generateInvoicePdf,
    addInvoiceForTenant,
} = require("../../../services/invoice.services.js");
const { currency } = require("../../../utilities/roles.js");

router.get("/transaction/:transactionId", async (req, res, next) => {
    try {
        const { transactionId } = req.params;

        const transaction = await findTransactionById(req.tenantId, transactionId);
        if (!transaction) {
            return responseBuilder.sendErrorResponse(
                res,
                ERROR.TRANSACTIONS_NOT_FOUND,
                CONSTANTS.TRANSACTIONS_NOT_FOUND
            );
        }

        // Build invoice object
        let invoice_no = `INV-${new Date().getFullYear()}-${generateInvoiceUniqueCode()}`;
        const invoice = {
            invoice_no: invoice_no,
            invoice_date: new Date(),
            project: transaction.p_id,
            stage: transaction.stage_id,
            billed_from: transaction.from,
            billed_to: transaction.to,
            description: transaction.note,
            tax: 15,
            transaction,
            amount: transaction.amount,
            currency: transaction.currency ? transaction.currency : currency.INR,
        };

        const { tenantId } = req;
        // Generate PDF
        const { invoice_no: fileName } = await generateInvoicePdf({
            invoice,
            tenantId,
            invoice_no,
        });

        const invoiceUrl = `/invoices/${tenantId}/${fileName}`;
        let newInvoice = {
            p_id: transaction.p_id,
            s_id: transaction.stage_id,
            transaction_id: transaction._id,
            url: invoiceUrl,
            invoice_no: invoice_no,
        };
        const invoiceData = await addInvoiceForTenant(req.tenantId, newInvoice);
        return responseBuilder.sendSuccessResponse(res, invoiceData);
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.ERROR_GENERATING_INVOICE,
            CONSTANTS.ERROR_GENERATING_INVOICE,
            err
        );
    }
});

module.exports = router;
