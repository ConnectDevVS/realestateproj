const mongoose = require("mongoose");

const { createBaseSchema } = require("./base.model");
const tenantPlugin = require("../plugins/tenant.plugin");
const hideSecureFieldsPlugin = require("../plugins/hidesecurefields.plugin");
const { projectStatus, currency } = require("../utilities/roles");
const { status } = require("../utilities/roles");

const ProjectSchema = createBaseSchema(
    {
        title: { type: String, required: true },
        p_status: {
            type: String,
            enum: [
                projectStatus.ONGOING,
                projectStatus.ONHOLD,
                projectStatus.COMPLETED,
                projectStatus.ABANDONED,
            ],
            default: projectStatus.ONGOING,
        },
        customer: { type: String, required: true },
        location: { type: String, required: true },
        start_date: { type: Date, default: null },
        end_date: { type: Date, default: null },
        estimate: { type: String, default: "" },
        currency: { type: String, default: currency.INR },
        image: { type: String },
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

// Unique projectname per tenant
ProjectSchema.index({ tenantId: 1, title: 1 }, { unique: true });

// Hide secure fields
ProjectSchema.plugin(hideSecureFieldsPlugin, {
    fields: ["tenantId", "__v", "createdAt", "updatedAt"],
});

// Add tenant enforcement plugin
ProjectSchema.plugin(tenantPlugin);

const ProjectModel = mongoose.model("Project", ProjectSchema);
module.exports = ProjectModel;
