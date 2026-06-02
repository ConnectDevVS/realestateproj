var express = require("express");
var router = express.Router();
let helper = require("../../../utilities/helper");
let responseBuilder = require("../../../utilities/response-builder");
const { status: userStatus } = require("../../../utilities/roles");
const { sendOTP } = require("../../../services/email.services");
const { generateOtp } = require("../../../utilities/otp");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");
const {
    findUserWithUserName,
    findActiveUserWithUserName,
} = require("../../../services/user.services");
const { generateToken } = require("../../../services/auth.services");
const roles = require("../../../utilities/roles");

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

        existingUser.password = await existingUser.hashPassword(password);
        existingUser.access_token = generateToken(existingUser);
        existingUser.otp = null;
        existingUser.status = userStatus.ACTIVE;

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

router.post("/reset-password", async (req, res, next) => {
    let reqBody = {
        username: req.body.username,
    };
    let { username } = reqBody;

    if (helper.isEmpty(reqBody.username)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    let existingUser = await findUserWithUserName(reqBody.username);

    if (existingUser && existingUser.username === username && existingUser.email) {
        existingUser.status = userStatus.RESETPASSWORD;
        try {
            let otp = generateOtp();
            existingUser.otp = otp;

            sendOTP(otp, existingUser.email);
            await existingUser.save();
            return responseBuilder.sendSuccessResponse(
                res,
                existingUser,
                "Otp will be removed from API response ",
            );
        } catch (err) {
            console.log(err);
            return responseBuilder.sendErrorResponse(
                res,
                ERROR.FAILED_TO_SET_PASSWORD,
                CONSTANTS.FAILED_TO_SET_PASSWORD,
                err,
            );
        }
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.USERNAME_DOESNT_EXISTS,
            CONSTANTS.USERNAME_DOESNT_EXISTS,
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

    let existingUser = await findActiveUserWithUserName(username);

    if (
        !existingUser ||
        helper.isEmpty(existingUser.password) ||
        !(await existingUser.correctPassword(password))
    ) {
        return responseBuilder.sendErrorResponseWithStatusCode(
            res,
            ERROR.INVALID_CREDENTIALS,
            CONSTANTS.INVALID_CREDENTIALS,
            401
        );
    }

    existingUser.access_token = generateToken(existingUser);
    // If a user has tried to reset password, but logs in again, set status to ACTIVE
    if (existingUser.status === userStatus.RESETPASSWORD) {
        existingUser.status = userStatus.ACTIVE;
    }

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
