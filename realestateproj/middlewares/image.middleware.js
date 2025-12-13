const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Base directory outside project
const BASE_UPLOAD_DIR_LOCAL = path.join(__dirname, "../../uploads/images");
const BASE_UPLOAD_DIR_SERVER = path.join(__dirname, "../uploads/images");

function returnBaseDirectory(req) {
    if (req.app.get("env") === "development") {
        return BASE_UPLOAD_DIR_LOCAL;
    } else {
        return BASE_UPLOAD_DIR_SERVER;
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const tenantId = req.tenantId;
        if (!tenantId) {
            return cb(new Error("Tenant ID missing"), null);
        }
        try {
            const tenantDir = path.join(returnBaseDirectory(req), tenantId);
            if (!fs.existsSync(tenantDir)) {
                fs.mkdirSync(tenantDir, { recursive: true });
            }
            cb(null, tenantDir);
        } catch (error) {
            cb(null, false);
        }
    },

    filename: function (req, file, cb) {
        const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
        const uuid = uuidv4();
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${timestamp}-${uuid}${ext}`);
    },
});

// Allowed image types (iOS + Android)
const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "image/jpg",
];

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        allowedMimeTypes.includes(file.mimetype)
            ? cb(null, true)
            : cb(new Error("Only image files allowed"), false);
    },
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
    },
});

module.exports = upload;
