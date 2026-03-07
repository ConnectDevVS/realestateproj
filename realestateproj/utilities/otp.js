// utils/otp.js
const crypto = require("crypto");

function generateOtp() {
    // Generates a random integer between 100000 (inclusive) and 1000000 (exclusive)
    const num = crypto.randomInt(100000, 1000000);
    return String(num);
}

function generateInvoiceUniqueCode(length = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const bytes = crypto.randomBytes(length);
    let result = "";

    for (let i = 0; i < length; i++) {
        result += chars[bytes[i] % chars.length];
    }

    return result;
}

module.exports = { generateOtp, generateInvoiceUniqueCode };
