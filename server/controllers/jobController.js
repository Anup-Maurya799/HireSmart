import Job from "../models/Job.js";

// @route POST /api/jobs   (recruiter only)
export const createJob = async (req, res, next) => {
  try {
    const job = await Job.create({ ...req.body, recruiter: req.user._id });
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/jobs/mine   (recruiter only — jobs they posted)
export const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/jobs   (public job board — active jobs only, with search)
export const getPublicJobs = async (req, res, next) => {
  try {
    const { search, location, jobType, workMode } = req.query;
    const filter = { status: "active" };

    if (search) filter.$text = { $search: search };
    if (location) filter.location = new RegExp(location, "i");
    if (jobType) filter.jobType = jobType;
    if (workMode) filter.workMode = workMode;

    const jobs = await Job.find(filter)
      .populate("recruiter", "name companyName")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/jobs/:id
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "recruiter",
      "name companyName",
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    next(error);
  }
};

// Shared helper: confirms the job exists and belongs to the logged-in recruiter
const findOwnedJob = async (jobId, recruiterId) => {
  const job = await Job.findById(jobId);
  if (!job) return { error: 404, message: "Job not found" };
  if (job.recruiter.toString() !== recruiterId.toString()) {
    return { error: 403, message: "Not authorized to modify this job" };
  }
  return { job };
};

// @route PUT /api/jobs/:id   (recruiter only, own job)
export const updateJob = async (req, res, next) => {
  try {
    const { job, error, message } = await findOwnedJob(
      req.params.id,
      req.user._id,
    );
    if (error) return res.status(error).json({ message });

    Object.assign(job, req.body);
    await job.save();
    res.json(job);
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/jobs/:id/archive   (recruiter only, own job)
export const archiveJob = async (req, res, next) => {
  try {
    const { job, error, message } = await findOwnedJob(
      req.params.id,
      req.user._id,
    );
    if (error) return res.status(error).json({ message });

    job.status = job.status === "active" ? "archived" : "active";
    await job.save();
    res.json(job);
  } catch (error) {
    next(error);
  }
};
