const mongoose = require("mongoose");

const { createBaseSchema } = require("./base.model");
const tenantPlugin = require("../plugins/tenant.plugin");
const hideSecureFieldsPlugin = require("../plugins/hidesecurefields.plugin");
const { status, fileTypes } = require("../utilities/roles");
const CONSTANTS = require("../utilities/constants");

const DocumentSchema = createBaseSchema(
    {
        pid: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
        sid: { type: mongoose.Schema.Types.ObjectId, ref: "Stage" },
        url: { type: String, required: true },
        status: {
            type: String,
            enum: [status.ACTIVE, status.INACTIVE],
            default: status.ACTIVE,
        },
        type: {
            type: String,
            enum: [
                fileTypes.CONSTRUCTION_FILE,
                fileTypes.CONTRACT_FILE,
                fileTypes.IMAGE,
                fileTypes.COMPLAINT_IMAGE,
                fileTypes.PROFILE_ICON,
                fileTypes.PROJECT_ICON,
            ],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Hide secure fields
DocumentSchema.plugin(hideSecureFieldsPlugin, {
    fields: ["tenantId", "__v", "createdAt", "updatedAt", "status"],
});

// Add tenant enforcement plugin
DocumentSchema.plugin(tenantPlugin);

const DocumentModel = mongoose.model("Documents", DocumentSchema);
module.exports = DocumentModel;
