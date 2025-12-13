const mongoose = require("mongoose");

const { createBaseSchema } = require("./base.model");
const tenantPlugin = require("../plugins/tenant.plugin");
const hideSecureFieldsPlugin = require("../plugins/hidesecurefields.plugin");
const { status } = require("../utilities/roles");
const CONSTANTS = require("../utilities/constants");

const TeamSchema = createBaseSchema(
    {
        p_id: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
        members: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            required: true,
            validate: {
                validator: function (arr) {
                    return Array.isArray(arr) && arr.length > 0;
                },
                message: CONSTANTS.MEMBERS_CANNOT_BE_EMPTY,
            },
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
TeamSchema.plugin(hideSecureFieldsPlugin, {
    fields: ["tenantId", "__v", "createdAt", "updatedAt"],
});

// Add tenant enforcement plugin
TeamSchema.plugin(tenantPlugin);

const TeamModel = mongoose.model("Team", TeamSchema);
module.exports = TeamModel;
