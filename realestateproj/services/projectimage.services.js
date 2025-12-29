const ProjectDocumentModel = require("../models/projectimage.model");
const helper = require("../utilities/helper");

async function addProjectImageForTenant(tenantId, requestData) {
    return await ProjectDocumentModel.create({ ...requestData, tenantId });
}

async function addProjectDocumentForTenant(tenantId, requestData) {
    return await ProjectDocumentModel.create({ ...requestData, tenantId });
}

module.exports = {
    addProjectImageForTenant,
    addProjectDocumentForTenant,
};
