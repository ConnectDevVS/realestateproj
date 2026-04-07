var express = require("express");
var router = express.Router();
let helper = require("../../../utilities/helper");
let responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");
const { v4: uuidv4 } = require("uuid");
const { verifyToken, requireRole } = require("../../../middlewares/auth.middleware");
const { roles } = require("../../../utilities/roles");
const {
    createTenant,
    findAllTenants,
    findTenantById,
    findTenantAndUpdateById,
    deleteTenantById,
} = require("../../../services/tenant.services");

router.use(verifyToken, requireRole(roles.SUPER_ADMIN));

router.get("/", async (req, res, next) => {
    const tenants = await findAllTenants(req.tenantId);
    if (tenants) {
        return responseBuilder.sendSuccessResponse(res, tenants);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.TENANT_NOT_FOUND,
            CONSTANTS.TENANT_NOT_FOUND
        );
    }
});

router.get("/:id", async (req, res, next) => {
    const { id } = req.params;

    const tenant = await findTenantById(req.tenantId, id);
    if (tenant) {
        return responseBuilder.sendSuccessResponse(res, tenant);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.TENANT_NOT_FOUND,
            CONSTANTS.TENANT_NOT_FOUND
        );
    }
});

router.post("/", async (req, res, next) => {
    let reqBody = {
        tenant_id: uuidv4(),
        name: req.body.name,
        address: req.body.address,
        contact: req.body.contact,
        email: req.body.email,
    };

    if (helper.isEmpty(reqBody.name) || helper.isEmpty(reqBody.email)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    try {
        const tenant = await createTenant(reqBody);
        if (tenant) {
            return responseBuilder.sendSuccessResponse(res, tenant);
        }
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_CREATE_TENANT,
            CONSTANTS.FAILED_TO_CREATE_TENANT,
            err
        );
    }
});

router.put("/:id", async (req, res, next) => {
    const { id } = req.params;
    let reqBody = {
        name: req.body.name,
        address: req.body.address,
        contact: req.body.contact,
        email: req.body.email,
    };

    if (helper.isEmpty(reqBody.name) || helper.isEmpty(reqBody.email)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    try {
        const updatedTenant = await findTenantAndUpdateById(req.tenantId, id, reqBody);

        if (updatedTenant) {
            return responseBuilder.sendSuccessResponse(res, updatedTenant);
        } else {
            return responseBuilder.sendErrorResponse(
                res,
                ERROR.FAILED_TO_UPDATE_TENANT,
                CONSTANTS.FAILED_TO_UPDATE_TENANT
            );
        }
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_UPDATE_TENANT,
            CONSTANTS.FAILED_TO_UPDATE_TENANT,
            err
        );
    }
});

router.patch("/:id", async (req, res, next) => {
    const { id } = req.params;
    let reqBody = {
        isBilled: req.body.isBilled,
    };

    if (helper.isEmpty(String(reqBody.isBilled))) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    try {
        const updatedTenant = await findTenantAndUpdateById(req.tenantId, id, reqBody);

        if (updatedTenant) {
            return responseBuilder.sendSuccessResponse(res, updatedTenant);
        } else {
            return responseBuilder.sendErrorResponse(
                res,
                ERROR.FAILED_TO_UPDATE_TENANT,
                CONSTANTS.FAILED_TO_UPDATE_TENANT
            );
        }
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_UPDATE_TENANT,
            CONSTANTS.FAILED_TO_UPDATE_TENANT,
            err
        );
    }
});

router.delete("/:id", async (req, res, next) => {
    const { id } = req.params;

    const tenant = await deleteTenantById(req.tenantId, id);
    if (tenant) {
        return responseBuilder.sendSuccessResponse(res);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.TENANT_NOT_FOUND,
            CONSTANTS.TENANT_NOT_FOUND
        );
    }
});

module.exports = router;
