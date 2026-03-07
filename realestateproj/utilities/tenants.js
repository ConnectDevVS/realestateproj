/* File Name  : tenants.js
 * Created By : Vishnu Satheesh
 * Date       : Jan 04 2026
 * Purpose    : Holds Configuration For Multi Tenant Setup
 *              Need to be moved to a database collections when new tenants join
 */

module.exports = Object.freeze([
    {
        idx: 1,
        tenant_name: "Homesy Test Tenant",
        tenant_id: "tenant-1",
    },
    {
        idx: 2,
        tenant_name: "Homesy Business",
        tenant_id: "bc4be9ac-e1b4-4cdc-8cad-bf0cb958ea1e",
    },
]);
