const jwt = require("jsonwebtoken");
const config = require("../utilities/config");
let responseBuilder = require("../utilities/response-builder");
const ERROR = require("../utilities/error");
const CONSTANTS = require("../utilities/constants");

const JWT_SECRET = process.env.JWT_SECRET || config.JWT_SECRET;

function verifyToken(req, res, next) {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    if (!token) {
        return responseBuilder.sendErrorResponse(res, ERROR.UNAUTHORIZED, CONSTANTS.UNAUTHORIZED);
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return responseBuilder.sendErrorResponse(res, ERROR.UNAUTHORIZED, CONSTANTS.UNAUTHORIZED);
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return responseBuilder.sendErrorResponse(res, ERROR.FORBIDDEN, CONSTANTS.FORBIDDEN);
        }
        next();
    };
}

module.exports = { verifyToken, requireRole };
