import { uploadToS3 } from "../services/s3Service.js";

// @route POST /api/uploads/resume   (applicant only)
export const uploadResume = async (req, res, next) => {
  try {
    const resumeKey = await uploadToS3(req.file, req.user._id);

    res.status(201).json({
      resumeKey,
      resumeOriginalName: req.file.originalname,
    });
  } catch (error) {
    next(error);
  }
};
