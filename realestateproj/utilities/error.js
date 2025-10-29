/* File Name  : error.js
 * Created By : Vishnu Satheesh
 * Date       : Oct 20 2025
 * Purpose    : Holds common error codes for the App
 */

module.exports = Object.freeze({
    /****************REGISTRATION MODULE : STARTS FROM 100 ********************/

    NO_ERROR: 0,
    SERVER_ERROR: 100,
    MISSING_PARAMETERS: 101,
    USERNAME_EXISTS: 102,
    USERNAME_DOESNT_EXISTS: 103,
    FAILED_TO_SET_PASSWORD: 104,
    INVALID_CREDENTIALS: 105,
    FAILED_TO_LOGIN: 106,
    USER_NOT_FOUND: 107,
    FAILED_TO_UPDATE_USER: 108,
    PROJECT_NAME_EXISTS: 109,
    SOMETHING_WENT_WRONG: 500,
});
