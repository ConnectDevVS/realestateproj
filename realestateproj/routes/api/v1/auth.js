var express = require("express");
var router = express.Router();
let helper = require("../../../utilities/helper");
let responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");
const { findUserWithUserName } = require("../../../services/user.services");
const { generateToken } = require("../../../services/auth.services");

router.post("/set-password", async (req, res, next) => {
    let reqBody = {
        username: req.body.username,
        password: req.body.password,
        otp: req.body.otp,
    };
    let { username, password, otp } = reqBody;

    if (helper.isEmpty(username) || helper.isEmpty(password) || helper.isEmpty(otp)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    let existingUser = await findUserWithUserName(username);

    if (existingUser && existingUser.username === username && existingUser.otp === otp) {
        existingUser.password = password;
        existingUser.access_token = generateToken(existingUser);
        existingUser.otp = null;
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
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_SET_PASSWORD,
            CONSTANTS.FAILED_TO_SET_PASSWORD
        );
    }
});

router.post("/login", async (req, res, next) => {
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

    if (
        !existingUser ||
        helper.isEmpty(existingUser.password) ||
        !(await existingUser.correctPassword(password))
    ) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.INVALID_CREDENTIALS,
            CONSTANTS.INVALID_CREDENTIALS
        );
    }

    existingUser.access_token = generateToken(existingUser);

    try {
        await existingUser.save();
        return responseBuilder.sendSuccessResponse(res, existingUser);
    } catch (err) {
        console.log(err);
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_LOGIN,
            CONSTANTS.FAILED_TO_LOGIN,
            err
        );
    }
});

module.exports = router;
