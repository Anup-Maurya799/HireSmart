import Application from "../models/Application.js";
import Job from "../models/Job.js";

// @route POST /api/applications   (applicant only)
export const applyToJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter, resumeKey, resumeOriginalName } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "jobId is required" });
    }

    // The resume must live inside THIS applicant's own folder
    if (!resumeKey || !resumeKey.startsWith(`resumes/${req.user._id}/`)) {
      return res
        .status(400)
        .json({ message: "A valid uploaded resume is required" });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.status !== "active") {
      return res
        .status(400)
        .json({ message: "This job is no longer accepting applications" });
    }

    const existing = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "You have already applied to this job" });
    }

    // Only pick the fields we allow (no mass assignment)
    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      coverLetter,
      resumeKey,
      resumeOriginalName,
    });

    res.status(201).json({
      _id: application._id,
      status: application.status,
      createdAt: application.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/applications/mine   (applicant only, their own history)
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .select("-aiAnalysis") // candidates never see the AI evaluation
      .populate({
        path: "job",
        select: "title location jobType workMode status recruiter",
        populate: { path: "recruiter", select: "companyName" },
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/applications/job/:jobId   (recruiter only, must own the job)
export const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to view these applications" });
    }

    const applications = await Application.find({ job: job._id })
      .populate("applicant", "name email phone headline skills experienceYears")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

const STATUSES = ["Applied", "Interview", "Offered", "Rejected"];

// @route PATCH /api/applications/:id/status   (recruiter only, must own the job)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${STATUSES.join(", ")}`,
      });
    }

    const application = await Application.findById(req.params.id).populate(
      "job",
      "recruiter",
    );
    if (!application || !application.job) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Ownership check: the recruiter must own the job this application belongs to
    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this application" });
    }

    // Only write history when the status actually changes
    if (application.status !== status) {
      application.status = status;
      application.statusHistory.push({ status });
      await application.save();
      // Week 4: this is where we will trigger the status email
    }

    res.json({
      _id: application._id,
      status: application.status,
      statusHistory: application.statusHistory,
    });
  } catch (error) {
    next(error);
  }
};
