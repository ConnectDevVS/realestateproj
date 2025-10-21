var express = require("express");
var router = express.Router();
let helper = require("../../../utilities/helper");
let responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");

router.post("/setpassword", function (req, res, next) {
    let reqBody = {
        phone_no: req.body.ph_no,
        password: req.body.password,
        otp: req.body.otp,
    };
    let { phone_no, password, otp } = reqBody;

    if (helper.isEmpty(phone_no) || helper.isEmpty(password) || helper.isEmpty(otp)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    return responseBuilder.sendSuccessResponse(res, { user: "new user" });
});

module.exports = router;
