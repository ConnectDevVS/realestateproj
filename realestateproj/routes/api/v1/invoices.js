const express = require("express");
const router = express.Router();
let responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");
const { findTransactionById } = require("../../../services/transaction.services.js");
const { findTenantByTenantId } = require("../../../services/tenant.services.js");
const { generateInvoiceUniqueCode } = require("../../../utilities/otp.js");
const {
    generateInvoicePdf,
    addInvoiceForTenant,
} = require("../../../services/invoice.services.js");
const { currency } = require("../../../utilities/roles.js");

router.get("/transaction/:transactionId", async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { tenantId } = req;

        const [transaction, tenant] = await Promise.all([
            findTransactionById(tenantId, transactionId),
            findTenantByTenantId(tenantId),
        ]);

        if (!transaction) {
            return responseBuilder.sendErrorResponse(
                res,
                ERROR.TRANSACTIONS_NOT_FOUND,
                CONSTANTS.TRANSACTIONS_NOT_FOUND
            );
        }

        let invoice_no = `INV-${new Date().getFullYear()}-${generateInvoiceUniqueCode()}`;
        const invoice = {
            invoice_no,
            invoice_date: new Date(),
            project: transaction.pid,
            stage: transaction.sid,
            billed_from: transaction.from,
            billed_to: transaction.to,
            description: transaction.note,
            tax: 0,
            transaction,
            amount: transaction.amount,
            currency: transaction.currency ? transaction.currency : currency.INR,
        };

        const { invoice_no: fileName } = await generateInvoicePdf({
            invoice,
            tenantId,
            invoice_no,
            tenant,
        });

        const invoiceUrl = `/invoices/${tenantId}/${fileName}`;
        const newInvoice = {
            pid: transaction.pid,
            sid: transaction.sid,
            transaction_id: transaction._id,
            url: invoiceUrl,
            invoice_no,
        };
        const invoiceData = await addInvoiceForTenant(tenantId, newInvoice);
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
