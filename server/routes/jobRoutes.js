import express from "express";
import { body } from "express-validator";
import {
  createJob,
  getMyJobs,
  getPublicJobs,
  getJobById,
  updateJob,
  archiveJob,
} from "../controllers/jobController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

const jobRules = [
  body("title").trim().notEmpty().withMessage("Job title is required"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Job description is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
];

// Public
router.get("/", getPublicJobs);
router.get("/:id", getJobById);

// Recruiter only
router.get("/mine/list", protect, authorize("recruiter"), getMyJobs);
router.post(
  "/",
  protect,
  authorize("recruiter"),
  jobRules,
  validate,
  createJob,
);
router.put("/:id", protect, authorize("recruiter"), updateJob);
router.patch("/:id/archive", protect, authorize("recruiter"), archiveJob);

export default router;
