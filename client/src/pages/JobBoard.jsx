import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import JobCard from '../components/JobCard';
import { getPublicJobs } from '../services/jobService';

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchJobs = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await getPublicJobs(params);
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs({ search });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink">Find your next opportunity</h1>
        <p className="text-slate-500 mt-1">Browse open roles from companies hiring right now</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by title, skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button
          type="submit"
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
        >
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-center text-slate-400">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p className="text-center text-slate-400">No jobs found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobBoard;