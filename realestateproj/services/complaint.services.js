const ComplaintModel = require("../models/complaint.model");
const helper = require("../utilities/helper");
const { status: complaintStatus } = require("../utilities/roles");
const ERROR = require("../utilities/error");
const CONSTANTS = require("../utilities/constants");

async function createComplaint(tenantId, complaintData) {
    return await ComplaintModel.create({ ...complaintData, tenantId });
}

async function findComplaintById(tenantId, complaintId) {
    if (!helper.isValidMongoId(complaintId)) {
        return false;
    }

    const complaint = await ComplaintModel.findOne(
        { _id: complaintId, status: complaintStatus.ACTIVE },
        null,
        {
            tenantId,
        },
    ).populate("uid", "name username");

    return complaint;
}

async function findComplaintByProjectId(projectId, tenantId) {
    if (!helper.isValidMongoId(projectId)) {
        return false;
    }

    const complaints = await ComplaintModel.find(
        { pid: projectId, status: complaintStatus.ACTIVE },
        null,
        {
            tenantId,
        },
    );
    return complaints;
}

async function findComplaintByStageId(stageId, tenantId) {
    if (!helper.isValidMongoId(stageId)) {
        return false;
    }

    const complaints = await ComplaintModel.find(
        { sid: stageId, status: complaintStatus.ACTIVE },
        null,
        {
            tenantId,
        },
    );

    return complaints;
}

async function findComplaintAndUpdateById(tenantId, complaintId, updateOptions) {
    if (!helper.isValidMongoId(complaintId)) {
        return false;
    }
    const complaint = await ComplaintModel.findOneAndUpdate({ _id: complaintId }, updateOptions, {
        runValidators: true,
        tenantId,
        new: true,
    });

    return complaint;
}

async function findComplaintAndUpdateCommentsById(tenantId, complaintId, comment) {
    if (!helper.isValidMongoId(complaintId)) {
        return false;
    }

    if (!comment.comment || !comment.comment.trim()) {
        throw new Error({
            error: ERROR.SUB_CON_COMMENT_CANNOT_BE_EMPTY,
            message: CONSTANTS.COMPLAINT_COMMENT_CANNOT_BE_EMPTY,
        });
    }
    const commentObj = {
        comment: comment.trim(),
        time: new Date(), // UTC
        uid: comment.uid,
    };

    const complaint = await ComplaintModel.findOneAndUpdate(
        { _id: complaintId },
        { $push: { comments: commentObj } },
        {
            new: true,
            runValidators: true,
            tenantId,
        },
    );

    return complaint;
}

async function deleteComplaintById(complaintId, tenantId) {
    if (!helper.isValidMongoId(complaintId)) {
        return false;
    }

    const complaint = await ComplaintModel.findOneAndUpdate(
        { _id: complaintId },
        { status: complaintStatus.INACTIVE },
        { new: true, runValidators: true, tenantId },
    );
    console.log("---------->", complaint);

    return complaint;
}

module.exports = {
    createComplaint: createComplaint,
    findComplaintById: findComplaintById,
    findComplaintByProjectId: findComplaintByProjectId,
    findComplaintByStageId: findComplaintByStageId,
    findComplaintAndUpdateById: findComplaintAndUpdateById,
    findComplaintAndUpdateCommentsById: findComplaintAndUpdateCommentsById,
    deleteComplaintById: deleteComplaintById,
};
