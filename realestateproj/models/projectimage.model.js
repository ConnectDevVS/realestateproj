const mongoose = require("mongoose");

const { createBaseSchema } = require("./base.model");
const tenantPlugin = require("../plugins/tenant.plugin");
const hideSecureFieldsPlugin = require("../plugins/hidesecurefields.plugin");
const { status } = require("../utilities/roles");
const CONSTANTS = require("../utilities/constants");

const ImageSchema = createBaseSchema(
    {
        p_id: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
        s_id: { type: mongoose.Schema.Types.ObjectId, ref: "Stage", default: null },
        url: { type: String, required: true },
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
ImageSchema.plugin(hideSecureFieldsPlugin, {
    fields: ["tenantId", "__v", "createdAt", "updatedAt", "status"],
});

// Add tenant enforcement plugin
ImageSchema.plugin(tenantPlugin);

const ImageModel = mongoose.model("Image", ImageSchema);
module.exports = ImageModel;
