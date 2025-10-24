const mongoose = require("mongoose");
const { createBaseSchema } = require("./base.model");
const tenantPlugin = require("../plugins/tenant.plugin");
const hideSecureFieldsPlugin = require("../plugins/hidesecurefields.plugin");
const { roles } = require("../utilities/roles");
const { userStatus } = require("../utilities/roles");

const UserSchema = createBaseSchema(
    {
        name: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        role: {
            type: String,
            enum: [
                roles.SUPER_ADMIN,
                roles.ADMIN,
                roles.SUPERVISOR,
                roles.ACCOUNTS,
                roles.SUB_CONTRACTOR,
                roles.PURCHASE_MANAGER,
                roles.CUSTOMER,
            ],
            default: roles.ADMIN,
        },
        phone_no: { type: String, default: null },
        email: { type: String, default: null, trim: true },
        password: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: [userStatus.ACTIVE, userStatus.INACTIVE],
            default: userStatus.ACTIVE,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Unique username per tenant
UserSchema.index({ tenantId: 1, username: 1 }, { unique: true });

// Hide secure fields
UserSchema.plugin(hideSecureFieldsPlugin, {
    fields: ["password", "__v", "createdAt", "updatedAt", "tenantId"],
});

// Add tenant enforcement plugin
UserSchema.plugin(tenantPlugin);

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
