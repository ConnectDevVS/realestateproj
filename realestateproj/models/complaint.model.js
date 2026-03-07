const mongoose = require("mongoose");

const { createBaseSchema } = require("./base.model");
const tenantPlugin = require("../plugins/tenant.plugin");
const hideSecureFieldsPlugin = require("../plugins/hidesecurefields.plugin");
const { status, complaintStatus } = require("../utilities/roles");
const CONSTANTS = require("../utilities/constants");

const ComplaintCommentSchema = new mongoose.Schema({
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

const ComplaintSchema = createBaseSchema(
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
        comments: {
            type: [ComplaintCommentSchema],
            default: [],
        },
        images: {
            type: [String],
            required: false,
        },
        c_status: {
            type: String,
            enum: [complaintStatus.OPEN, complaintStatus.CLOSED],
            default: complaintStatus.OPEN,
        },
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
    }
);

// Hide secure fields
ComplaintSchema.plugin(hideSecureFieldsPlugin, {
    fields: ["tenantId", "__v"],
});

// Add tenant enforcement plugin
ComplaintSchema.plugin(tenantPlugin);

const ComplaintModel = mongoose.model("Complaint", ComplaintSchema);
module.exports = ComplaintModel;
