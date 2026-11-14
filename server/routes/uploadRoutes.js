import express from "express";
import upload, { verifyFileSignature } from "../middleware/upload.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { uploadResume } from "../controllers/uploadController.js";

const router = express.Router();

router.post(
  "/resume",
  protect,
  authorize("applicant"),
  upload.single("resume"),
  verifyFileSignature,
  uploadResume,
);

export default router;
