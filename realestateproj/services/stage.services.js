const StageModel = require("../models/stage.model");
const helper = require("../utilities/helper");
const { status: stageStatus } = require("../utilities/roles");

async function createStageForTenant(tenantId, stageData) {
    return await StageModel.create({ ...stageData, tenantId });
}

/**
 * Finds a stage for a project
 *
 * @param {String} tenantId - The tenant ID
 * @param {String} projectId - The MongoDB ObjectId of the project
 * @returns {Promise<Object|null>} The stage document or null if not found
 */
async function findStageForTenantByProjectId(tenantId, projectId) {
    if (!helper.isValidMongoId(projectId)) {
        return false;
    }

    const stages = await StageModel.find({ pid: projectId, status: stageStatus.ACTIVE }, null, {
        tenantId,
    }).populate("members", "name username email role "); //-_id;;

    return stages;
}

/**
 * Finds a single stage by their ObjectId
 *
 * @param {String} tenantId - The tenant ID
 * @param {String} stageId - The MongoDB ObjectId of the stage
 * @returns {Promise<Object|null>} The stage document or null if not found
 */
async function findStageById(tenantId, stageId) {
    if (!helper.isValidMongoId(stageId)) {
        return false;
    }

    const stage = await StageModel.findOne({ _id: stageId, status: stageStatus.ACTIVE }, null, {
        tenantId,
    }).populate("members", "name username email role "); //-_id;;

    return stage;
}

/**
 * Finds a single Stage by their ObjectId and update fields
 *
 * @param {String} tenantId - The tenant ID
 * @param {String} stageId - The MongoDB ObjectId of the Stage
 * @returns {Promise<Object|null>} The Stage document or null if not found
 */
async function findStageAndUpdateById(tenantId, stageId, updateOptions) {
    if (!helper.isValidMongoId(stageId)) {
        return false;
    }

    const stage1 = await StageModel.findOne({ _id: stageId });

    const stage = await StageModel.findOneAndUpdate({ _id: stageId }, updateOptions, {
        new: true,
        runValidators: true,
        tenantId,
    });

    return stage;
}

/**
 * Finds a single Transaction by their ObjectId and update status fields
 *
 * @param {String} tenantId - The tenant ID
 * @param {String} stageId - The MongoDB ObjectId of the Stage
 * @returns {Promise<Object|null>} The Transaction document or null if not found
 */
async function deleteStageById(tenantId, stageId) {
    if (!helper.isValidMongoId(stageId)) {
        return false;
    }

    const stage = await StageModel.findOneAndUpdate(
        { _id: stageId },
        { status: stageStatus.INACTIVE },
        {
            runValidators: true,
            tenantId,
        }
    );

    return stage;
}

module.exports = {
    findStageAndUpdateById,
    createStageForTenant,
    findStageForTenantByProjectId,
    findStageById,
    deleteStageById,
};
