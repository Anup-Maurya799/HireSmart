import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Briefcase } from 'lucide-react';
import { getJobById } from '../services/jobService';

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);

  useEffect(() => {
    getJobById(id).then(({ data }) => setJob(data));
  }, [id]);

  if (!job) return <p className="text-center py-12 text-slate-400">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-ink">{job.title}</h1>
        <p className="text-slate-500 mt-1">{job.recruiter?.companyName}</p>

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
          <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
          <span className="flex items-center gap-1"><Briefcase size={14} /> {job.workMode} · {job.jobType}</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {job.skillsRequired.map((s) => (
            <span key={s} className="bg-secondary/20 text-primary-dark text-xs font-medium px-2.5 py-1 rounded-full">
              {s}
            </span>
          ))}
        </div>

        <p className="mt-6 text-ink whitespace-pre-line leading-relaxed">{job.description}</p>

        <button className="mt-8 w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-xl transition-colors">
          Apply Now (coming in Week 2)
        </button>
      </div>
    </div>
  );
};

export default JobDetails;