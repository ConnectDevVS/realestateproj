var express = require("express");
var router = express.Router();
let helper = require("../../../utilities/helper");
let responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");
const {
    createTeamForTenant,
    findTeamById,
    findTeamAndUpdateById,
    findTeamForTenantByProjectId,
    findAllTeamsForTenant,
} = require("../../../services/team.services");

router.post("/", async (req, res, next) => {
    let reqBody = {
        p_id: req.body.p_id,
        members: req.body.members,
    };
    let { p_id, members } = reqBody;

    if (!helper.validateObjectIdArray(members)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    if (helper.isEmpty(p_id)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    try {
        const team = await createTeamForTenant(req.tenantId, reqBody);
        if (team) {
            return responseBuilder.sendSuccessResponse(res, team);
        }
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_CREATE_TEAM,
            CONSTANTS.FAILED_TO_CREATE_TEAM,
            err
        );
    }
});

router.get("/", async (req, res, next) => {
    const teams = await findAllTeamsForTenant(req.tenantId);

    return responseBuilder.sendSuccessResponse(res, teams);
});

router.get("/project/:id", async (req, res, next) => {
    const { id } = req.params;
    const teams = await findTeamForTenantByProjectId(req.tenantId, id);
    if (teams) {
        return responseBuilder.sendSuccessResponse(res, teams);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.TEAM_NOT_FOUND,
            CONSTANTS.TEAM_NOT_FOUND
        );
    }
});

router.get("/:id", async (req, res, next) => {
    const { id } = req.params;

    const team = await findTeamById(req.tenantId, id);
    if (team) {
        return responseBuilder.sendSuccessResponse(res, team);
    } else {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.TEAM_NOT_FOUND,
            CONSTANTS.TEAM_NOT_FOUND
        );
    }
});

router.put("/", async (req, res, next) => {
    let reqBody = {
        id: req.body.id,
        members: req.body.members,
        p_id: req.body.p_id,
    };

    if (helper.isEmpty(members) || !helper.validateObjectIdArray(members)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    if (helper.isEmpty(p_id)) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    try {
        const updatedTeam = await findTeamAndUpdateById(reqBody, req.tenantId);

        if (updatedTeam && updatedTeam.members.length > 0) {
            return responseBuilder.sendSuccessResponse(res, updatedTeam);
        } else {
            return responseBuilder.sendErrorResponse(
                res,
                ERROR.FAILED_TO_UPDATE_TEAM,
                CONSTANTS.FAILED_TO_UPDATE_TEAM
            );
        }
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_UPDATE_TEAM,
            CONSTANTS.FAILED_TO_UPDATE_TEAM,
            err
        );
    }
});

module.exports = router;
