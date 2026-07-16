var express = require("express");
var router = express.Router();
const helper = require("../../../utilities/helper");
const responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");
const { paymentStatus, paymentMode, refundStatus } = require("../../../utilities/roles");
const {
    createOrder,
    verifyPaymentSignature,
    verifyWebhookSignature,
    fetchPayment,
    refundPayment,
} = require("../../../services/razorpay.services");
const TransactionModel = require("../../../models/transaction.model");

// POST /api/v1/payment/create-order
router.post("/create-order", async (req, res) => {
    const { transaction_id, amount } = req.body;

    if (helper.isEmpty(transaction_id) || helper.isEmpty(amount)) {
        return responseBuilder.sendErrorResponse(res, ERROR.MISSING_PARAMETERS, CONSTANTS.MISSING_PARAMETERS);
    }

    if (!helper.isValidMongoId(transaction_id)) {
        return responseBuilder.sendErrorResponse(res, ERROR.MISSING_PARAMETERS, CONSTANTS.MISSING_PARAMETERS);
    }

    try {
        const transaction = await TransactionModel.findOne(
            { _id: transaction_id },
            null,
            { tenantId: req.tenantId }
        );

        if (!transaction) {
            return responseBuilder.sendErrorResponse(res, ERROR.TRANSACTIONS_NOT_FOUND, CONSTANTS.TRANSACTIONS_NOT_FOUND);
        }

        if (transaction.payment_status === paymentStatus.SUCCESS) {
            return responseBuilder.sendErrorResponse(res, ERROR.PAYMENT_ALREADY_COMPLETED, CONSTANTS.PAYMENT_ALREADY_COMPLETED);
        }

        const order = await createOrder(amount, { transaction_id, tenant_id: req.tenantId });

        await TransactionModel.findByIdAndUpdate(
            transaction_id,
            { razorpay_order_id: order.id, payment_status: paymentStatus.INPROGRESS },
            { tenantId: req.tenantId }
        );

        return responseBuilder.sendSuccessResponse(res, {
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID,
        });
    } catch (err) {
        return responseBuilder.sendErrorResponse(res, ERROR.FAILED_TO_CREATE_PAYMENT_ORDER, CONSTANTS.FAILED_TO_CREATE_PAYMENT_ORDER, err);
    }
});

// POST /api/v1/payment/verify
router.post("/verify", async (req, res) => {
    const { order_id, payment_id, signature, transaction_id } = req.body;

    if (
        helper.isEmpty(order_id) ||
        helper.isEmpty(payment_id) ||
        helper.isEmpty(signature) ||
        helper.isEmpty(transaction_id)
    ) {
        return responseBuilder.sendErrorResponse(res, ERROR.MISSING_PARAMETERS, CONSTANTS.MISSING_PARAMETERS);
    }

    try {
        const isValid = verifyPaymentSignature(order_id, payment_id, signature);
        if (!isValid) {
            return responseBuilder.sendErrorResponse(res, ERROR.INVALID_PAYMENT_SIGNATURE, CONSTANTS.INVALID_PAYMENT_SIGNATURE);
        }

        await TransactionModel.findByIdAndUpdate(
            transaction_id,
            {
                razorpay_payment_id: payment_id,
                razorpay_signature: signature,
                payment_status: paymentStatus.SUCCESS,
                payment_mode: paymentMode.ONLINE,
                paid_at: new Date()
            },
            { new: true, tenantId: req.tenantId }
        );

        return responseBuilder.sendSuccessResponse(res, { payment_id });
    } catch (err) {
        return responseBuilder.sendErrorResponse(res, ERROR.PAYMENT_VERIFICATION_FAILED, CONSTANTS.PAYMENT_VERIFICATION_FAILED, err);
    }
});

// POST /api/v1/payment/webhook  (no auth, raw body — bypasses tenant middleware)
router.post("/webhook", async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.body;

    if (!signature) {
        return res.status(400).json({ error: "Missing signature" });
    }

    if (!verifyWebhookSignature(rawBody, signature)) {
        return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const payload = JSON.parse(rawBody.toString());
    const event = payload.event;
    const entity = payload.payload?.payment?.entity;

    try {
        switch (event) {
            case "payment.captured":
                await TransactionModel.findOneAndUpdate(
                    { razorpay_payment_id: entity.id },
                    { payment_status: paymentStatus.SUCCESS, paid_at: new Date(entity.created_at * 1000) }
                );
                break;
            case "payment.failed":
                await TransactionModel.findOneAndUpdate(
                    { razorpay_order_id: entity.order_id },
                    { payment_status: paymentStatus.FAILED, failure_reason: entity.error_description }
                );
                break;
            case "refund.created":
                await TransactionModel.findOneAndUpdate(
                    { razorpay_payment_id: entity.payment_id },
                    { refund_status: refundStatus.PROCESSED, refunded_at: new Date(entity.created_at * 1000) }
                );
                break;
        }
        return res.status(200).json({ status: "ok" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// POST /api/v1/payment/refund
router.post("/refund", async (req, res) => {
    const { payment_id, amount, transaction_id } = req.body;

    if (helper.isEmpty(payment_id) || helper.isEmpty(transaction_id)) {
        return responseBuilder.sendErrorResponse(res, ERROR.MISSING_PARAMETERS, CONSTANTS.MISSING_PARAMETERS);
    }

    try {
        const refund = await refundPayment(payment_id, amount);

        await TransactionModel.findByIdAndUpdate(
            transaction_id,
            {
                refund_id: refund.id,
                refund_status: refundStatus.PENDING,
                refund_amount: amount || refund.amount / 100,
                refunded_at: new Date(),
            },
            { tenantId: req.tenantId }
        );

        return responseBuilder.sendSuccessResponse(res, { refund_id: refund.id, status: refund.status });
    } catch (err) {
        return responseBuilder.sendErrorResponse(res, ERROR.FAILED_TO_REFUND_PAYMENT, CONSTANTS.FAILED_TO_REFUND_PAYMENT, err);
    }
});

// GET /api/v1/payment/details/:payment_id
router.get("/details/:payment_id", async (req, res) => {
    const { payment_id } = req.params;

    try {
        const payment = await fetchPayment(payment_id);
        return responseBuilder.sendSuccessResponse(res, payment);
    } catch (err) {
        return responseBuilder.sendErrorResponse(res, ERROR.FAILED_TO_FETCH_PAYMENT, CONSTANTS.FAILED_TO_FETCH_PAYMENT, err);
    }
});

module.exports = router;
