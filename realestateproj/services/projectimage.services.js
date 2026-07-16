const mongoose = require("mongoose");

const ProjectDocumentModel = require("../models/projectimage.model");
const helper = require("../utilities/helper");
const { status: documentStatus, fileTypes } = require("../utilities/roles");

async function addProjectImageForTenant(tenantId, requestData) {
    return await ProjectDocumentModel.create({ ...requestData, tenantId });
}

async function addProjectDocumentForTenant(tenantId, requestData) {
    return await ProjectDocumentModel.create({ ...requestData, tenantId });
}

async function findDocumentsForProjectId(tenantId, projectId) {
    if (!helper.isValidMongoId(projectId)) {
        return false;
    }
    const documentsGroupedByType = await ProjectDocumentModel.aggregate(
        [
            {
                $match: {
                    pid: new mongoose.Types.ObjectId(projectId),
                    status: documentStatus.ACTIVE,
                    type: {
                        $in: [
                            fileTypes.CONSTRUCTION_FILES,
                            fileTypes.CONTRACT_FILES,
                            fileTypes.IMAGE,
                            fileTypes.COMPLAINT_IMAGE,
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: "$type",
                    documents: { $push: "$$ROOT" },
                    count: { $sum: 1 },
                },
            },
            {
                $addFields: {
                    type: "$_id",
                },
            },
            {
                $unset: [
                    "_id",
                    "documents.tenantId",
                    "documents.__v",
                    "documents.createdAt",
                    "documents.updatedAt",
                    "documents.status",
                ],
            },
        ],
        { tenantId }
    );
    const grouped = documentsGroupedByType.reduce((acc, item) => {
        acc[item.type] = item.documents;
        return acc;
    }, {});

    return grouped;
}

async function findDocumentsForStageId(tenantId, stageId) {
    if (!helper.isValidMongoId(stageId)) {
        return false;
    }
    const documentsGroupedByType = await ProjectDocumentModel.aggregate(
        [
            {
                $match: {
                    sid: new mongoose.Types.ObjectId(stageId),
                    status: documentStatus.ACTIVE,
                    type: {
                        $in: [
                            fileTypes.CONSTRUCTION_FILES,
                            fileTypes.CONTRACT_FILES,
                            fileTypes.IMAGE,
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: "$type",
                    documents: { $push: "$$ROOT" },
                    count: { $sum: 1 },
                },
            },
            {
                $addFields: {
                    type: "$_id",
                },
            },
            {
                $unset: [
                    "_id",
                    "documents.tenantId",
                    "documents.__v",
                    "documents.createdAt",
                    "documents.updatedAt",
                    "documents.status",
                ],
            },
        ],
        { tenantId }
    );
    const grouped = documentsGroupedByType.reduce((acc, item) => {
        acc[item.type] = item.documents;
        return acc;
    }, {});

    return grouped;
}

module.exports = {
    addProjectImageForTenant,
    addProjectDocumentForTenant,
    findDocumentsForProjectId,
    findDocumentsForStageId,
};
