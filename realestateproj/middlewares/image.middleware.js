const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { fileTypes } = require("../utilities/roles");

// Base directory outside project
const BASE_UPLOAD_DIR_LOCAL = path.join(__dirname, "../../uploads");
const BASE_UPLOAD_DIR_SERVER = path.join(__dirname, "../public/uploads");

function returnBaseDirectory(req) {
    let baseUrl = "";
    if (req.app.get("env") === "development") {
        baseUrl = BASE_UPLOAD_DIR_LOCAL;
    } else {
        baseUrl = BASE_UPLOAD_DIR_SERVER;
    }
    console.log("---------baseUrl---------->");

    return baseUrl;
}

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        const tenantId = req.tenantId;
        if (!tenantId) {
            return cb(new Error("Tenant ID missing"), null);
        }
        try {
            let tenantDir = returnBaseDirectory(req);
            const fileType = req.headers['x-file-type'];
            console.log("---------Type---------->", fileType);

            if (fileType === fileTypes.PROFILE_ICON) {
                tenantDir = `${tenantDir}/profileicon`;
            } else if (fileType === fileTypes.PROJECT_ICON) {
                tenantDir = `${tenantDir}/projecticon`;
            } else if (fileType === fileTypes.IMAGE || fileType === fileTypes.COMPLAINT_IMAGE) {
                tenantDir = `${tenantDir}/images`;
            } else if (
                fileType === fileTypes.CONSTRUCTION_FILES ||
                fileType === fileTypes.CONTRACT_FILES
            ) {
                tenantDir = `${tenantDir}/documents`;
            } else {
                return cb(new Error(`Unknown x-file-type header: ${fileType}`), null);
            }
            tenantDir = path.join(tenantDir, tenantId);

            console.log("tenantDir:", tenantDir);

            if (!fs.existsSync(tenantDir)) {

                fs.mkdirSync(tenantDir, { recursive: true });
            }
            cb(null, tenantDir);
        } catch (error) {
            cb(null, false);
        }
    },

    filename: function (req, file, cb) {
        console.log("---------filename---------->");
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

    // Documents
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
];

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        allowedMimeTypes.includes(file.mimetype)
            ? cb(null, true)
            : cb(new Error("unsupported file type"), false);
    },
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
    },
});

module.exports = upload;
