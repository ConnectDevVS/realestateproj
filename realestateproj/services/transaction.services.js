const TransactionModel = require("../models/transaction.model");
const ProjectModel = require("../models/project.model");
const { BUSINESS_ACCOUNT, BUSINESS_NAME, BUSINESS_EMAIL } = require("../utilities/constants");
const helper = require("../utilities/helper");
const { status: transactionStatus, roles: roles, paymentStatus } = require("../utilities/roles");
const { status: userStatus } = require("../utilities/roles");

const { findBusinessAccountUser, createUserForTenant, findUserById } = require("./user.services");

async function _updateProjectFinancials(tenantId, transactionData, fromIsBusinessAccount, toIsBusinessAccount) {
    if (!fromIsBusinessAccount && toIsBusinessAccount) {
        const fromUser = await findUserById(tenantId, transactionData.from.toString());
        if (fromUser?.role === roles.CUSTOMER) {
            await ProjectModel.findByIdAndUpdate(
                transactionData.pid,
                { $inc: { amount_recieved: transactionData.amount } },
                { tenantId }
            );
        }
        return;
    }

    if (fromIsBusinessAccount) {
        const toUser = await findUserById(tenantId, transactionData.to.toString());
        if (toUser?.role !== roles.CUSTOMER) {
            await ProjectModel.findByIdAndUpdate(
                transactionData.pid,
                { $inc: { expense: transactionData.amount } },
                { tenantId }
            );
        }
    }
}

async function createTransactionForTenant(tenantId, transactionData) {
    const fromIsBusinessAccount = transactionData.from.toString() === BUSINESS_ACCOUNT;
    const toIsBusinessAccount = transactionData.to.toString() === BUSINESS_ACCOUNT;

    if (transactionData.from.toString() === BUSINESS_ACCOUNT || toIsBusinessAccount) {
        let homesyBusinessUser = await findBusinessAccountUser(tenantId);

        if (homesyBusinessUser === null) {
            console.log("-----homesyBusinessUser----->", (homesyBusinessUser === null));

            homesyBusinessUser = await createUserForTenant(tenantId, {
                username: BUSINESS_ACCOUNT,
                name: BUSINESS_NAME,
                email: BUSINESS_EMAIL,
                role: roles.BUSINESS_ACCOUNT,
                status: userStatus.UNVERIFIED,
            });

        }
        if (transactionData.from.toString() === BUSINESS_ACCOUNT) {
            transactionData.from = homesyBusinessUser._id.toString();
        }
        if (toIsBusinessAccount) {
            transactionData.to = homesyBusinessUser._id.toString();
        }

    }

    const transaction = await TransactionModel.create({ ...transactionData, tenantId });

    await _updateProjectFinancials(tenantId, transactionData, fromIsBusinessAccount, toIsBusinessAccount);

    return transaction;
}

/**
 * Finds transacion by project
 * @param {String} projectId - The project ID
 * @param {String} teanantId - The tenant ID
 * @returns {Promise<Array>} Finds transacion by project
 */
async function findAllTransactionForProject(projectId, tenantId) {
    if (!helper.isValidMongoId(projectId)) {
        return false;
    }
    const query = {};
    query.tenantId = tenantId;
    query.pid = projectId;
    query.status = transactionStatus.ACTIVE;
    return await TransactionModel.find(query, null, { tenantId })
        .populate("from", "name username email role")
        .populate("to", "name username email role");
}

async function sumCustomerPaymentsForProject(tenantId, projectId) {
    if (!helper.isValidMongoId(projectId)) {
        return false;
    }

    const transactions = await TransactionModel.find(
        { pid: projectId, status: transactionStatus.ACTIVE, payment_status: paymentStatus.SUCCESS },
        null,
        { tenantId }
    )
        .populate("from", "role")
        .populate("to", "role");

    return transactions
        .filter(t => t.from?.role === roles.CUSTOMER && t.to?.role === roles.BUSINESS_ACCOUNT)
        .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Finds transacion by stage
 * @param {String} stageId - The stage ID
 * @param {String} teanantId - The tenant ID
 * @returns {Promise<Array>} Finds transacion by stage
 */
async function findAllTransactionForStage(stageId, tenantId) {
    if (!helper.isValidMongoId(stageId)) {
        return false;
    }
    const query = {};
    query.tenantId = tenantId;
    query.sid = stageId;
    query.status = transactionStatus.ACTIVE;
    return await TransactionModel.find(query, null, { tenantId })
        .populate("from", "name username email role")
        .populate("to", "name username email role");
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
        .populate("from", "name username email role")
        .populate("to", "name username email role");
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

    if (updateOptions.from.toString() === BUSINESS_ACCOUNT || updateOptions.to.toString() === BUSINESS_ACCOUNT) {
        let homesyBusinessUser = await findBusinessAccountUser(tenantId);

        if (!homesyBusinessUser) {
            homesyBusinessUser = await createUserForTenant(tenantId, {
                username: BUSINESS_ACCOUNT,
                name: BUSINESS_NAME,
                email: BUSINESS_EMAIL,
                role: roles.BUSINESS_ACCOUNT,
                status: userStatus.UNVERIFIED,
            });

        }
        if (updateOptions.from.toString() === BUSINESS_ACCOUNT) {
            updateOptions.from = homesyBusinessUser._id.toString();
        }
        if (updateOptions.to.toString() === BUSINESS_ACCOUNT) {
            updateOptions.to = homesyBusinessUser._id.toString();
        }

    }

    const oldTransaction = await TransactionModel.findOne(
        { _id: transactionId },
        null,
        { tenantId }
    );

    if (oldTransaction?.razorpay_payment_id) {
        throw new Error("RAZORPAY_TRANSACTION_CANNOT_EDIT");
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
    sumCustomerPaymentsForProject,
    findAllTransactionForStage,
    findTransactionById,
    findTransactionAndUpdateById,
    deleteTransactionById,
};
