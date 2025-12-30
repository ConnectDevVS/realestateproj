var express = require("express");
var router = express.Router();
let helper = require("../../../utilities/helper");
let responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");
const {
    createProjectChat,
    findProjectChatById,
    findProjectChatByProjectId,
    findProjectChatByStageId,
} = require("../../../services/projectchat.services.js");

router.post("/", async (req, res, next) => {
    let reqBody = {
        pid: req.body.pid,
        sid: req.body.sid,
        uid: req.body.uid,
        comment: req.body.comment,
        images: req.body.images,
    };

    if (
        helper.isEmpty(reqBody.pid) ||
        helper.isEmpty(reqBody.uid) ||
        helper.isEmpty(reqBody.comment)
    ) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    try {
        const chat = await createProjectChat(req.tenantId, reqBody);
        if (chat) {
            return responseBuilder.sendSuccessResponse(res, chat);
        }
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_CREATE_PROJECTCHAT,
            CONSTANTS.FAILED_TO_CREATE_PROJECTCHAT,
            err
        );
    }
});

router.get("/project/:id", async (req, res, next) => {
    const { id } = req.params;
    const chats = await findProjectChatByProjectId(id, req.tenantId);
    if (chats) {
        return responseBuilder.sendSuccessResponse(res, chats);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.PROJECTCHAT_NOT_FOUND,
            CONSTANTS.PROJECTCHAT_NOT_FOUND
        );
    }
});

router.get("/stage/:id", async (req, res, next) => {
    const { id } = req.params;
    const chats = await findProjectChatByStageId(id, req.tenantId);
    if (chats) {
        return responseBuilder.sendSuccessResponse(res, chats);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.PROJECTCHAT_NOT_FOUND,
            CONSTANTS.PROJECTCHAT_NOT_FOUND
        );
    }
});

router.get("/:id", async (req, res, next) => {
    const { id } = req.params;

    const chat = await findProjectChatById(req.tenantId, id);
    if (chat) {
        return responseBuilder.sendSuccessResponse(res, chat);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.PROJECTCHAT_NOT_FOUND,
            CONSTANTS.PROJECTCHAT_NOT_FOUND
        );
    }
});

router.delete("/:id", async (req, res, next) => {
    const { id } = req.params;

    const updatedChat = await deleteProjectChatById(id, req.tenantId);
    if (updatedChat) {
        return responseBuilder.sendSuccessResponse(res);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.PROJECTCHAT_NOT_FOUND,
            CONSTANTS.PROJECTCHAT_NOT_FOUND
        );
    }
});
