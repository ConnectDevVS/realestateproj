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
        pid: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
        sid: { type: mongoose.Schema.Types.ObjectId, ref: "Stage", default: null },
        subcontract_id: { type: mongoose.Schema.Types.ObjectId, ref: "SubContract", default: null },
        amount: { type: Number, required: true, default: 0 },
        from: { type: mongoose.Schema.Types.Mixed, 
                required: true,
                validate: {
                 validator: async function (v) {
                // allow special string
                if (v === "HOMESY_BUSINESS") return true;

                // check if valid ObjectId
                if (!mongoose.Types.ObjectId.isValid(v)) return false;

                // check if User exists
                const user = await mongoose.model("User").exists({ _id: v });
                return !!user;
            },
            message: "from must be 'HOMESY_BUSINESS' or a valid User ObjectId"
        }},
        to: { type: mongoose.Schema.Types.Mixed, 
                required: true,
                validate: {
                 validator: async function (v) {
                // allow special string
                if (v === "HOMESY_BUSINESS") return true;

                // check if valid ObjectId
                if (!mongoose.Types.ObjectId.isValid(v)) return false;

                // check if User exists
                const user = await mongoose.model("User").exists({ _id: v });
                return !!user;
            },
            message: "to must be 'HOMESY_BUSINESS' or a valid User ObjectId"
        }},
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
    },
);

// Hide secure fields
TransactionSchema.plugin(hideSecureFieldsPlugin, {
    fields: ["tenantId", "__v"],
});

// Add tenant enforcement plugin
TransactionSchema.plugin(tenantPlugin);

const TransactionModel = mongoose.model("Transaction", TransactionSchema);
module.exports = TransactionModel;
