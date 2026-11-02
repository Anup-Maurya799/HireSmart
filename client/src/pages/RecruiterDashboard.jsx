import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Archive, Pencil, X } from 'lucide-react';
import { getMyJobs, createJob, updateJob, archiveJob } from '../services/jobService';

const emptyForm = {
  title: '',
  description: '',
  location: '',
  jobType: 'Full-time',
  workMode: 'On-site',
  skillsRequired: '',
  experienceMin: 0,
  experienceMax: 0,
};

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const { data } = await getMyJobs();
      setJobs(data);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (job) => {
    setForm({ ...job, skillsRequired: job.skillsRequired.join(', ') });
    setEditingId(job._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      skillsRequired: form.skillsRequired.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await updateJob(editingId, payload);
        toast.success('Job updated');
      } else {
        await createJob(payload);
        toast.success('Job posted');
      }
      setShowForm(false);
      loadJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleArchiveToggle = async (id) => {
    try {
      await archiveJob(id);
      loadJobs();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-ink">Manage Job Listings</h1>
        <button
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={18} /> Post a Job
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : jobs.length === 0 ? (
        <p className="text-slate-400">You haven't posted any jobs yet.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-sm">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-base text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-ink">{job.title}</td>
                  <td className="px-4 py-3 text-slate-500">{job.location}</td>
                  <td className="px-4 py-3 text-slate-500">{job.jobType}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        job.status === 'active'
                          ? 'bg-accent/20 text-accent'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditForm(job)}
                        className="p-2 rounded-lg hover:bg-primary/10 text-primary-dark"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleArchiveToggle(job._id)}
                        className="p-2 rounded-lg hover:bg-highlight/20 text-orange-500"
                        title="Archive/Unarchive"
                      >
                        <Archive size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-ink">
                {editingId ? 'Edit Job' : 'Post a New Job'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                placeholder="Job title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <textarea
                placeholder="Job description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <input
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.jobType}
                  onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {['Full-time', 'Part-time', 'Internship', 'Contract'].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <select
                  value={form.workMode}
                  onChange={(e) => setForm({ ...form, workMode: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {['On-site', 'Remote', 'Hybrid'].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <input
                placeholder="Skills (comma separated: React, Node.js)"
                value={form.skillsRequired}
                onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Min experience"
                  value={form.experienceMin}
                  onChange={(e) => setForm({ ...form, experienceMin: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                  type="number"
                  placeholder="Max experience"
                  value={form.experienceMax}
                  onChange={(e) => setForm({ ...form, experienceMax: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-xl transition-colors"
              >
                {editingId ? 'Save Changes' : 'Post Job'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;