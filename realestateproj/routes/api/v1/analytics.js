var express = require("express");
var router = express.Router();
let responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");
const { verifyToken, requireRole } = require("../../../middlewares/auth.middleware");
const { roles } = require("../../../utilities/roles");
const { getFinancialSummary, getFinancialBreakdown } = require("../../../services/analytics.services");

const MAX_LIMIT = 100;

router.use(verifyToken, requireRole(roles.ADMIN, roles.SUPER_ADMIN));

router.get("/financial-summary", async (req, res, next) => {
    try {
        const summary = await getFinancialSummary(req.tenantId);
        return responseBuilder.sendSuccessResponse(res, summary);
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_FETCH_ANALYTICS,
            CONSTANTS.FAILED_TO_FETCH_ANALYTICS,
            err,
        );
    }
});

router.get("/financial-breakdown", async (req, res, next) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), MAX_LIMIT);
    const { p_status, sort_by: sortBy, sort_order: sortOrder } = req.query;

    try {
        const breakdown = await getFinancialBreakdown(req.tenantId, {
            page,
            limit,
            p_status,
            sortBy,
            sortOrder,
        });
        return responseBuilder.sendSuccessResponse(res, breakdown);
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_FETCH_ANALYTICS,
            CONSTANTS.FAILED_TO_FETCH_ANALYTICS,
            err,
        );
    }
});

module.exports = router;
