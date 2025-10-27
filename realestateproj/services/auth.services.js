const jwt = require("jsonwebtoken");
const config = require("../utilities/config");

const JWT_SECRET = process.env.JWT_SECRET || config.JWT_SECRET;
const JWT_EXPIRES_IN = config.JWT_EXPIRES_IN;

function generateToken(user) {
    const payload = {
        _id: user._id,
        username: user.username,
        role: user.role,
        // scope: user.scope,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return token;
}

module.exports = { generateToken };
