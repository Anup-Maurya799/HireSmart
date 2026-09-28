import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Applicant",
      required: true,
      index: true,
    },
    coverLetter: { type: String, trim: true },

    // Resume stored in S3 (Week 2). We store the KEY, not a public URL.
    resumeKey: { type: String, required: true },
    resumeOriginalName: { type: String },

    // Kanban pipeline
    status: {
      type: String,
      enum: ["Applied", "Interview", "Offered", "Rejected"],
      default: "Applied",
      index: true,
    },
    statusHistory: [statusHistorySchema],

    // AI analysis (filled in Week 3)
    aiAnalysis: {
      state: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
      },
      matchScore: { type: Number, min: 0, max: 100 },
      summary: { type: String },
      matchedSkills: [{ type: String }],
      missingSkills: [{ type: String }],
      experienceYears: { type: Number },
      analyzedAt: { type: Date },
    },
  },
  { timestamps: true },
);

// One applicant can apply to a job only once
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Record the first status automatically
applicationSchema.pre("save", function () {
  if (this.isNew) {
    this.statusHistory.push({ status: this.status });
  }
});

export default mongoose.model("Application", applicationSchema);
