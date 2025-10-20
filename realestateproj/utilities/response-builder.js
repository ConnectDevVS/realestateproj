const constants = require("../utilities/constants");

function sendSuccessResponse(res, data) {
    let response = {
        status: true,
        results: data,
    };
    res.status(200).json(data);
    return;
}

function sendErrorResponse(res, code, msg, obj) {
    let errObj = {
        error_code: code,
        error_msg: msg,
    };
    if (obj) {
        errObj.error_obj = obj;
    }

    let response = {
        status: false,
        error: errObj,
    };
    res.status(400).json(response);
    return;
}

function sendServerError(res, err) {
    let response = {
        status: false,
        error: {
            error_msg: constants.SERVER_ERROR,
            error: err,
        },
    };
    res.status(500).json(response);
    return;
}

module.exports = {
    sendSuccessResponse: sendSuccessResponse,
    sendErrorResponse: sendErrorResponse,
    sendServerError: sendServerError,
};
