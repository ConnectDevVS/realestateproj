const mongoose = require("mongoose");

const { createBaseSchema } = require("./base.model");
const tenantPlugin = require("../plugins/tenant.plugin");
const hideSecureFieldsPlugin = require("../plugins/hidesecurefields.plugin");
const { status } = require("../utilities/roles");
const CONSTANTS = require("../utilities/constants");

const ProjectChatSchema = createBaseSchema({
    pid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    sid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stage",
        required: false,
        default: null,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
    },
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: [status.ACTIVE, status.INACTIVE],
        default: status.ACTIVE,
    },
    images: [{ type: String, required: false }],
});

// Hide secure fields
ProjectChatSchema.plugin(hideSecureFieldsPlugin, {
    fields: ["tenantId", "__v", "updatedAt"],
});

// Add tenant enforcement plugin
ProjectChatSchema.plugin(tenantPlugin);

const ProjectChatModel = mongoose.model("ProjectChat", ProjectChatSchema);
module.exports = ProjectChatModel;
