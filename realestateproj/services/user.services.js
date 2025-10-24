const UserModel = require("../models/user.model");

async function findUserWithUserName(username, tenantId) {
    return await UserModel.findOne({ username: username }, null, { tenantId });
}

async function findUsersForTenant(tenantId) {
    return await UserModel.find({}, null, { tenantId });
}

async function createUserForTenant(tenantId, userData) {
    return await UserModel.create({ ...userData, tenantId });
}

module.exports = { findUsersForTenant, createUserForTenant, findUserWithUserName };
