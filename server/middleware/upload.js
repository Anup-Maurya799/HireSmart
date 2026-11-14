import multer from "multer";
import path from "path";

const ALLOWED_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = ALLOWED_TYPES[file.mimetype]?.includes(ext);

  if (!allowed) {
    const err = new Error("Only PDF or DOCX files are allowed");
    err.statusCode = 400;
    return cb(err, false);
  }
  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5 MB, one file
  fileFilter,
});

// Checks the real file signature (magic bytes), not just the claimed type
export const verifyFileSignature = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "Resume file is required" });
  }

  const { buffer, originalname } = req.file;
  const ext = originalname.toLowerCase().endsWith(".pdf") ? "pdf" : "docx";

  const isPdf = buffer.subarray(0, 4).toString() === "%PDF";
  const isZip = buffer[0] === 0x50 && buffer[1] === 0x4b; // DOCX is a zip file ("PK")

  if ((ext === "pdf" && !isPdf) || (ext === "docx" && !isZip)) {
    return res
      .status(400)
      .json({ message: "File content does not match its type" });
  }
  next();
};

export default upload;
