const ProjectModel = require("../models/project.model");
const helper = require("../utilities/helper");
const { status: projectStatus } = require("../utilities/roles");

async function findProjectWithTitle(title, tenantId) {
    return await ProjectModel.findOne({ title: title }, null, { tenantId });
}
async function createProjectForTenant(tenantId, userData) {
    return await ProjectModel.create({ ...userData, tenantId });
}

/**
 * Finds projects by tenant and multiple optional filters.
 * Only non-null filters are used in the query.
 *
 * @param {String} tenantId - The tenant ID
 * @param {Object} filters - Example: { status, title}
 * @returns {Promise<Array>} List of projects matching filters
 */
async function findProjetcsForTenantByFilters(tenantId, filters) {
    const query = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value != null));
    query.tenantId = tenantId;
    query.status = projectStatus.ACTIVE;
    console.log(query);
    return await ProjectModel.find(query, null, { tenantId });
}

module.exports = {
    createProjectForTenant,
    findProjectWithTitle,
    findProjetcsForTenantByFilters,
};
