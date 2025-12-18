const ProjectSubContractModel = require("../models/subcontract.model");
const helper = require("../utilities/helper");
const { status: subcontractorStatus } = require("../utilities/roles");
const ERROR = require("../utilities/error");
const CONSTANTS = require("../utilities/constants");

async function createSubcontract(tenantId, subcontractData) {
    return await ProjectSubContractModel.create({ ...subcontractData, tenantId });
}

async function findSubcontractById(tenantId, subcontractId) {
    if (!helper.isValidMongoId(subcontractId)) {
        return false;
    }

    const subcontract = await ProjectSubContractModel.findOne(
        { _id: subcontractId, status: subcontractorStatus.ACTIVE },
        null,
        {
            tenantId,
        }
    );

    return subcontract;
}

async function findSubContractByProjectId(projectId, tenantId) {
    if (!helper.isValidMongoId(projectId)) {
        return false;
    }

    const subcontracts = await ProjectSubContractModel.find(
        { pid: projectId, status: subcontractorStatus.ACTIVE },
        null,
        {
            tenantId,
        }
    );
    return subcontracts;
}

async function findSubContractByStageId(stageId, tenantId) {
    if (!helper.isValidMongoId(stageId)) {
        return false;
    }

    const subcontracts = await ProjectSubContractModel.find(
        { sid: stageId, status: subcontractorStatus.ACTIVE },
        null,
        {
            tenantId,
        }
    );

    return subcontracts;
}

async function findSubContractAndUpdateById(tenantId, subcontractId, updateOptions) {
    if (!helper.isValidMongoId(subcontractId)) {
        return false;
    }
    const subcontract = await ProjectSubContractModel.findOneAndUpdate(
        { _id: subcontractId },
        updateOptions,
        {
            runValidators: true,
            tenantId,
        }
    );

    return subcontract;
}

async function findSubContractAndUpdateCommentsById(tenantId, subcontractId, comment) {
    if (!helper.isValidMongoId(subcontractId)) {
        return false;
    }

    if (!comment || !comment.trim()) {
        throw new Error({
            error: ERROR.SUB_CON_COMMENT_CANNOT_BE_EMPTY,
            message: CONSTANTS.SUBCONTRACT_NOT_FOUND,
        });
    }
    const commentObj = {
        comment: comment.trim(),
        time: new Date(), // UTC
    };

    const subcontract = await ProjectSubContractModel.findOneAndUpdate(
        { _id: subcontractId },
        { $push: { comments: commentObj } },
        {
            new: true,
            runValidators: true,
            tenantId,
        }
    );

    return subcontract;
}

async function deleteSubContractById(subcontractId, tenantId) {
    if (!helper.isValidMongoId(subcontractId)) {
        return false;
    }

    const subcontract = await ProjectSubContractModel.findOneAndUpdate(
        { _id: subcontractId },
        { status: subcontractorStatus.INACTIVE },
        { new: true, runValidators: true, tenantId }
    );
    console.log("---------->", subcontract);

    return subcontract;
}

module.exports = {
    createSubcontract: createSubcontract,
    findSubcontractById: findSubcontractById,
    findSubContractByProjectId: findSubContractByProjectId,
    findSubContractByStageId: findSubContractByStageId,
    findSubContractAndUpdateById: findSubContractAndUpdateById,
    findSubContractAndUpdateCommentsById: findSubContractAndUpdateCommentsById,
    deleteSubContractById: deleteSubContractById,
};
