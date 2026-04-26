const TenantModel = require("../models/tenant.model");
let responseBuilder = require("../utilities/response-builder");
const ERROR = require("../utilities/error");
const CONSTANTS = require("../utilities/constants");
const { status } = require("../utilities/roles");

async function tenantMiddleware(req, res, next) {
    if (req.path.includes("/tenants")) {
        return next();
    }
    if (req.path.startsWith("/invoices/") && !req.path.startsWith("/api/")) {
        return next();
    }

    const tenantId = req.header("x-tenant-id");
    if (!tenantId) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.UNKNOWN_TENANT,
            CONSTANTS.UNKNOWN_TENANT
        );
    }

    const tenant = await TenantModel.findOne({ tenant_id: tenantId, status: status.ACTIVE });
    console.log("tenantMiddleware -> tenantId:", tenantId, "found:", !!tenant);
    if (!tenant) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.UNKNOWN_TENANT,
            CONSTANTS.UNKNOWN_TENANT
        );
    }

    req.tenantId = tenantId;
    next();
}

module.exports = tenantMiddleware;
