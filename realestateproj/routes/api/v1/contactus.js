var express = require("express");
var router = express.Router();
let helper = require("../../../utilities/helper");
let responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");
const { sendEmail } = require("../../../services/email.services");

const CONTACT_US_EMAIL = "info@homesyonefourbuilders.com";

router.post("/", async (req, res) => {
    const { name, contact } = req.body;

    if (helper.isEmpty(name) || helper.isEmpty(contact)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    if (req.tenantId !== "tenant-1") {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.UNKNOWN_TENANT,
            CONSTANTS.UNKNOWN_TENANT
        );
    }

    try {
        await sendEmail({
            to: CONTACT_US_EMAIL,
            subject: "New contact info",
            text: `A user named: ${name} tried to contact you. Contact info is ${contact}.`,
            html: `<p>A user named: <strong>${name}</strong> tried to contact you. Contact info is <strong>${contact}</strong>.</p>`,
        });
        return responseBuilder.sendSuccessResponse(res);
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.SOMETHING_WENT_WRONG,
            CONSTANTS.SOMETHING_WENT_WRONG,
            err
        );
    }
});

module.exports = router;
