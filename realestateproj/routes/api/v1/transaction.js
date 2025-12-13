var express = require("express");
var router = express.Router();
let helper = require("../../../utilities/helper");
let responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");
const {
    createTransactionForTenant,
    findAllTransactionForProject,
    findTransactionById,
    findTransactionAndUpdateById,
    deleteTransactionById,
} = require("../../../services/transaction.services.js");

router.post("/", async (req, res, next) => {
    let reqBody = {
        p_id: req.body.p_id,
        stage_id: req.body.stage_id,
        amount: req.body.amount,
        from: req.body.from,
        to: req.body.to,
        transaction_type: req.body.transaction_type,
        note: req.body.note,
        payment_status: req.body.payment_status,
        payment_mode: req.body.payment_mode,
    };

    if (
        helper.isEmpty(reqBody.p_id) ||
        helper.isEmpty(reqBody.amount) ||
        helper.isEmpty(reqBody.from) ||
        helper.isEmpty(reqBody.to) ||
        helper.isEmpty(reqBody.transaction_type) ||
        helper.isEmpty(reqBody.payment_status || helper.isEmpty(reqBody.payment_mode))
    ) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    try {
        const transacion = await createTransactionForTenant(req.tenantId, reqBody);
        if (transacion) {
            return responseBuilder.sendSuccessResponse(res, transacion);
        }
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_CREATE_TRANSACTION,
            CONSTANTS.FAILED_TO_CREATE_TRANSACTION,
            err
        );
    }
});

router.get("/project/:id", async (req, res, next) => {
    const { id } = req.params;
    const transacions = await findAllTransactionForProject(id, req.tenantId);
    if (transacions) {
        return responseBuilder.sendSuccessResponse(res, transacions);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.TRANSACTIONS_NOT_FOUND,
            CONSTANTS.TRANSACTIONS_NOT_FOUND
        );
    }
});

router.get("/:id", async (req, res, next) => {
    const { id } = req.params;

    const transacion = await findTransactionById(req.tenantId, id);
    if (transacion) {
        return responseBuilder.sendSuccessResponse(res, transacion);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.TRANSACTIONS_NOT_FOUND,
            CONSTANTS.TRANSACTIONS_NOT_FOUND
        );
    }
});

router.put("/:id", async (req, res, next) => {
    const { id } = req.params;
    let reqBody = {
        p_id: req.body.p_id,
        stage_id: req.body.stage_id,
        amount: req.body.amount,
        from: req.body.from,
        to: req.body.to,
        transaction_type: req.body.transaction_type,
        note: req.body.note,
        payment_status: req.body.payment_status,
        payment_mode: req.body.payment_mode,
    };

    if (
        !helper.isValidMongoId(id) ||
        helper.isEmpty(reqBody.p_id) ||
        helper.isEmpty(reqBody.amount) ||
        helper.isEmpty(reqBody.from) ||
        helper.isEmpty(reqBody.to) ||
        helper.isEmpty(reqBody.transaction_type) ||
        helper.isEmpty(reqBody.payment_status || helper.isEmpty(reqBody.payment_mode))
    ) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    try {
        const updatedTransaction = await findTransactionAndUpdateById(req.tenantId, id, reqBody);

        if (updatedTransaction) {
            return responseBuilder.sendSuccessResponse(res, updatedTransaction);
        } else {
            return responseBuilder.sendErrorResponse(
                res,
                ERROR.FAILED_TO_UPDATE_TRANSACTION,
                CONSTANTS.FAILED_TO_UPDATE_TRANSACTION
            );
        }
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_UPDATE_TRANSACTION,
            CONSTANTS.FAILED_TO_UPDATE_TRANSACTION,
            err
        );
    }
});

router.delete("/:id", async (req, res, next) => {
    const { id } = req.params;

    const transacion = await deleteTransactionById(req.tenantId, id);
    if (transacion) {
        return responseBuilder.sendSuccessResponse(res);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.TRANSACTIONS_NOT_FOUND,
            CONSTANTS.TRANSACTIONS_NOT_FOUND
        );
    }
});

module.exports = router;
