/* File Name  : constants.js
 * Created By : Vishnu Satheesh
 * Date       : Oct 20 2025
 * Purpose    : Holds global constants for the App
 */

/* Strings Naming Convention
 *  METHOD_PURPOSE_TYPE
 * ex: SIGNUP_SUCESS_MSG
 */

module.exports = Object.freeze({
    SUCCESS: "sucess",
    ERROR: "error",
    FAILED: "failed",
    SOMETHING_WENT_WRONG: "Something went wrong",
    SERVER_ERROR: "Server error occured",
    MISSING_PARAMETERS: "Missing parameters",
    USERNAME_EXISTS: "Username ealready exist",
    USERNAME_DOESNT_EXISTS: "User does not exist",
    FAILED_TO_SET_PASSWORD: "Failed to set password",
    INVALID_CREDENTIALS: "Invalid credentials",
    FAILED_TO_LOGIN: "Failed to login",
    USER_NOT_FOUND: "User not found",
    PROJECT_NAME_EXISTS: "Project name already exists",
    PROJECT_NOT_FOUND: "Project not found",
    INVALID_CUSTOMER: "Invalid customer Id",
    FAILED_TO_UPDATE_USER: "Failed to update user",
    FAILED_TO_UPDATE_PROJECT: "Failed to update project",
    FAILED_TO_CREATE_TEAM: "Failed to create team",
    TEAM_NOT_FOUND: "Team not found",
    FAILED_TO_UPDATE_TEAM: "Failed to update team",
    MEMBERS_CANNOT_BE_EMPTY: "Members cannot be empty",
    STAGES_NOT_FOUND: "Stages not found",
    FAILED_TO_CREATE_TRANSACTION: "Failed to create transaction",
    TRANSACTIONS_NOT_FOUND: "Transaction(s) not found",
    FAILED_TO_UPDATE_TRANSACTION: "Failed to update transaction",
    FAILED_TO_CREATE_STAGE: "Failed to create stage",
    FAILED_TO_UPDATE_STAGE: "Failed to update stage",
    FAILED_TO_CREATE_REQUEST: "Failed to create request",
    FAILED_TO_UPDATE_REQUEST: "Failed to update request",
    REQUEST_NOT_FOUND: "Request(s) not found",
    FAILED_TO_DELETE_REQUEST: "Failed to delete request",
    FAILED_TO_UPLOAD_IMAGE: "Failed to upload image",
    ERROR_GENERATING_INVOICE: "Error occured while generating invoice",
    FAILED_TO_CREATE_SUBCONTRACT: "Failed to create subcontract",
    SUBCONTRACT_NOT_FOUND: "Subcontract not found",
    FAILED_TO_UPDATE_SUBCONTRACT: "Failed to update subcontract",
    SUB_CON_COMMENT_CANNOT_BE_EMPTY: "Subcontractor comment cannot be empty",
    FAILED_TO_CREATE_COMPLAINT: "Failed to create complaint",
    FAILED_TO_UPDATE_COMPLAINT: "Failed to update complaint",
    COMPLAINT_COMMENT_CANNOT_BE_EMPTY: "complaint comment cannot be empty",
    COMPLAINT_NOT_FOUND: "Complaint not found",
});
