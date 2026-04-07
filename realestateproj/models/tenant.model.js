const mongoose = require("mongoose");

const hideSecureFieldsPlugin = require("../plugins/hidesecurefields.plugin");
const { status, billingStatus } = require("../utilities/roles");
const CONSTANTS = require("../utilities/constants");

const TenantSchema = new mongoose.Schema(
   {
      tenant_id: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      address: { type: String },
      contact: { type: String },
      email: { type: String, required: true, unique: true },
      status: {
         type: String,
         enum: [status.ACTIVE, status.INACTIVE],
         default: status.ACTIVE,
      },
      isBilled: { type: Boolean, default: false },
      billing_status: {
         type: String,
         enum: [billingStatus.ACTIVE, billingStatus.UNBILLED, billingStatus.TRIAL, billingStatus.OVERDUE, billingStatus.CANCELLED],
         default: billingStatus.UNBILLED,
      },
   },
   { id: false }
)
// Hide secure fields
TenantSchema.plugin(hideSecureFieldsPlugin, {
   fields: ["__v"],
});

const TenantModel = mongoose.model("Tenant", TenantSchema);
module.exports = TenantModel;