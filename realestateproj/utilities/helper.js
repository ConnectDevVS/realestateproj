/* File Name  : helper.js
 * Created By : Vishnu Satheesh
 * Date       : October 20 2025
 * Purpose    : Contains reusable helper methods
 */

var config = require("./config");
var mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;

function getMonthName(monthNumber) {
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    return monthNames[monthNumber];
}

function logg(msg) {
    if (config.log_enable == true) console.log(msg);
}

function isEmpty(str) {
    if (str != "" && str != null && typeof str !== undefined && str.length != 0) return false;
    else return true;
}

function arrayContains(needle, arrhaystack) {
    return arrhaystack.indexOf(needle) > -1;
}

function clearSpecialCharactersFromString(searchString) {
    if (searchString) {
        let newSearchString = searchString.replace(
            /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
            ""
        );
        return newSearchString;
    } else {
        return "";
    }
}

function returnBrowserType(request) {
    var ua = request.headers["user-agent"],
        $ = {};

    if (/mobile/i.test(ua)) $.Mobile = true;

    if (/like Mac OS X/.test(ua)) {
        $.iOS = /CPU( iPhone)? OS ([0-9\._]+) like Mac OS X/.exec(ua)[2].replace(/_/g, ".");
        $.iPhone = /iPhone/.test(ua);
        $.iPad = /iPad/.test(ua);
    }

    if (/Android/.test(ua)) $.Android = /Android ([0-9\.]+)[\);]/.exec(ua)[1];

    if (/webOS\//.test(ua)) $.webOS = /webOS\/([0-9\.]+)[\);]/.exec(ua)[1];

    if (/(Intel|PPC) Mac OS X/.test(ua))
        $.Mac = /(Intel|PPC) Mac OS X ?([0-9\._]*)[\)\;]/.exec(ua)[2].replace(/_/g, ".") || true;

    if (/Windows NT/.test(ua)) $.Windows = /Windows NT ([0-9\._]+)[\);]/.exec(ua)[1];

    console.log("User Agent:", $);
}

function returnJsonObjectAfterParse(jsonString) {
    if (config.parse_enable) {
        try {
            var obj = JSON.parse(jsonString);

            // Handle non-exception-throwing cases:
            // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
            // but... JSON.parse(null) returns 'null', and typeof null === "object",
            // so we must check for that, too.
            if (obj && typeof obj === "object" && obj !== null) {
                return obj;
            }
        } catch (e) {
            console.log("Exception captured : " + e);
        }

        return false;
    } else {
        return jsonString;
    }
}

function isValidMongoId(id) {
    return ObjectId.isValid(id);
}

function errorToObject(err) {
    const plain = {};
    Object.getOwnPropertyNames(err).forEach((key) => {
        plain[key] = err[key];
    });
    return plain;
}

module.exports = {
    logg: logg,
    isEmpty: isEmpty,
    returnJsonObjectAfterParse: returnJsonObjectAfterParse,
    arrayContains: arrayContains,
    getMonthName: getMonthName,
    returnBrowserType: returnBrowserType,
    clearSpecialCharactersFromString: clearSpecialCharactersFromString,
    isValidMongoId: isValidMongoId,
    errorToObject: errorToObject,
};
