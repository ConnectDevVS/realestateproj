const ProjectImageModel = require("../models/projectimage.model");
const helper = require("../utilities/helper");
const { status: requestStatus } = require("../utilities/roles");

async function addProjectImageForTenant(tenantId, requestData) {
    return await ProjectImageModel.create({ ...requestData, tenantId });
}

module.exports = {
    addProjectImageForTenant,
};
