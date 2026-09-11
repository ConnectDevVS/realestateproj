const ProjectModel = require("../models/project.model");
const helper = require("../utilities/helper");
const { status: projectActiveStatus } = require("../utilities/roles");

const SORTABLE_FIELDS = {
    title: "title",
    estimate: "estimate",
    amount_recieved: "amount_recieved",
    outstanding: "outstanding",
};

/**
 * Computes tenant-wide financial totals across all active projects.
 *
 * @param {String} tenantId - The tenant ID
 * @returns {Promise<Object>} total_projects, total_estimate, total_amount_recieved, total_outstanding
 */
async function getFinancialSummary(tenantId) {
    const result = await ProjectModel.aggregate([
        { $match: { tenantId, status: projectActiveStatus.ACTIVE } },
        {
            $group: {
                _id: null,
                total_projects: { $sum: 1 },
                total_estimate: { $sum: "$estimate" },
                total_amount_recieved: { $sum: "$amount_recieved" },
            },
        },
    ]);

    const summary = result[0] || { total_projects: 0, total_estimate: 0, total_amount_recieved: 0 };

    return {
        total_projects: summary.total_projects,
        total_estimate: summary.total_estimate,
        total_amount_recieved: summary.total_amount_recieved,
        total_outstanding: summary.total_estimate - summary.total_amount_recieved,
    };
}

/**
 * Finds a paginated, sortable, filterable project-by-project financial breakdown.
 *
 * @param {String} tenantId - The tenant ID
 * @param {Object} options - { page, limit, p_status, sortBy, sortOrder }
 * @returns {Promise<Object>} projects, pagination
 */
async function getFinancialBreakdown(tenantId, options) {
    const { page, limit, p_status, sortBy, sortOrder } = options;

    const match = { tenantId, status: projectActiveStatus.ACTIVE };
    if (!helper.isEmpty(p_status)) {
        match.p_status = p_status;
    }

    const sortField = SORTABLE_FIELDS[sortBy] || SORTABLE_FIELDS.title;
    const sortDirection = sortOrder === "desc" ? -1 : 1;
    const skip = (page - 1) * limit;

    const result = await ProjectModel.aggregate([
        { $match: match },
        { $addFields: { outstanding: { $subtract: ["$estimate", "$amount_recieved"] } } },
        { $sort: { [sortField]: sortDirection, _id: 1 } },
        {
            $facet: {
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: "users",
                            localField: "customer",
                            foreignField: "_id",
                            as: "customer",
                        },
                    },
                    { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            title: 1,
                            p_status: 1,
                            estimate: 1,
                            amount_recieved: 1,
                            outstanding: 1,
                            progress: 1,
                            currency: 1,
                            "customer._id": 1,
                            "customer.name": 1,
                            "customer.username": 1,
                            "customer.email": 1,
                        },
                    },
                ],
                totalCount: [{ $count: "count" }],
            },
        },
    ]);

    const projects = result[0]?.data || [];
    const total = result[0]?.totalCount?.[0]?.count || 0;

    return {
        projects,
        pagination: {
            page,
            limit,
            total,
            total_pages: Math.ceil(total / limit) || 0,
        },
    };
}

module.exports = {
    getFinancialSummary,
    getFinancialBreakdown,
};
