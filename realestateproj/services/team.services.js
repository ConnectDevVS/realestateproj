const TeamModel = require("../models/team.model");
const helper = require("../utilities/helper");
const { status: teamStatus } = require("../utilities/roles");

async function createTeamForTenant(tenantId, teamData) {
    return await TeamModel.create({ ...teamData, tenantId });
}

/**
 * Finds teams by tenant
 *
 * @param {String} tenantId - The tenant ID
 * @returns {Promise<Array>} List of users matching filters
 */
async function findAllTeamsForTenant(tenantId) {
    const query = {};
    query.tenantId = tenantId;
    query.status = teamStatus.ACTIVE;
    return await TeamModel.find(query, null, { tenantId }).populate(
        "members",
        "name username email role "
    ); //-_id;
}

/**
 * Finds a single team by their ObjectId
 *
 * @param {String} tenantId - The tenant ID
 * @param {String} teamId - The MongoDB ObjectId of the team
 * @returns {Promise<Object|null>} The team document or null if not found
 */
async function findTeamById(tenantId, teamId) {
    if (!helper.isValidMongoId(teamId)) {
        return false;
    }

    const team = await TeamModel.findOne({ _id: teamId, status: teamStatus.ACTIVE }, null, {
        tenantId,
    }).populate("members", "name username email role "); //-_id;

    return team;
}

/**
 * Finds a single team by their ObjectId and update fields
 *
 * @param {String} tenantId - The tenant ID
 * @param {String} teamId - The MongoDB ObjectId of the team
 * @returns {Promise<Object|null>} The team document or null if not found
 */
async function findTeamAndUpdateById(tenantId, teamId, updateOptions) {
    if (!helper.isValidMongoId(teamId)) {
        return false;
    }

    const team = await TeamModel.findOneAndUpdate({ _id: teamId }, updateOptions, {
        runValidators: true,
        tenantId,
    });

    return team;
}

/**
 * Finds a team for a project
 *
 * @param {String} tenantId - The tenant ID
 * @param {String} projectId - The MongoDB ObjectId of the project
 * @returns {Promise<Object|null>} The Team document or null if not found
 */
async function findTeamForTenantByProjectId(tenantId, projectId) {
    if (!helper.isValidMongoId(projectId)) {
        return false;
    }

    const teams = await TeamModel.find({ p_id: projectId, status: teamStatus.ACTIVE }, null, {
        tenantId,
    }).populate("members", "name username email role "); //-_id

    return teams;
}

module.exports = {
    createTeamForTenant,
    findTeamById,
    findTeamAndUpdateById,
    findTeamForTenantByProjectId,
    findAllTeamsForTenant,
};
