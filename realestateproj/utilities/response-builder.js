const constants = require("../utilities/constants");

function sendSuccessResponse(res, data) {
    let response = {
        success: true,
        ...(data && { data }), // add data object if data is non-null
    };
    res.status(200).json(response);
    return;
}

function sendErrorResponse(res, code, msg, obj) {
    let errObj = {
        error_code: code || 500,
        error_msg: msg || constants.SOMETHING_WENT_WRONG,
    };
    if (obj) {
        errObj.error_obj = obj;
    }

    let response = {
        success: false,
        error: errObj,
    };
    res.status(400).json(response);
    return;
}

function sendServerError(res, err) {
    let response = {
        success: false,
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
