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
} = require("../../../services/projectimage.services.js");
const roles = require("../../../utilities/roles.js");

router.post("/upload-image", upload.single("image"), async (req, res, next) => {
    var reqBody = {
        p_id: req.body.p_id,
        s_id: req.body.s_id,
        type: roles.fileTypes.IMAGE,
    };

    if (helper.isEmpty(reqBody.p_id)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    if (helper.isEmpty(reqBody.s_id)) {
        reqBody.s_id = null;
    }

    try {
        if (!req.file) {
            return responseBuilder.sendErrorResponse(
                res,
                ERROR.FAILED_TO_UPLOAD_IMAGE,
                CONSTANTS.FAILED_TO_UPLOAD_IMAGE
            );
        }

        const imageUrl = `/documents/${req.tenantId}/${req.file.filename}`;
        reqBody.url = imageUrl;
        const imageData = await addProjectImageForTenant(req.tenantId, reqBody);
        return responseBuilder.sendSuccessResponse(res, imageData);
    } catch (err) {
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
        p_id: req.body.p_id,
        s_id: req.body.s_id,
        type: req.body.type,
    };

    if (helper.isEmpty(reqBody.p_id)) {
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

    if (helper.isEmpty(reqBody.s_id)) {
        reqBody.s_id = null;
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

module.exports = router;
