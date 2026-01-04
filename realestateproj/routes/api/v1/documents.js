const express = require("express");
const router = express.Router();
const upload = require("../../../middlewares/image.middleware.js");
let helper = require("../../../utilities/helper.js");
let responseBuilder = require("../../../utilities/response-builder.js");
const ERROR = require("../../../utilities/error.js");
const CONSTANTS = require("../../../utilities/constants.js");
const {
    addProjectImageForTenant,
    addProjectDocumentForTenant,
    findDocumentsForProjectId,
    findDocumentsForStageId,
} = require("../../../services/projectimage.services.js");
const roles = require("../../../utilities/roles.js");

router.post("/upload-image", upload.single("image"), async (req, res, next) => {
    var reqBody = {
        pid: req.body.pid,
        sid: req.body.sid,
        type: roles.fileTypes.IMAGE,
    };

    if (helper.isEmpty(reqBody.pid)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    if (helper.isEmpty(reqBody.sid)) {
        reqBody.sid = null;
    }

    try {
        console.log("Heehheheheheeer 1");
        if (!req.file) {
            console.log("Heehheheheheeer 2");

            return responseBuilder.sendErrorResponse(
                res,
                ERROR.FAILED_TO_UPLOAD_IMAGE,
                CONSTANTS.FAILED_TO_UPLOAD_IMAGE
            );
        }

        const imageUrl = `/documents/${req.tenantId}/${req.file.filename}`;
        reqBody.url = imageUrl;
        const imageData = await addProjectImageForTenant(req.tenantId, reqBody);
        console.log("Heehheheheheeer 3");

        return responseBuilder.sendSuccessResponse(res, imageData);
    } catch (err) {
        console.log("Heehheheheheeer 4");

        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_UPLOAD_IMAGE,
            CONSTANTS.FAILED_TO_UPLOAD_IMAGE,
            err
        );
    }
});

router.post("/upload-document", upload.single("document"), async (req, res, next) => {
    var reqBody = {
        pid: req.body.pid,
        sid: req.body.sid,
        type: req.body.type,
    };

    if (helper.isEmpty(reqBody.pid)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }
    if (helper.isEmpty(reqBody.type)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    if (helper.isEmpty(reqBody.sid)) {
        reqBody.sid = null;
    }

    try {
        if (!req.file) {
            return responseBuilder.sendErrorResponse(
                res,
                ERROR.FAILED_TO_UPLOAD_DOCUMENT,
                CONSTANTS.FAILED_TO_UPLOAD_DOCUMENT
            );
        }

        const imageUrl = `/documents/${req.tenantId}/${req.file.filename}`;
        reqBody.url = imageUrl;
        const imageData = await addProjectDocumentForTenant(req.tenantId, reqBody);
        return responseBuilder.sendSuccessResponse(res, imageData);
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_UPLOAD_DOCUMENT,
            CONSTANTS.FAILED_TO_UPLOAD_DOCUMENT,
            err
        );
    }
});

router.get("/project/:id", async (req, res, next) => {
    const { id } = req.params;
    const documents = await findDocumentsForProjectId(req.tenantId, id);
    if (documents) {
        return responseBuilder.sendSuccessResponse(res, documents);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.ERROR_WHILE_FETCHING_IMAGES,
            CONSTANTS.ERROR_WHILE_FETCHING_IMAGES
        );
    }
});

router.get("/stage/:id", async (req, res, next) => {
    const { id } = req.params;
    const documents = await findDocumentsForStageId(req.tenantId, id);
    if (documents) {
        return responseBuilder.sendSuccessResponse(res, documents);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.ERROR_WHILE_FETCHING_IMAGES,
            CONSTANTS.ERROR_WHILE_FETCHING_IMAGES
        );
    }
});
module.exports = router;
