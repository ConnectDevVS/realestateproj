const Razorpay = require("razorpay");
const crypto = require("crypto");

function _getInstance() {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

async function createOrder(amount, metadata = {}) {
    const instance = _getInstance();
    return await instance.orders.create({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: metadata,
    });
}

function verifyPaymentSignature(orderId, paymentId, signature) {
    const generated = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");
    return generated === signature;
}

function verifyWebhookSignature(rawBody, signature) {
    const generated = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");
    return generated === signature;
}

async function fetchPayment(paymentId) {
    const instance = _getInstance();
    return await instance.payments.fetch(paymentId);
}

async function refundPayment(paymentId, amount = null) {
    const instance = _getInstance();
    const options = amount ? { amount: Math.round(amount * 100) } : {};
    return await instance.payments.refund(paymentId, options);
}

module.exports = {
    createOrder,
    verifyPaymentSignature,
    verifyWebhookSignature,
    fetchPayment,
    refundPayment,
};
