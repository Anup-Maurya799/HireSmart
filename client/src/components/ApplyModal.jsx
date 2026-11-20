import { useState } from "react";
import toast from "react-hot-toast";
import { X, UploadCloud, FileText } from "lucide-react";
import { uploadResume } from "../services/uploadService";
import { applyToJob } from "../services/applicationService";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXT = [".pdf", ".docx"];

const ApplyModal = ({ job, onClose, onApplied }) => {
  const [file, setFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const name = selected.name.toLowerCase();
    if (!ALLOWED_EXT.some((ext) => name.endsWith(ext))) {
      toast.error("Only PDF or DOCX files are allowed");
      e.target.value = "";
      return;
    }
    if (selected.size > MAX_SIZE) {
      toast.error("File is too large (max 5 MB)");
      e.target.value = "";
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please attach your resume");

    setSubmitting(true);
    try {
      // Step 1: upload the resume to S3 through our API
      const formData = new FormData();
      formData.append("resume", file);
      const { data: uploaded } = await uploadResume(formData);

      // Step 2: create the application
      await applyToJob({
        jobId: job._id,
        coverLetter,
        resumeKey: uploaded.resumeKey,
        resumeOriginalName: uploaded.resumeOriginalName,
      });

      toast.success("Application submitted!");
      onApplied();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to submit application",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-ink">
              Apply for {job.title}
            </h2>
            <p className="text-sm text-slate-500">
              {job.recruiter?.companyName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block cursor-pointer border-2 border-dashed border-secondary rounded-xl p-6 text-center hover:bg-secondary/10 transition-colors">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFile}
              className="hidden"
            />
            {file ?
              <div className="flex items-center justify-center gap-2 text-primary-dark font-medium break-all">
                <FileText size={20} /> {file.name}
              </div>
            : <div className="text-slate-500">
                <UploadCloud className="mx-auto mb-2 text-primary" size={28} />
                <p className="text-sm font-medium">
                  Click to upload your resume
                </p>
                <p className="text-xs mt-1">PDF or DOCX, up to 5 MB</p>
              </div>
            }
          </label>

          <textarea
            placeholder="Cover letter (optional)"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={4}
            maxLength={2000}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyModal;
