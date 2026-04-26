const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { createBaseSchema } = require("./base.model");
const tenantPlugin = require("../plugins/tenant.plugin");
const hideSecureFieldsPlugin = require("../plugins/hidesecurefields.plugin");
const { roles } = require("../utilities/roles");
const { status } = require("../utilities/roles");

const UserSchema = createBaseSchema(
    {
        name: { type: String, required: true },
        username: { type: String, required: true },
        role: {
            type: String,
            enum: [
                roles.SUPER_ADMIN,
                roles.BUSINESS_ACCOUNT,
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
        image: { type: String, default: null },
        access_token: { type: String, default: null },
        password: {
            type: String,
            minlength: 8,
        },
        otp: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: [status.ACTIVE, status.INACTIVE, status.UNVERIFIED],
            default: status.ACTIVE,
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
    fields: ["password", "__v", "createdAt", "updatedAt"],
});

// Add tenant enforcement plugin
UserSchema.plugin(tenantPlugin);


//compare password
UserSchema.methods.hashPassword = async function (candidatePassword) {
    return await bcrypt.hash(candidatePassword, 12);
};



//compare password
UserSchema.methods.correctPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
