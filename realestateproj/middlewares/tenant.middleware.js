const tenants = require("../utilities/tenants");
let responseBuilder = require("../utilities/response-builder");
const ERROR = require("../utilities/error");
const CONSTANTS = require("../utilities/constants");

function tenantMiddleware(req, res, next) {
    const tenantId = req.header("x-tenant-id");
    if (!tenantId || !checkTenantId(tenantId)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.UNKNOWN_TENANT,
            CONSTANTS.UNKNOWN_TENANT
        );
    }
    req.tenantId = tenantId;
    next();
}

function checkTenantId(tenantId) {
    return tenants.some((obj) => obj["tenant_id"] === tenantId);
}

module.exports = tenantMiddleware;
