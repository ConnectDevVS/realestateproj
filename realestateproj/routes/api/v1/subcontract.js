var express = require("express");
var router = express.Router();
let helper = require("../../../utilities/helper");
let responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");
const {
    createSubcontract,
    findSubContractByProjectId,
    findSubContractByStageId,
    findSubcontractById,
    findSubContractAndUpdateById,
    deleteSubContractById,
    findSubContractAndUpdateCommentsById,
} = require("../../../services/subcontract.services.js");

router.post("/", async (req, res, next) => {
    let reqBody = {
        pid: req.body.pid,
        sid: req.body.sid,
        uid: req.body.uid,
        title: req.body.title,
        description: req.body.description,
    };

    if (
        helper.isEmpty(reqBody.pid) ||
        helper.isEmpty(reqBody.sid) ||
        helper.isEmpty(reqBody.uid) ||
        helper.isEmpty(reqBody.title) ||
        helper.isEmpty(reqBody.description)
    ) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    try {
        const subcontract = await createSubcontract(req.tenantId, reqBody);
        if (subcontract) {
            return responseBuilder.sendSuccessResponse(res, subcontract);
        }
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_CREATE_SUBCONTRACT,
            CONSTANTS.FAILED_TO_CREATE_SUBCONTRACT,
            err
        );
    }
});

router.get("/project/:id", async (req, res, next) => {
    const { id } = req.params;
    const subcontract = await findSubContractByProjectId(id, req.tenantId);
    if (subcontract) {
        return responseBuilder.sendSuccessResponse(res, subcontract);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.SUBCONTRACT_NOT_FOUND,
            CONSTANTS.SUBCONTRACT_NOT_FOUND
        );
    }
});
router.get("/stage/:id", async (req, res, next) => {
    const { id } = req.params;
    const subcontract = await findSubContractByStageId(id, req.tenantId);
    if (subcontract) {
        return responseBuilder.sendSuccessResponse(res, subcontract);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.SUBCONTRACT_NOT_FOUND,
            CONSTANTS.SUBCONTRACT_NOT_FOUND
        );
    }
});

router.get("/:id", async (req, res, next) => {
    const { id } = req.params;

    const subcontract = await findSubcontractById(req.tenantId, id);
    if (subcontract) {
        return responseBuilder.sendSuccessResponse(res, subcontract);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.SUBCONTRACT_NOT_FOUND,
            CONSTANTS.SUBCONTRACT_NOT_FOUND
        );
    }
});

router.put("/:id", async (req, res, next) => {
    const { id } = req.params;
    let reqBody = {
        uid: req.body.uid,
        title: req.body.title,
        description: req.body.description,
        progress: req.body.progress,
    };

    if (
        helper.isEmpty(reqBody.uid) ||
        helper.isEmpty(reqBody.title) ||
        helper.isEmpty(reqBody.description) ||
        helper.isEmpty(reqBody.progress)
    ) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    try {
        const updatedSubContract = await findSubContractAndUpdateById(req.tenantId, id, reqBody);

        if (updatedSubContract) {
            return responseBuilder.sendSuccessResponse(res, updatedSubContract);
        } else {
            return responseBuilder.sendErrorResponse(
                res,
                ERROR.FAILED_TO_UPDATE_SUBCONTRACT,
                CONSTANTS.FAILED_TO_UPDATE_SUBCONTRACT
            );
        }
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_UPDATE_SUBCONTRACT,
            CONSTANTS.FAILED_TO_UPDATE_SUBCONTRACT,
            err
        );
    }
});

router.put("/comment/:id", async (req, res, next) => {
    const { id } = req.params;
    let reqBody = {
        comment: req.body.comment,
    };

    if (helper.isEmpty(reqBody.comment)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    try {
        const updatedSubContract = await findSubContractAndUpdateCommentsById(
            req.tenantId,
            id,
            reqBody.comment
        );

        if (updatedSubContract) {
            return responseBuilder.sendSuccessResponse(res, updatedSubContract);
        } else {
            return responseBuilder.sendErrorResponse(
                res,
                ERROR.FAILED_TO_UPDATE_SUBCONTRACT,
                CONSTANTS.FAILED_TO_UPDATE_SUBCONTRACT
            );
        }
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_UPDATE_SUBCONTRACT,
            CONSTANTS.FAILED_TO_UPDATE_SUBCONTRACT,
            err
        );
    }
});

router.delete("/:id", async (req, res, next) => {
    const { id } = req.params;

    const updatedSubContract = await deleteSubContractById(id, req.tenantId);
    if (updatedSubContract) {
        return responseBuilder.sendSuccessResponse(res);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.SUBCONTRACT_NOT_FOUND,
            CONSTANTS.SUBCONTRACT_NOT_FOUND
        );
    }
});

module.exports = router;
