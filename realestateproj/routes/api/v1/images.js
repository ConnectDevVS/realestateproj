const express = require("express");
const router = express.Router();
const upload = require("../../../middlewares/image.middleware");
let helper = require("../../../utilities/helper");
let responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");
const { addProjectImageForTenant } = require("../../../services/projectimage.services.js");

router.post("/upload-image", upload.single("image"), async (req, res, next) => {
    var reqBody = {
        p_id: req.body.p_id,
        s_id: req.body.s_id,
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

        const imageUrl = `/images/${req.tenantId}/${req.file.filename}`;
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

module.exports = router;
