import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { MapPin, FileText } from "lucide-react";
import { getMyApplications } from "../services/applicationService";
import { getResumeUrl } from "../services/uploadService";

const STATUS_STYLES = {
  Applied: "bg-primary/15 text-primary-dark",
  Interview: "bg-highlight/40 text-orange-700",
  Offered: "bg-accent/25 text-emerald-700",
  Rejected: "bg-red-100 text-red-600",
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications()
      .then(({ data }) => setApplications(data))
      .catch(() => toast.error("Failed to load applications"))
      .finally(() => setLoading(false));
  }, []);

  const openResume = async (key) => {
    // Open the tab immediately so popup blockers allow it, then set the URL
    const tab = window.open("", "_blank");
    try {
      const { data } = await getResumeUrl(key);
      tab.location.href = data.url;
    } catch (err) {
      tab?.close();
      toast.error("Could not open resume");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-ink mb-1">My Applications</h1>
      <p className="text-slate-500 mb-6">Track every job you have applied to</p>

      {loading ?
        <p className="text-slate-400">Loading...</p>
      : applications.length === 0 ?
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <p className="text-slate-500 mb-3">
            You haven't applied to any jobs yet.
          </p>
          <Link to="/" className="text-primary-dark font-medium">
            Browse jobs →
          </Link>
        </div>
      : <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  {app.job ?
                    <Link
                      to={`/jobs/${app.job._id}`}
                      className="font-semibold text-lg text-ink hover:text-primary-dark"
                    >
                      {app.job.title}
                    </Link>
                  : <span className="font-semibold text-lg text-slate-400">
                      Job removed
                    </span>
                  }
                  <p className="text-sm text-slate-500">
                    {app.job?.recruiter?.companyName}
                  </p>
                  {app.job && (
                    <p className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                      <MapPin size={14} /> {app.job.location} ·{" "}
                      {app.job.jobType}
                    </p>
                  )}
                </div>
                <span
                  className={`self-start text-xs font-medium px-3 py-1 rounded-full ${STATUS_STYLES[app.status]}`}
                >
                  {app.status}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  onClick={() => openResume(app.resumeKey)}
                  className="flex items-center gap-2 text-sm text-primary-dark font-medium hover:underline self-start"
                >
                  <FileText size={16} />{" "}
                  {app.resumeOriginalName || "View resume"}
                </button>

                <ol className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  {app.statusHistory.map((h, i) => (
                    <li key={i}>
                      <span className="font-medium text-ink">{h.status}</span>{" "}
                      {new Date(h.changedAt).toLocaleDateString()}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
};

export default MyApplications;
