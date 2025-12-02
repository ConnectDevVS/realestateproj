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
});
