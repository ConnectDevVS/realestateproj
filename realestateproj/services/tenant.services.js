const TenantModel = require("../models/tenant.model");
const helper = require("../utilities/helper");
const { status } = require("../utilities/roles");

async function createTenant(tenantData) {
   return await TenantModel.create(tenantData);
}

/**
 * Finds all active tenants
 * @param {String} tenantId - The tenant ID (for multi-tenancy context)
 * @returns {Promise<Array>} List of all active tenants
 */
async function findAllTenants(tenantId) {
   return await TenantModel.find({ status: status.ACTIVE }, null, { tenantId });
}

/**
 * Finds a single tenant by their ObjectId
 *
 * @param {String} tenantId - The tenant ID (for multi-tenancy context)
 * @param {String} id - The MongoDB ObjectId of the tenant
 * @returns {Promise<Object|null>} The tenant document or null if not found
 */
async function findTenantById(tenantId, id) {
   if (!helper.isValidMongoId(id)) {
      return false;
   }

   return await TenantModel.findOne({ _id: id, status: status.ACTIVE }, null, { tenantId });
}

/**
 * Finds a single tenant by their ObjectId and updates fields
 *
 * @param {String} tenantId - The tenant ID (for multi-tenancy context)
 * @param {String} id - The MongoDB ObjectId of the tenant
 * @param {Object} updateOptions - Fields to update
 * @returns {Promise<Object|null>} The updated tenant document or null if not found
 */
async function findTenantAndUpdateById(tenantId, id, updateOptions) {
   if (!helper.isValidMongoId(id)) {
      return false;
   }

   return await TenantModel.findOneAndUpdate({ _id: id }, updateOptions, {
      new: true,
      runValidators: true,
      tenantId,
   });
}

/**
 * Soft-deletes a tenant by setting their status to INACTIVE
 *
 * @param {String} tenantId - The tenant ID (for multi-tenancy context)
 * @param {String} id - The MongoDB ObjectId of the tenant
 * @returns {Promise<Object|null>} The tenant document before update or null if not found
 */
async function deleteTenantById(tenantId, id) {
   if (!helper.isValidMongoId(id)) {
      return false;
   }

   return await TenantModel.findOneAndUpdate(
      { _id: id },
      { status: status.INACTIVE },
      {
         runValidators: true,
         tenantId,
      }
   );
}

async function findTenantByTenantId(tenantId) {
   return await TenantModel.findOne({ tenant_id: tenantId, status: status.ACTIVE });
}

module.exports = {
   createTenant,
   findAllTenants,
   findTenantById,
   findTenantByTenantId,
   findTenantAndUpdateById,
   deleteTenantById,
};
