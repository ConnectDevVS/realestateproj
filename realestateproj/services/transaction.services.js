const TransactionModel = require("../models/transaction.model");
const helper = require("../utilities/helper");
const { status: transactionStatus } = require("../utilities/roles");

async function createTransactionForTenant(tenantId, transactionData) {
    return await TransactionModel.create({ ...transactionData, tenantId });
}

/**
 * Finds transacion by project
 * @param {String} projectId - The project ID
 * @param {String} teanantId - The tenant ID
 * @returns {Promise<Array>} List of users matching filters
 */
async function findAllTransactionForProject(projectId, tenantId) {
    const query = {};
    query.tenantId = tenantId;
    query.p_id = projectId;
    query.status = transactionStatus.ACTIVE;
    return await TransactionModel.find(query, null, { tenantId })
        .populate("from", "name username")
        .populate("to", "name username");
}

/**
 * Finds a single transaction by their ObjectId
 *
 * @param {String} tenantId - The tenant ID
 * @param {String} transacionId - The MongoDB ObjectId of the transaction
 * @returns {Promise<Object|null>} The transaction document or null if not found
 */
async function findTransactionById(tenantId, transacionId) {
    if (!helper.isValidMongoId(transacionId)) {
        return false;
    }

    const transacion = await TransactionModel.findOne(
        { _id: transacionId, status: transactionStatus.ACTIVE },
        null,
        {
            tenantId,
        }
    )
        .populate("p_id", "title")
        .populate("stage_id", "title")
        .populate("from", "name email")
        .populate("to", "name email");
    return transacion;
}

/**
 * Finds a single Transaction by their ObjectId and update fields
 *
 * @param {String} tenantId - The tenant ID
 * @param {String} transactionId - The MongoDB ObjectId of the Transaction
 * @returns {Promise<Object|null>} The Transaction document or null if not found
 */
async function findTransactionAndUpdateById(tenantId, transactionId, updateOptions) {
    if (!helper.isValidMongoId(transactionId)) {
        return false;
    }

    const transaction = await TransactionModel.findOneAndUpdate(
        { _id: transactionId },
        updateOptions,
        { new: true, runValidators: true, tenantId }
    );

    return transaction;
}

/**
 * Finds a single Transaction by their ObjectId and update status fields
 *
 * @param {String} tenantId - The tenant ID
 * @param {String} transactionId - The MongoDB ObjectId of the Transaction
 * @returns {Promise<Object|null>} The Transaction document or null if not found
 */
async function deleteTransactionById(tenantId, transactionId) {
    if (!helper.isValidMongoId(transactionId)) {
        return false;
    }

    const transaction = await TransactionModel.findOneAndUpdate(
        { _id: transactionId },
        { status: transactionStatus.INACTIVE },
        {
            runValidators: true,
            tenantId,
        }
    );

    return transaction;
}

module.exports = {
    createTransactionForTenant,
    findAllTransactionForProject,
    findTransactionById,
    findTransactionAndUpdateById,
    deleteTransactionById,
};
