// utils/otp.js
const crypto = require("crypto");

function generateOtp() {
    // Generates a random integer between 100000 (inclusive) and 1000000 (exclusive)
    const num = crypto.randomInt(100000, 1000000);
    return String(num);
}

module.exports = { generateOtp };
