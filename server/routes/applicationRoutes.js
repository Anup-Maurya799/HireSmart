import express from "express";
import {
  applyToJob,
  getMyApplications,
  getJobApplications,
} from "../controllers/applicationController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("applicant"), applyToJob);
router.get("/mine", protect, authorize("applicant"), getMyApplications);
router.get("/job/:jobId", protect, authorize("recruiter"), getJobApplications);

export default router;
