import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Briefcase, CheckCircle } from "lucide-react";
import { getJobById } from "../services/jobService";
import { getMyApplications } from "../services/applicationService";
import { useAuth } from "../context/AuthContext";
import ApplyModal from "../components/ApplyModal";

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [applied, setApplied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getJobById(id).then(({ data }) => setJob(data));
  }, [id]);

  // If an applicant is logged in, check whether they already applied
  useEffect(() => {
    if (user?.role !== "applicant") return;
    getMyApplications().then(({ data }) => {
      setApplied(data.some((a) => a.job?._id === id));
    });
  }, [id, user]);

  if (!job)
    return <p className="text-center py-12 text-slate-400">Loading...</p>;

  const renderAction = () => {
    if (job.status !== "active") {
      return (
        <button
          disabled
          className="mt-8 w-full bg-slate-200 text-slate-500 font-medium py-3 rounded-xl"
        >
          This job is no longer accepting applications
        </button>
      );
    }
    if (!user) {
      return (
        <Link
          to="/login"
          className="mt-8 block text-center w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-xl transition-colors"
        >
          Log in to apply
        </Link>
      );
    }
    if (user.role === "recruiter") {
      return (
        <p className="mt-8 text-sm text-slate-400 text-center">
          Recruiters cannot apply to jobs.
        </p>
      );
    }
    if (applied) {
      return (
        <div className="mt-8 flex items-center justify-center gap-2 w-full bg-accent/20 text-emerald-700 font-medium py-3 rounded-xl">
          <CheckCircle size={18} /> You have applied to this job
        </div>
      );
    }
    return (
      <button
        onClick={() => setShowModal(true)}
        className="mt-8 w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-xl transition-colors"
      >
        Apply Now
      </button>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-ink">{job.title}</h1>
        <p className="text-slate-500 mt-1">{job.recruiter?.companyName}</p>

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin size={14} /> {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase size={14} /> {job.workMode} · {job.jobType}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {job.skillsRequired.map((s) => (
            <span
              key={s}
              className="bg-secondary/20 text-primary-dark text-xs font-medium px-2.5 py-1 rounded-full"
            >
              {s}
            </span>
          ))}
        </div>

        <p className="mt-6 text-ink whitespace-pre-line leading-relaxed">
          {job.description}
        </p>

        {renderAction()}
      </div>

      {showModal && (
        <ApplyModal
          job={job}
          onClose={() => setShowModal(false)}
          onApplied={() => {
            setShowModal(false);
            setApplied(true);
          }}
        />
      )}
    </div>
  );
};

export default JobDetails;
