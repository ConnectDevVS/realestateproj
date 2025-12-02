const ProjectModel = require("../models/project.model");
const helper = require("../utilities/helper");
const { status: projectActiveStatus } = require("../utilities/roles");
const { projectStatus } = require("../utilities/roles");

async function findProjectWithTitle(title, tenantId) {
    return await ProjectModel.findOne({ title: title }, null, { tenantId });
}
async function updateProjectById(reqBody, tenantId) {
    const { id, ...fields } = reqBody;
    // Remove null or undefined fields
    const updateData = Object.fromEntries(
        Object.entries(fields).filter(([_, value]) => value != null)
    );

    if (!helper.isValidMongoId(id)) {
        return false;
    }

    if (!helper.isEmpty(reqBody.customer) && !helper.isValidMongoId(reqBody.customer)) {
        return false;
    }
    return await ProjectModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
        tenantId,
    });
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
    query.status = projectActiveStatus.ACTIVE;
    console.log(query);
    let projects = await ProjectModel.find(query, null, { tenantId }).populate(
        "customer",
        "name username email" //-_id
    );
    console.log("projectActiveStatus.ACTIVE:", projectActiveStatus.ACTIVE);
    const counts = await ProjectModel.aggregate([
        { $match: { status: projectActiveStatus.ACTIVE } },
        { $match: query },
        { $group: { _id: "$p_status", count: { $sum: 1 } } },
        { $group: { _id: null, totalCount: { $sum: "$count" }, breakdown: { $push: "$$ROOT" } } },
    ]);
    return {
        projects: projects,
        counts: { total: counts?.[0]?.totalCount, breakdown: counts?.[0]?.breakdown },
    };
}

/**
 * Finds a project user by their ObjectId
 *
 * @param {String} tenantId - The tenant ID
 * @param {String} projectId - The MongoDB ObjectId of the project
 * @returns {Promise<Object|null>} The project document or null if not found
 */
async function findProjectForTenantById(tenantId, projectId) {
    if (!helper.isValidMongoId(projectId)) {
        return false;
    }

    const project = await ProjectModel.findOne(
        { _id: projectId, status: projectActiveStatus.ACTIVE },
        null,
        { tenantId }
    ).populate("customer", "name username email "); //-_id

    return project;
}

/**
 * Finds a project user by their ObjectId
 *
 * @param {String} tenantId - The tenant ID
 * @param {String} customerId - The MongoDB ObjectId of the customer
 * @returns {Promise<Object|null>} The project document or null if not found
 */
async function findProjectForTenantByCustomerId(tenantId, customerId) {
    if (!helper.isValidMongoId(customerId)) {
        return false;
    }

    const projects = await ProjectModel.find(
        { customer: customerId, status: projectActiveStatus.ACTIVE },
        null,
        { tenantId }
    ).populate("customer", "name username email "); //-_id

    return projects;
}

module.exports = {
    createProjectForTenant,
    findProjectWithTitle,
    findProjetcsForTenantByFilters,
    findProjectForTenantById,
    findProjectForTenantByCustomerId,
    updateProjectById,
};
