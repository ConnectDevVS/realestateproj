var express = require("express");
var router = express.Router();
let helper = require("../../../utilities/helper");
let responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");
const {
    createStageForTenant,
    findStageForTenantByProjectId,
    findStageAndUpdateById,
    findStageById,
    deleteStageById,
} = require("../../../services/stage.services");

router.post("/", async (req, res, next) => {
    let reqBody = {
        pid: req.body.pid,
        title: req.body.title,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        estimate: req.body.estimate,
        total_cost: 0,
        invoice_gen: req.body.invoice_gen,
        expense: 0,
        s_status: req.body.s_status,
        members: req.body.members,
    };

    if (
        helper.isEmpty(reqBody.pid) ||
        helper.isEmpty(reqBody.title) ||
        helper.isEmpty(reqBody.start_date) ||
        helper.isEmpty(reqBody.end_date) ||
        helper.isEmpty(reqBody.estimate)
    ) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    try {
        const stage = await createStageForTenant(req.tenantId, reqBody);
        if (stage) {
            return responseBuilder.sendSuccessResponse(res, stage);
        }
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_CREATE_STAGE,
            CONSTANTS.FAILED_TO_CREATE_STAGE,
            err
        );
    }
});

router.get("/project/:id", async (req, res, next) => {
    const { id: pid } = req.params;
    const stages = await findStageForTenantByProjectId(req.tenantId, pid);
    if (stages) {
        return responseBuilder.sendSuccessResponse(res, stages);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.STAGES_NOT_FOUND,
            CONSTANTS.STAGES_NOT_FOUND
        );
    }
});

router.get("/:id", async (req, res, next) => {
    const { id } = req.params;

    const stageDoc = await findStageById(req.tenantId, id);
    if (stageDoc) {
        const stage = stageDoc.toObject();
        stage.total_cost = 0;
        stage.expense = 0;
        return responseBuilder.sendSuccessResponse(res, stage);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.STAGES_NOT_FOUND,
            CONSTANTS.STAGES_NOT_FOUND
        );
    }
});

router.put("/:id", async (req, res, next) => {
    const { id } = req.params;
    let reqBody = {
        pid: req.body.pid,
        title: req.body.title,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        estimate: req.body.estimate,
        total_cost: 0,
        invoice_gen: req.body.invoice_gen,
        expense: 0,
        s_status: req.body.s_status,
        members: req.body.members,
        progress: req.body.progress,
    };
    if (helper.isEmpty(id)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    try {
        const stage = await findStageAndUpdateById(req.tenantId, id, reqBody);
        if (stage) {
            return responseBuilder.sendSuccessResponse(res, stage);
        } else {
            return responseBuilder.sendErrorResponse(
                res,
                ERROR.FAILED_TO_UPDATE_STAGE,
                CONSTANTS.FAILED_TO_UPDATE_STAGE
            );
        }
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_CREATE_STAGE,
            CONSTANTS.FAILED_TO_CREATE_STAGE,
            err
        );
    }
});

router.delete("/:id", async (req, res, next) => {
    const { id } = req.params;

    const transacion = await deleteStageById(req.tenantId, id);
    if (transacion) {
        return responseBuilder.sendSuccessResponse(res);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.STAGES_NOT_FOUND,
            CONSTANTS.STAGES_NOT_FOUND
        );
    }
});

module.exports = router;
