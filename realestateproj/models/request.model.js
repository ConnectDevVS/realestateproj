const mongoose = require("mongoose");

const { createBaseSchema } = require("./base.model");
const tenantPlugin = require("../plugins/tenant.plugin");
const hideSecureFieldsPlugin = require("../plugins/hidesecurefields.plugin");
const { requestStatus, quantityMetric, status } = require("../utilities/roles");
const CONSTANTS = require("../utilities/constants");

const RequestSchema = createBaseSchema(
    {
        p_id: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
        stage_id: { type: mongoose.Schema.Types.ObjectId, ref: "Stage", default: null },
        requested_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

        title: { type: String, default: "" },
        description: { type: String, default: "" },
        quantity: { type: String, default: "" },
        quantity_metric: {
            type: String,
            enum: [
                quantityMetric.BAGS,
                quantityMetric.PACKS,
                quantityMetric.COUNT,
                quantityMetric.LITRE,
                quantityMetric.MILLILITRE,
                quantityMetric.KILOGRAM,
                quantityMetric.GRAM,
            ],
        },

        request_status: {
            type: String,
            enum: [
                requestStatus.ONHOLD,
                requestStatus.APPROVED,
                requestStatus.REJECTED,
                requestStatus.RECEIVED,
            ],
            default: requestStatus.ONHOLD,
        },
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
RequestSchema.plugin(hideSecureFieldsPlugin, {
    fields: ["tenantId", "__v"],
});

// Add tenant enforcement plugin
RequestSchema.plugin(tenantPlugin);

const RequestModel = mongoose.model("Request", RequestSchema);
module.exports = RequestModel;
