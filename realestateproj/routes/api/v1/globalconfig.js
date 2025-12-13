var express = require("express");
var router = express.Router();
let helper = require("../../../utilities/helper");
let responseBuilder = require("../../../utilities/response-builder");
const { getGlobalConfig } = require("../../../services/globalconfig.services.js");

router.get("/", (req, res, next) => {
    const globalConfig = getGlobalConfig();
    if (globalConfig) {
        return responseBuilder.sendSuccessResponse(res, globalConfig);
    }
});

module.exports = router;
