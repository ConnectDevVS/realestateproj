const RequestModel = require("../models/request.model");
const helper = require("../utilities/helper");
const { status: requestStatus } = require("../utilities/roles");

async function createRequestForTenant(tenantId, requestData) {
    return await RequestModel.create({ ...requestData, tenantId });
}

/**
 * Finds transacion by project
 * @param {String} projectId - The project ID
 * @param {String} teanantId - The tenant ID
 * @returns {Promise<Array>} List of users matching filters
 */
async function findAllRequestForProject(projectId, tenantId) {
    const query = {};
    query.tenantId = tenantId;
    query.pid = projectId;
    query.status = requestStatus.ACTIVE;
    return await RequestModel.find(query, null, { tenantId })
        .populate("requested_by", "name username")
        .populate("updated_by", "name username");
}

/**
 * Finds a single request by their ObjectId
 *
 * @param {String} tenantId - The tenant ID
 * @param {String} requestId - The MongoDB ObjectId of the request
 * @returns {Promise<Object|null>} The request document or null if not found
 */
async function findRequestById(tenantId, requestId) {
    if (!helper.isValidMongoId(requestId)) {
        return false;
    }

    const transacion = await RequestModel.findOne(
        { _id: requestId, status: requestStatus.ACTIVE },
        null,
        {
            tenantId,
        }
    )
        .populate("requested_by", "name username")
        .populate("updated_by", "name username");
    return transacion;
}

/**
 * Finds a single request by their ObjectId and update fields
 *
 * @param {String} tenantId - The tenant ID
 * @param {String} requestId - The MongoDB ObjectId of the request
 * @returns {Promise<Object|null>} The request document or null if not found
 */
async function findRequestAndUpdateById(tenantId, requestId, updateOptions) {
    if (!helper.isValidMongoId(requestId)) {
        return false;
    }

    const request = await RequestModel.findOneAndUpdate({ _id: requestId }, updateOptions, {
        new: true,
        runValidators: true,
        tenantId,
    })
        .populate("requested_by", "name username")
        .populate("updated_by", "name username");

    return request;
}

/**
 * Finds a single request by their ObjectId and update status fields
 *
 * @param {String} tenantId - The tenant ID
 * @param {String} requestId - The MongoDB ObjectId of the request
 * @returns {Promise<Object|null>} The request document or null if not found
 */
async function deleteRequestById(tenantId, requestId) {
    if (!helper.isValidMongoId(requestId)) {
        return false;
    }

    const request = await RequestModel.findOneAndUpdate(
        { _id: requestId },
        { status: requestStatus.INACTIVE },
        {
            runValidators: true,
            tenantId,
        }
    );

    return request;
}

module.exports = {
    createRequestForTenant,
    findAllRequestForProject,
    findRequestById,
    findRequestAndUpdateById,
    deleteRequestById,
};
