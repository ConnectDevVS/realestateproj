const mongoose = require("mongoose");

const { createBaseSchema } = require("./base.model");
const tenantPlugin = require("../plugins/tenant.plugin");
const hideSecureFieldsPlugin = require("../plugins/hidesecurefields.plugin");
const { status } = require("../utilities/roles");
const CONSTANTS = require("../utilities/constants");

const SubContractCommentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true,
        trim: true,
    },
    time: {
        type: Date,
        required: true,
        default: Date.now, // stored in UTC
    },
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

const ProjectSubContractSchema = createBaseSchema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
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
        uid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now, // UTC
        },
        progress: {
            type: Number,
            required: false,
            min: 0,
            max: 100,
        },
        comments: {
            type: [SubContractCommentSchema],
            default: [],
        },
        estimate: { type: Number, default: 0, required: false },
        total_cost: { type: Number, default: 0, required: false },
        status: {
            type: String,
            enum: [status.ACTIVE, status.INACTIVE],
            default: status.ACTIVE,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Hide secure fields
ProjectSubContractSchema.plugin(hideSecureFieldsPlugin, {
    fields: ["tenantId", "__v", "createdAt", "updatedAt"],
});

// Add tenant enforcement plugin
ProjectSubContractSchema.plugin(tenantPlugin);

const ProjectSubContractModel = mongoose.model("SubContract", ProjectSubContractSchema);
module.exports = ProjectSubContractModel;
