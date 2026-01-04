const mongoose = require("mongoose");

const { createBaseSchema } = require("./base.model");
const tenantPlugin = require("../plugins/tenant.plugin");
const hideSecureFieldsPlugin = require("../plugins/hidesecurefields.plugin");
const { status } = require("../utilities/roles");
const CONSTANTS = require("../utilities/constants");

const InvoiceSchema = createBaseSchema(
    {
        pid: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
        sid: { type: mongoose.Schema.Types.ObjectId, ref: "Stage", default: null },
        transaction_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction",
            required: true,
        },
        url: { type: String, required: true },
        invoice_no: { type: String, required: true },
        tax: { type: Number, default: 15 },
        status: {
            type: String,
            enum: [status.ACTIVE, status.INACTIVE],
            default: status.ACTIVE,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Hide secure fields
InvoiceSchema.plugin(hideSecureFieldsPlugin, {
    fields: ["tenantId", "__v", "updatedAt", "status"],
});

// Add tenant enforcement plugin
InvoiceSchema.plugin(tenantPlugin);

const InvoiceModel = mongoose.model("Invoice", InvoiceSchema);
module.exports = InvoiceModel;
