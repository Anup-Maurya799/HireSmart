import { Link } from "react-router-dom";
import { MapPin, Briefcase, Clock } from "lucide-react";

const JobCard = ({ job }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink text-lg leading-snug">
            {job.title}
          </h3>
          <p className="text-sm text-slate-500">{job.recruiter?.companyName}</p>
        </div>
        <span className="bg-accent/20 text-accent shrink-0 text-xs font-medium px-2.5 py-1 rounded-full">
          {job.jobType}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin size={14} /> {job.location}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase size={14} /> {job.workMode}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={14} /> {new Date(job.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {job.skillsRequired?.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="bg-secondary/20 text-primary-dark text-xs font-medium px-2.5 py-1 rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>

      <Link
        to={`/jobs/${job._id}`}
        className="mt-2 text-center bg-primary hover:bg-primary-dark text-white text-sm font-medium py-2 rounded-lg transition-colors"
      >
        View Details
      </Link>
    </div>
  );
};

export default JobCard;
