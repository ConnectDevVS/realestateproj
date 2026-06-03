const mongoose = require("mongoose");

const { createBaseSchema } = require("./base.model");
const tenantPlugin = require("../plugins/tenant.plugin");
const hideSecureFieldsPlugin = require("../plugins/hidesecurefields.plugin");
const {
    paymentStatus,
    paymentMode,
    transactionType,
    refundStatus,
    status,
    currency,
} = require("../utilities/roles");
const CONSTANTS = require("../utilities/constants");

const TransactionSchema = createBaseSchema(
    {
        pid: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
        sid: { type: mongoose.Schema.Types.ObjectId, ref: "Stage", default: null },
        subcontract_id: { type: mongoose.Schema.Types.ObjectId, ref: "SubContract", default: null },
        amount: { type: Number, required: true, default: 0 },
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        transaction_type: {
            type: String,
            enum: [transactionType.ADVANCE, transactionType.REGULAR, transactionType.ADDITIONAL],
            default: null,
        },

        note: { type: String, default: "" },
        payment_status: {
            type: String,
            enum: [paymentStatus.SUCCESS, paymentStatus.FAILED, paymentStatus.INPROGRESS, paymentStatus.CANCELLED],
            default: null,
        },
        payment_mode: {
            type: String,
            enum: [
                paymentMode.ONLINE,
                paymentMode.CASH,
                paymentMode.CHEQUE,
                paymentMode.DD,
                paymentMode.OTHERS
            ],
            default: null,
        },
        razorpay_order_id: { type: String, default: null },
        razorpay_payment_id: { type: String, default: null },
        razorpay_signature: { type: String, default: null },
        paid_at: { type: Date, default: null },
        failure_reason: { type: String, default: null },
        refund_id: { type: String, default: null },
        refund_status: {
            type: String,
            enum: [refundStatus.PENDING, refundStatus.PROCESSED, refundStatus.FAILED, null],
            default: null,
        },
        refund_amount: { type: Number, default: 0 },
        refunded_at: { type: Date, default: null },
        status: {
            type: String,
            enum: [status.ACTIVE, status.INACTIVE],
            default: status.ACTIVE,
        },
        currency: {
            type: String,

            default: currency.INR,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Hide secure fields
TransactionSchema.plugin(hideSecureFieldsPlugin, {
    fields: ["tenantId", "__v", "razorpay_signature"],
});

// Add tenant enforcement plugin
TransactionSchema.plugin(tenantPlugin);

const TransactionModel = mongoose.model("Transaction", TransactionSchema);
module.exports = TransactionModel;
