const ProjectChatModel = require("../models/projectchat.model");
const helper = require("../utilities/helper");
const { status: projectchatStatus } = require("../utilities/roles");
const ERROR = require("../utilities/error");
const CONSTANTS = require("../utilities/constants");

async function createProjectChat(tenantId, projectChatData) {
    return await ProjectChatModel.create({ ...projectChatData, tenantId });
}

async function findProjectChatById(tenantId, projectChatId) {
    if (!helper.isValidMongoId(projectChatId)) {
        return false;
    }

    const projectchat = await ProjectChatModel.findOne(
        { _id: projectChatId, status: projectchatStatus.ACTIVE },
        null,
        {
            tenantId,
        }
    );

    return projectchat;
}

async function findProjectChatByProjectId(projectId, tenantId) {
    if (!helper.isValidMongoId(projectId)) {
        return false;
    }

    const projectchats = await ProjectChatModel.find(
        { pid: projectId, status: projectchatStatus.ACTIVE },
        null,
        {
            tenantId,
        }
    );
    return projectchats;
}

async function findProjectChatByStageId(stageId, tenantId) {
    if (!helper.isValidMongoId(stageId)) {
        return false;
    }

    const projectchats = await ProjectChatModel.find(
        { sid: stageId, status: projectchatStatus.ACTIVE },
        null,
        {
            tenantId,
        }
    );

    return projectchats;
}

async function deleteProjectChatById(chatId, tenantId) {
    if (!helper.isValidMongoId(chatId)) {
        return false;
    }

    const chat = await ComplaintModel.findOneAndUpdate(
        { _id: chatId },
        { status: projectchatStatus.INACTIVE },
        { new: true, runValidators: true, tenantId }
    );
    return chat;
}

module.exports = {
    createProjectChat,
    findProjectChatById,
    findProjectChatByProjectId,
    findProjectChatByStageId,
    deleteProjectChatById,
};
