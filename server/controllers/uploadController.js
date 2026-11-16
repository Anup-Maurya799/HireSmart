import Application from "../models/Application.js";
import { uploadToS3, getSignedDownloadUrl } from "../services/s3Service.js";

// @route GET /api/uploads/resume-url?key=resumes/...
export const getResumeUrl = async (req, res, next) => {
  try {
    const { key } = req.query;
    if (!key || !key.startsWith("resumes/")) {
      return res.status(400).json({ message: "Valid resume key is required" });
    }

    let allowed = false;

    if (req.role === "applicant") {
      // Applicants may only open files inside their own folder
      allowed = key.startsWith(`resumes/${req.user._id}/`);
    } else if (req.role === "recruiter") {
      // Recruiters may only open resumes submitted to THEIR jobs
      const application = await Application.findOne({
        resumeKey: key,
      }).populate("job", "recruiter");
      allowed =
        application &&
        application.job.recruiter.toString() === req.user._id.toString();
    }

    if (!allowed) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this resume" });
    }

    const url = await getSignedDownloadUrl(key);
    res.json({ url, expiresInSeconds: 300 });
  } catch (error) {
    next(error);
  }
};
