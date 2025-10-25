const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
            validate: {
                validator: function (value) {
                    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
                        value
                    );
                },
                message:
                    "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
            },
        },
        otp: {
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
    fields: ["otp", "password", "__v", "createdAt", "updatedAt", "tenantId"],
});

// Add tenant enforcement plugin
UserSchema.plugin(tenantPlugin);

// hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

//compare password
UserSchema.methods.correctPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
