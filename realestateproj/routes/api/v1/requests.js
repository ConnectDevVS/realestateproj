var express = require("express");
var router = express.Router();
let helper = require("../../../utilities/helper");
let responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");
const {
    createRequestForTenant,
    findAllRequestForProject,
    findRequestById,
    findRequestAndUpdateById,
    deleteRequestById,
} = require("../../../services/request.services.js");

router.post("/", async (req, res, next) => {
    let reqBody = {
        pid: req.body.pid,
        sid: req.body.sid,
        title: req.body.title,
        description: req.body.description,
        requested_by: req.body.requested_by,
        request_status: req.body.request_status,
        quantity: req.body.quantity,
        quantity_metric: req.body.quantity_metric,
    };

    if (
        helper.isEmpty(reqBody.pid) ||
        helper.isEmpty(reqBody.sid) ||
        helper.isEmpty(reqBody.title) ||
        helper.isEmpty(reqBody.requested_by) ||
        helper.isEmpty(reqBody.quantity) ||
        helper.isEmpty(reqBody.quantity_metric)
    ) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    try {
        const request = await createRequestForTenant(req.tenantId, reqBody);
        if (request) {
            return responseBuilder.sendSuccessResponse(res, request);
        }
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_CREATE_REQUEST,
            CONSTANTS.FAILED_TO_CREATE_REQUEST,
            err
        );
    }
});

router.get("/project/:id", async (req, res, next) => {
    const { id } = req.params;
    const requests = await findAllRequestForProject(id, req.tenantId);
    if (requests) {
        return responseBuilder.sendSuccessResponse(res, requests);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.REQUEST_NOT_FOUND,
            CONSTANTS.REQUEST_NOT_FOUND
        );
    }
});

router.get("/:id", async (req, res, next) => {
    const { id } = req.params;

    const request = await findRequestById(req.tenantId, id);
    if (request) {
        return responseBuilder.sendSuccessResponse(res, request);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.REQUEST_NOT_FOUND,
            CONSTANTS.REQUEST_NOT_FOUND
        );
    }
});

router.put("/:id", async (req, res, next) => {
    const { id } = req.params;
    let reqBody = {
        title: req.body.title,
        description: req.body.description,
        updated_by: req.body.updated_by,
        request_status: req.body.request_status,
        quantity: req.body.quantity,
        quantity_metric: req.body.quantity_metric,
    };

    if (
        helper.isEmpty(reqBody.title) ||
        helper.isEmpty(reqBody.updated_by) ||
        helper.isEmpty(reqBody.quantity) ||
        helper.isEmpty(reqBody.quantity_metric)
    ) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }
    try {
        const updatedRequest = await findRequestAndUpdateById(req.tenantId, id, reqBody);

        if (updatedRequest) {
            return responseBuilder.sendSuccessResponse(res, updatedRequest);
        } else {
            return responseBuilder.sendErrorResponse(
                res,
                ERROR.FAILED_TO_UPDATE_REQUEST,
                CONSTANTS.FAILED_TO_UPDATE_REQUEST
            );
        }
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_UPDATE_REQUEST,
            CONSTANTS.FAILED_TO_UPDATE_REQUEST,
            err
        );
    }
});

router.delete("/:id", async (req, res, next) => {
    const { id } = req.params;

    const request = await deleteRequestById(req.tenantId, id);
    if (request) {
        return responseBuilder.sendSuccessResponse(res);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.REQUEST_NOT_FOUND,
            CONSTANTS.REQUEST_NOT_FOUND
        );
    }
});

module.exports = router;
