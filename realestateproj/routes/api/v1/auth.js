var express = require("express");
var router = express.Router();
let helper = require("../../../utilities/helper");
let responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");
const { findUserWithUserName } = require("../../../services/user.services");

router.post("/set-password", async (req, res, next) => {
    let reqBody = {
        username: req.body.username,
        password: req.body.password,
    };
    let { username, password } = reqBody;

    if (helper.isEmpty(username) || helper.isEmpty(password)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    let existingUser = await findUserWithUserName(username);
    existingUser.password = password;

    try {
        await existingUser.save();
        return responseBuilder.sendSuccessResponse(res, existingUser);
    } catch (err) {
        console.log(err);
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_SET_PASSWORD,
            CONSTANTS.FAILED_TO_SET_PASSWORD,
            err
        );
    }
});

module.exports = router;
