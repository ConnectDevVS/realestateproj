var express = require("express");
var router = express.Router();
let helper = require("../../../utilities/helper");
let responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");
const { sendOTP } = require("../../../services/email.services");
const { generateOtp } = require("../../../utilities/otp");
const {
    findUsersForTenant,
    createUserForTenant,
    findUserWithUserName,
} = require("../../../services/user.services");

router.post("/", async (req, res, next) => {
    let reqBody = {
        name: req.body.name,
        username: req.body.username,
        role: req.body.role,
        phone_no: req.body.phone_no,
        email: req.body.email,
    };
    let { name, role, phone_no, email, username } = reqBody;

    if (
        helper.isEmpty(username) ||
        helper.isEmpty(name) ||
        helper.isEmpty(role) ||
        helper.isEmpty(email)
    ) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    const existingUser = await findUserWithUserName(username);
    if (existingUser && existingUser.username === username) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.USERNAME_EXISTS,
            CONSTANTS.USERNAME_EXISTS
        );
    }
    const user = await createUserForTenant(req.tenantId, reqBody);
    if (user) {
        return responseBuilder.sendSuccessResponse(res, user);
    }
});

router.post("/check-user", async (req, res, next) => {
    let reqBody = {
        username: req.body.username,
    };
    let { username } = reqBody;

    if (helper.isEmpty(username)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    const existingUser = await findUserWithUserName(username);
    var data = {};
    if (existingUser && existingUser.username === username && existingUser.email) {
        try {
            let otp = generateOtp();
            existingUser.otp = otp;

            sendOTP(otp, existingUser.email);
            await existingUser.save();
            return responseBuilder.sendSuccessResponse(
                res,
                existingUser,
                "Otp will be removed from API response "
            );
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
            ERROR.USERNAME_DOESNT_EXISTS,
            CONSTANTS.USERNAME_DOESNT_EXISTS
        );
    }
});

module.exports = router;
