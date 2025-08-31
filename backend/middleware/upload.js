// server/multerUpload.js
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

// ensure __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// where to store uploads (absolute path recommended)
const UPLOAD_DIR = path.join(__dirname, "../uploads");

// ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// safe filename generator
const safeName = (origName) => {
  const ext = path.extname(origName).toLowerCase();
  const name = crypto.randomBytes(10).toString("hex");
  return `${Date.now()}-${name}${ext}`;
};

// allowed mime types and extensions
const ALLOWED_MIMES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
]);
const ALLOWED_EXTS = new Set([".xlsx", ".xls"]);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // store in absolute upload dir
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    cb(null, safeName(file.originalname));
  },
});

// Set limits: 100 MB
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    // Basic MIME + extension check (extension as fallback)
    if (ALLOWED_MIMES.has(file.mimetype) && ALLOWED_EXTS.has(ext)) {
      return cb(null, true);
    }
    // Some clients may give different mimetypes — allow extension check as fallback:
    if (ALLOWED_EXTS.has(ext)) {
      return cb(null, true);
    }
    cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        "Only Excel files are allowed."
      )
    );
  },
});

export default upload;
