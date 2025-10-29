const ProjectModel = require("../models/project.model");
const helper = require("../utilities/helper");

async function findProjectWithTitle(title, tenantId) {
    return await ProjectModel.findOne({ title: title }, null, { tenantId });
}
async function createProjectForTenant(tenantId, userData) {
    return await ProjectModel.create({ ...userData, tenantId });
}

module.exports = {
    createProjectForTenant,
    findProjectWithTitle,
};
