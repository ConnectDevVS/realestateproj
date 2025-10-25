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
    NOT_VALID_ID: "Not a valid id",
    UPLOAD_FAILED: "Upload failed",
    UNSUPPORTED_MIME_TYPE: "Only images are allowed, unsupported file type",
});
