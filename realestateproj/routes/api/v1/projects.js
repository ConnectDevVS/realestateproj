var express = require("express");
var router = express.Router();
let helper = require("../../../utilities/helper");
let responseBuilder = require("../../../utilities/response-builder");
const ERROR = require("../../../utilities/error");
const CONSTANTS = require("../../../utilities/constants");
const {
    createProjectForTenant,
    findProjectWithTitle,
} = require("../../../services/project.services");

router.post("/", async (req, res, next) => {
    let reqBody = {
        title: req.body.title,
        p_status: req.body.p_status,
        customer: req.body.customer,
        location: req.body.location,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        estimate: req.body.estimate,
        image: req.body.image,
    };
    let { title, p_status, customer, location, start_date, end_date, estimate, image } = reqBody;

    if (
        helper.isEmpty(title) ||
        helper.isEmpty(p_status) ||
        helper.isEmpty(customer) ||
        helper.isEmpty(location)
    ) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.MISSING_PARAMETERS,
            CONSTANTS.MISSING_PARAMETERS
        );
    }

    if (!helper.isEmpty(start_date)) {
        start_date = new Date(start_date);
    }
    if (!helper.isEmpty(end_date)) {
        end_date = new Date(end_date);
    }

    try {
        const existingProject = await findProjectWithTitle(title, req.tenantId);
        if (existingProject && existingProject.title === title) {
            return responseBuilder.sendErrorResponse(
                res,
                ERROR.PROJECT_NAME_EXISTS,
                CONSTANTS.PROJECT_NAME_EXISTS
            );
        }

        const project = await createProjectForTenant(req.tenantId, reqBody);
        if (project) {
            return responseBuilder.sendSuccessResponse(res, project);
        }
    } catch (err) {
        return responseBuilder.sendErrorResponse(
            res,
            ERROR.FAILED_TO_UPDATE_USER,
            CONSTANTS.FAILED_TO_UPDATE_USER,
            err
        );
    }
});

module.exports = router;
