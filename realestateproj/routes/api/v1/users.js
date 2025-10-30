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
    findUsersForTenantByFilters,
    findUserById,
    findUserAndUpdateById,
} = require("../../../services/user.services");

router.get("/", async (req, res, next) => {
    const { username, name, email, role } = req.query;

    const users = await findUsersForTenantByFilters(req.tenantId, {
        username,
        name,
        email,
        role,
    });
    if (users) {
        return responseBuilder.sendSuccessResponse(res, users);
    }
});

router.get("/:id", async (req, res, next) => {
    const { id } = req.params;

    const user = await findUserById(req.tenantId, id);
    if (user) {
        return responseBuilder.sendSuccessResponse(res, user);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.USER_NOT_FOUND,
            CONSTANTS.USER_NOT_FOUND
        );
    }
});

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

    const existingUser = await findUserWithUserName(username, req.tenantId);
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

router.post("/set-user-status", async (req, res, next) => {
    let { id, status } = req.body;
    if (helper.isEmpty(id) || helper.isEmpty(status)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    try {
        let isSuccess = await findUserAndUpdateById(req.tenantId, id, { status: status });
        if (!isSuccess) {
            throw new Error(CONSTANTS.USER_NOT_FOUND);
        }
        return responseBuilder.sendSuccessResponse(res);
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_UPDATE_USER,
            CONSTANTS.FAILED_TO_UPDATE_USER,
            err
        );
    }
});

module.exports = router;
