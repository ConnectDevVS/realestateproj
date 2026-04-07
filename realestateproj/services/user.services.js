const UserModel = require("../models/user.model");
const helper = require("../utilities/helper");
const { status: userStatus } = require("../utilities/roles");
const { roles } = require("../utilities/roles");

async function findUserWithUserName(username, tenantId) {
    return await UserModel.findOne(
        {
            username: username,
            role: { $nin: [roles.SUPER_ADMIN, roles.BUSINESS_ACCOUNT] },
            status: {
                $in: [userStatus.ACTIVE, userStatus.UNVERIFIED],
            },
        },
        null,
        {
            tenantId,
        },
    );
}
async function findActiveUserWithUserName(username, tenantId) {
    return await UserModel.findOne(
        {
            username: username,
            role: { $nin: [roles.BUSINESS_ACCOUNT] },
            status: userStatus.ACTIVE,
        },
        null,
        {
            tenantId,
        },
    );
}

async function findUsersForTenant(tenantId) {
    return await UserModel.find(
        {
            role: { $nin: [roles.SUPER_ADMIN, roles.BUSINESS_ACCOUNT] },
            status: userStatus.ACTIVE,
        },
        null,
        { tenantId },
    );
}

async function createUserForTenant(tenantId, userData) {
    return await UserModel.create({ ...userData, tenantId });
}

/**
 * Finds users by tenant and multiple optional filters.
 * Only non-null filters are used in the query.
 *
 * @param {String} tenantId - The tenant ID
 * @param {Object} filters - Example: { username, name, email, role, status }
 * @returns {Promise<Array>} List of users matching filters
 */
async function findUsersForTenantByFilters(tenantId, filters, includeunverified) {
    const query = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value != null));
    query.role = { $nin: [roles.SUPER_ADMIN, roles.BUSINESS_ACCOUNT] };
    query.tenantId = tenantId;
    if (includeunverified) {
        query.status = {
            $in: [userStatus.ACTIVE, userStatus.UNVERIFIED],
        };
    } else {
        query.status = userStatus.ACTIVE;
    }
    console.log(query);
    return await UserModel.find(query, null, { tenantId });
}

/**
 * Finds a single user by their ObjectId
 *
 * @param {String} tenantId - The tenant ID
 * @param {String} userId - The MongoDB ObjectId of the user
 * @returns {Promise<Object|null>} The user document or null if not found
 */
async function findUserById(tenantId, userId) {
    if (!helper.isValidMongoId(userId)) {
        return false;
    }

    const user = await UserModel.findOne(
        {
            _id: userId,
            role: { $nin: [roles.SUPER_ADMIN, roles.BUSINESS_ACCOUNT] },
            status: userStatus.ACTIVE,
        },
        null,
        { tenantId },
    );

    return user;
}

/**
 * Finds a single user by their ObjectId and update fields
 *
 * @param {String} tenantId - The tenant ID
 * @param {String} userId - The MongoDB ObjectId of the user
 * @returns {Promise<Object|null>} The user document or null if not found
 */
async function findUserAndUpdateById(tenantId, userId, updateOptions) {
    if (!helper.isValidMongoId(userId)) {
        return false;
    }

    const user = await UserModel.findOneAndUpdate({ _id: userId }, updateOptions, {
        runValidators: true,
        tenantId,
        new: true,
    });

    return user;
}

module.exports = {
    findUsersForTenant,
    createUserForTenant,
    findUserWithUserName,
    findActiveUserWithUserName,
    findUsersForTenantByFilters,
    findUserById,
    findUserAndUpdateById,
};
