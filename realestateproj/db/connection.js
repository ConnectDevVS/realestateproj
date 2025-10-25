const mongoose = require("mongoose");

async function connectDB() {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/homesy";
    try {
        await mongoose.connect(uri);
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err.message);
        process.exit(1);
    }
}

module.exports = connectDB;
