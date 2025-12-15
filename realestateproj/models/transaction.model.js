const mongoose = require("mongoose");

const { createBaseSchema } = require("./base.model");
const tenantPlugin = require("../plugins/tenant.plugin");
const hideSecureFieldsPlugin = require("../plugins/hidesecurefields.plugin");
const {
    paymentStatus,
    paymentMode,
    transactionType,
    status,
    currency,
} = require("../utilities/roles");
const CONSTANTS = require("../utilities/constants");

const TransactionSchema = createBaseSchema(
    {
        p_id: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
        stage_id: { type: mongoose.Schema.Types.ObjectId, ref: "Stage", default: null },
        amount: { type: Number, required: true, default: 0 },
        from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        transaction_type: {
            type: String,
            enum: [transactionType.ADVANCE, transactionType.REGULAR, paymentStatus.ADDITIONAL],
            default: null,
        },

        note: { type: String, default: "" },
        payment_status: {
            type: String,
            enum: [paymentStatus.SUCCESS, paymentStatus.FAILED, paymentStatus.INPROGRESS],
            default: null,
        },
        payment_mode: {
            type: String,
            enum: [
                paymentMode.ONLINE,
                paymentMode.CASH,
                paymentMode.CHEQUE,
                paymentMode.DD,
                paymentMode.OTHERS,
            ],
            default: null,
        },
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
    }
);

// Hide secure fields
TransactionSchema.plugin(hideSecureFieldsPlugin, {
    fields: ["tenantId", "__v"],
});

// Add tenant enforcement plugin
TransactionSchema.plugin(tenantPlugin);

const TransactionModel = mongoose.model("Transaction", TransactionSchema);
module.exports = TransactionModel;
