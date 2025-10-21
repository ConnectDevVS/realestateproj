var express = require("express");
var router = express.Router();
let helper = require("../../../utilities/helper");
let responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");

router.get("/", function (req, res, next) {
    res.json({ "CONSTANTS.SUCCESS": "yay" });
});

router.post("/", function (req, res, next) {
    let reqBody = {
        name: req.body.name,
        role: req.body.role,
        phone_no: req.body.phone_no,
        email: req.body.email,
    };
    let { name, role, phone_no, email } = reqBody;

    if (helper.isEmpty(name) || helper.isEmpty(role) || helper.isEmpty(email)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }
    if (helper.isEmpty(phone_no)) {
        phone_no = "";
    }

    return responseBuilder.sendSuccessResponse(res, reqBody);
});

module.exports = router;
