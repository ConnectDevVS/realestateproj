const mongoose = require("mongoose");

async function connectDB() {
    console.log("Herreeeeeee");

    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/homesy";
    try {
        console.log("Herreeeeeee 2", uri);

        await mongoose.connect(uri);
        console.log("✅ MongoDB connected");
    } catch (err) {
        console.log("Herreeeeeee 3", uri);

        console.error("❌ MongoDB connection failed:", err.message);
        process.exit(1);
    }
}

module.exports = connectDB;
