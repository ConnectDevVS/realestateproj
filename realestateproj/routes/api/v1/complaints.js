var express = require("express");
var router = express.Router();
let helper = require("../../../utilities/helper");
let responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");
const {
    createComplaint,
    findComplaintByProjectId,
    findComplaintByStageId,
    findComplaintById,
    findComplaintAndUpdateById,
    deleteComplaintById,
    findComplaintAndUpdateCommentsById,
} = require("../../../services/complaint.services.js");

router.post("/", async (req, res, next) => {
    let reqBody = {
        pid: req.body.pid,
        uid: req.body.uid,
        title: req.body.title,
        description: req.body.description,
        images: req.body.images,
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
        const complaint = await createComplaint(req.tenantId, reqBody);
        if (complaint) {
            return responseBuilder.sendSuccessResponse(res, complaint);
        }
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_CREATE_COMPLAINT,
            CONSTANTS.FAILED_TO_CREATE_COMPLAINT,
            err
        );
    }
});

router.get("/project/:id", async (req, res, next) => {
    const { id } = req.params;
    const complaint = await findComplaintByProjectId(id, req.tenantId);
    if (complaint) {
        return responseBuilder.sendSuccessResponse(res, complaint);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.COMPLAINT_NOT_FOUND,
            CONSTANTS.COMPLAINT_NOT_FOUND
        );
    }
});
router.get("/stage/:id", async (req, res, next) => {
    const { id } = req.params;
    const complaint = await findComplaintByStageId(id, req.tenantId);
    if (complaint) {
        return responseBuilder.sendSuccessResponse(res, complaint);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.COMPLAINT_NOT_FOUND,
            CONSTANTS.COMPLAINT_NOT_FOUND
        );
    }
});

router.get("/:id", async (req, res, next) => {
    const { id } = req.params;

    const complaint = await findComplaintById(req.tenantId, id);
    if (complaint) {
        return responseBuilder.sendSuccessResponse(res, complaint);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.COMPLAINT_NOT_FOUND,
            CONSTANTS.COMPLAINT_NOT_FOUND
        );
    }
});

router.put("/:id", async (req, res, next) => {
    const { id } = req.params;
    let reqBody = {
        uid: req.body.uid,
        title: req.body.title,
        description: req.body.description,
        images: req.body.image,
        c_status: req.body.c_status,
    };

    if (
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
        const updatedComplaint = await findComplaintAndUpdateById(req.tenantId, id, reqBody);

        if (updatedComplaint) {
            return responseBuilder.sendSuccessResponse(res, updatedComplaint);
        } else {
            return responseBuilder.sendErrorResponse(
                res,
                ERROR.FAILED_TO_UPDATE_COMPLAINT,
                CONSTANTS.FAILED_TO_UPDATE_COMPLAINT
            );
        }
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_UPDATE_COMPLAINT,
            CONSTANTS.FAILED_TO_UPDATE_COMPLAINT,
            err
        );
    }
});

router.put("/comment/:id", async (req, res, next) => {
    const { id } = req.params;
    let reqBody = {
        comment: req.body.comment,
        uid: req.body.uid,
    };

    if (helper.isEmpty(reqBody.comment) || helper.isEmpty(reqBody.uid)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    try {
        const updatedComplaint = await findComplaintAndUpdateCommentsById(
            req.tenantId,
            id,
            reqBody
        );

        if (updatedComplaint) {
            return responseBuilder.sendSuccessResponse(res, updatedComplaint);
        } else {
            return responseBuilder.sendErrorResponse(
                res,
                ERROR.FAILED_TO_UPDATE_COMPLAINT,
                CONSTANTS.FAILED_TO_UPDATE_COMPLAINT
            );
        }
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_UPDATE_COMPLAINT,
            CONSTANTS.FAILED_TO_UPDATE_COMPLAINT,
            err
        );
    }
});

router.delete("/:id", async (req, res, next) => {
    const { id } = req.params;

    const updatedComplaint = await deleteComplaintById(id, req.tenantId);
    if (updatedComplaint) {
        return responseBuilder.sendSuccessResponse(res);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.COMPLAINT_NOT_FOUND,
            CONSTANTS.COMPLAINT_NOT_FOUND
        );
    }
});

module.exports = router;
