const mongoose = require("mongoose");

const { createBaseSchema } = require("./base.model");
const tenantPlugin = require("../plugins/tenant.plugin");
const hideSecureFieldsPlugin = require("../plugins/hidesecurefields.plugin");
const { status, projectStatus: projectStatus } = require("../utilities/roles");
const CONSTANTS = require("../utilities/constants");

const StageSchema = createBaseSchema(
    {
        p_id: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
        title: { type: String, required: true, unique: true },
        start_date: { type: Date, default: null },
        end_date: { type: Date, default: null },
        estimate: { type: Number, default: 0 },
        total_cost: { type: Number, default: 0 },
        invoice_gen: { type: Number, default: 0 },
        expense: { type: Number, default: 0 },

        s_status: {
            type: String,
            enum: [
                projectStatus.ONGOING,
                projectStatus.ONHOLD,
                projectStatus.COMPLETED,
                projectStatus.ABANDONED,
            ],
            default: projectStatus.ONGOING,
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
StageSchema.plugin(hideSecureFieldsPlugin, {
    fields: ["tenantId", "__v", "createdAt", "updatedAt"],
});

// Add tenant enforcement plugin
StageSchema.plugin(tenantPlugin);

const StageModel = mongoose.model("Stage", StageSchema);
module.exports = StageModel;
