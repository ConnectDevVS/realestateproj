/**
 * One-time migration: moves CONSTRUCTION_FILE and CONTRACT_FILE uploads
 * from <base>/<tenantId>/<filename> to <base>/documents/<tenantId>/<filename>
 *
 * Run: NODE_ENV=production node scripts/migrate-documents.js
 */

require("dotenv").config();
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const isProd = process.env.NODE_ENV === "production";
const BASE_UPLOAD_DIR = isProd
    ? path.join(__dirname, "../public/uploads")
    : path.join(__dirname, "../../uploads");

async function run() {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/homesy";
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
    console.log("Base upload dir:", BASE_UPLOAD_DIR);

    // Bypass tenant plugin — query all tenants' documents directly
    const DocumentModel = require("../models/projectimage.model");
    const docs = await DocumentModel.collection
        .find({ type: { $in: ["CONSTRUCTION_FILE", "CONTRACT_FILE"] } })
        .toArray();

    console.log(`Found ${docs.length} document records\n`);

    let moved = 0;
    let alreadyCorrect = 0;
    let missing = 0;

    for (const doc of docs) {
        // URL format: /uploads/documents/<tenantId>/<filename>
        const parts = doc.url.split("/").filter(Boolean);
        if (parts.length < 3 || parts[1] !== "documents") {
            console.warn(`  [SKIP] Unexpected URL format: ${doc.url}`);
            continue;
        }

        const tenantId = parts[parts.length - 2];
        const filename = parts[parts.length - 1];

        const wrongPath = path.join(BASE_UPLOAD_DIR, tenantId, filename);
        const correctDir = path.join(BASE_UPLOAD_DIR, "documents", tenantId);
        const correctPath = path.join(correctDir, filename);

        if (fs.existsSync(correctPath)) {
            console.log(`  [OK]      ${doc.url}`);
            alreadyCorrect++;
            continue;
        }

        if (!fs.existsSync(wrongPath)) {
            console.warn(`  [MISSING] ${wrongPath}`);
            missing++;
            continue;
        }

        fs.mkdirSync(correctDir, { recursive: true });
        fs.renameSync(wrongPath, correctPath);
        console.log(`  [MOVED]   ${wrongPath}`);
        console.log(`         => ${correctPath}`);
        moved++;
    }

    console.log(`\nSummary: ${moved} moved | ${alreadyCorrect} already correct | ${missing} missing`);
    await mongoose.disconnect();
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
